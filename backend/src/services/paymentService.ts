import { PrismaClient, PaymentStatus, PayoutStatus } from '@prisma/client';
import { badRequest, forbidden, notFound } from '../errors';
import { notify } from './notify';

const prisma = new PrismaClient();
const FLUTTERWAVE_URL = 'https://api.flutterwave.com/v3';
const PLATFORM_FEE_RATE = 0.2;

async function recordTransaction(data: {
  userId: string;
  paymentId?: string;
  payoutId?: string;
  type: 'PAYMENT_ESCROWED' | 'PLATFORM_FEE' | 'TASKER_EARNED' | 'REFUND' | 'PAYOUT_REQUESTED' | 'PAYOUT_COMPLETED' | 'PAYOUT_FAILED' | 'ADJUSTMENT';
  amount: number;
  currency: string;
  reference: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.walletTransaction.upsert({
    where: { userId_type_reference: { userId: data.userId, type: data.type, reference: data.reference } },
    update: {},
    create: {
      userId: data.userId,
      paymentId: data.paymentId,
      payoutId: data.payoutId,
      type: data.type,
      amount: data.amount,
      currency: data.currency,
      reference: data.reference,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    },
  });
}

function requireFlutterwave() {
  const key = process.env.FLW_SECRET_KEY;
  if (!key) throw badRequest('Payments are not configured. Add FLW_SECRET_KEY to the backend environment.');
  return key;
}

async function flutterwave<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${FLUTTERWAVE_URL}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${requireFlutterwave()}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  const body = await response.json().catch(() => ({})) as { status?: string; message?: string };
  if (!response.ok || body.status === 'error') throw badRequest(body.message || 'Flutterwave request failed');
  return body as T;
}

function minorUnits(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) throw badRequest('Invalid amount');
  return Math.round(amount * 100);
}

function currency(value: string) {
  const result = value.toUpperCase();
  if (!/^[A-Z]{3}$/.test(result)) throw badRequest('Unsupported currency');
  return result;
}

function paymentAmounts(price: number) {
  const platformFee = Number((price * PLATFORM_FEE_RATE).toFixed(2));
  return { grossAmount: price, platformFee, taskerAmount: Number((price - platformFee).toFixed(2)) };
}

export async function createBankSetup(userId: string, bankCode: string, accountNumber: string, country: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user) throw notFound();
  if (user.role !== 'TASKER') throw forbidden('Only taskers can set up payouts.');
  if (!/^[A-Za-z0-9]{3,20}$/.test(bankCode) || !/^\d{6,20}$/.test(accountNumber)) throw badRequest('Enter a valid bank and account number.');
  const result = await flutterwave<{ data: { account_name: string } }>('/accounts/resolve', {
    method: 'POST',
    body: JSON.stringify({ account_number: accountNumber, account_bank: bankCode, country: country.toUpperCase() }),
  });
  await prisma.user.update({ where: { id: userId }, data: { flutterwaveBankCode: bankCode, flutterwaveAccountNumber: accountNumber, flutterwaveAccountName: result.data.account_name } });
  return { verified: true, accountName: result.data.account_name };
}

export async function listBanks(country: string) {
  const result = await flutterwave<{ data: Array<{ id: number; code: string; name: string }> }>(`/banks/${country.toUpperCase()}`);
  return result.data;
}

export async function getPayoutStatus(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, flutterwaveBankCode: true, flutterwaveAccountNumber: true, flutterwaveAccountName: true } });
  if (!user) throw notFound();
  return { connected: Boolean(user.flutterwaveBankCode && user.flutterwaveAccountNumber), accountName: user.flutterwaveAccountName };
}

async function getHirePayment(customerId: string, hireId: string) {
  const hire = await prisma.hire.findUnique({ where: { id: hireId }, include: { offer: true, task: true } });
  if (!hire || hire.customerId !== customerId) throw forbidden();
  if (!hire.offer) throw badRequest('This hire has no offer to pay');
  const amounts = paymentAmounts(hire.offer.price);
  const payment = await prisma.platformPayment.upsert({
    where: { hireId },
    update: { ...amounts, currency: hire.offer.currency },
    create: { hireId, taskerId: hire.taskerId, customerId, ...amounts, currency: hire.offer.currency },
  });
  if (payment.status === PaymentStatus.ESCROWED || payment.status === PaymentStatus.RELEASED) throw badRequest('This hire has already been paid.');
  return { hire, payment, amounts };
}

export async function createHirePayment(customerId: string, hireId: string, redirectUrl: string) {
  const { hire, payment, amounts } = await getHirePayment(customerId, hireId);
  const reference = `tasksphere-${hireId}-${Date.now()}`;
  const result = await flutterwave<{ data: { link: string } }>('/payments', {
    method: 'POST',
    body: JSON.stringify({
      tx_ref: reference,
      amount: amounts.grossAmount,
      currency: currency(hire.offer!.currency),
      redirect_url: redirectUrl,
      payment_options: 'card,banktransfer,ussd',
      customer: { email: (await prisma.user.findUniqueOrThrow({ where: { id: customerId }, select: { email: true } })).email },
      customizations: { title: 'TaskSphere task payment', description: hire.task.title },
      meta: { paymentId: payment.id, hireId },
    }),
  });
  await prisma.platformPayment.update({ where: { id: payment.id }, data: { status: PaymentStatus.PROCESSING, flutterwaveTransactionId: reference } });
  return { checkoutUrl: result.data.link, paymentId: payment.id, ...amounts, currency: hire.offer!.currency };
}

export const createHireCheckout = createHirePayment;

export async function requestPayout(userId: string, amount: number, currencyValue: string, bankCode?: string, accountNumber?: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, email: true, flutterwaveBankCode: true, flutterwaveAccountNumber: true, flutterwaveAccountName: true } });
  if (!user) throw notFound();
  if (user.role !== 'TASKER') throw forbidden('Only taskers can withdraw earnings.');
  const bank = bankCode || user.flutterwaveBankCode;
  const account = accountNumber || user.flutterwaveAccountNumber;
  if (!bank || !account) throw badRequest('Verify your local bank account before withdrawing.');
  const released = await prisma.platformPayment.aggregate({ where: { taskerId: userId, status: PaymentStatus.RELEASED, currency: currency(currencyValue) }, _sum: { taskerAmount: true } });
  const withdrawn = await prisma.payout.aggregate({ where: { userId, currency: currency(currencyValue), status: { in: [PayoutStatus.PROCESSING, PayoutStatus.COMPLETED] } }, _sum: { amount: true } });
  const available = (released._sum.taskerAmount || 0) - (withdrawn._sum.amount || 0);
  if (amount > available) throw badRequest(`Insufficient available balance. Available: ${available.toFixed(2)} ${currency(currencyValue)}.`);
  const payout = await prisma.payout.create({ data: { userId, amount, currency: currency(currencyValue), bankCode: bank, accountNumber: account, accountName: user.flutterwaveAccountName, status: PayoutStatus.PROCESSING } });
  await recordTransaction({ userId, payoutId: payout.id, type: 'PAYOUT_REQUESTED', amount: -amount, currency: payout.currency, reference: `payout-requested-${payout.id}` });
  try {
    const result = await flutterwave<{ data: { id: number; status: string } }>('/transfers', {
      method: 'POST',
      body: JSON.stringify({ account_bank: bank, account_number: account, amount, currency: currency(currencyValue), beneficiary_name: user.flutterwaveAccountName || user.email, narration: 'TaskSphere payout', reference: `tasksphere-payout-${payout.id}` }),
    });
    const updated = await prisma.payout.update({ where: { id: payout.id }, data: { providerRef: String(result.data.id), status: result.data.status === 'SUCCESSFUL' ? PayoutStatus.COMPLETED : PayoutStatus.PROCESSING, completedAt: result.data.status === 'SUCCESSFUL' ? new Date() : null } });
    if (updated.status === PayoutStatus.COMPLETED) {
      await recordTransaction({ userId, payoutId: updated.id, type: 'PAYOUT_COMPLETED', amount: -updated.amount, currency: updated.currency, reference: `payout-completed-${updated.id}` });
      await notify({ userId, type: 'PAYOUT_COMPLETED', title: 'Payout completed', body: `${updated.currency} ${updated.amount.toFixed(2)} has been sent to your bank account.` });
    }
    return updated;
  } catch (error) {
    await prisma.payout.update({ where: { id: payout.id }, data: { status: PayoutStatus.FAILED, failureReason: error instanceof Error ? error.message : 'Transfer failed' } });
    await recordTransaction({ userId, payoutId: payout.id, type: 'PAYOUT_FAILED', amount, currency: payout.currency, reference: `payout-failed-${payout.id}` });
    throw error;
  }
}

export async function listPayments(userId: string) {
  const [payments, payouts, transactions] = await Promise.all([
    prisma.platformPayment.findMany({ where: { OR: [{ customerId: userId }, { taskerId: userId }] }, orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.payout.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.walletTransaction.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 100 }),
  ]);
  const escrow = payments.filter((p) => p.status === PaymentStatus.ESCROWED).reduce((sum, p) => sum + p.grossAmount, 0);
  const earnings = payments.filter((p) => p.taskerId === userId && p.status === PaymentStatus.RELEASED).reduce((sum, p) => sum + p.taskerAmount, 0);
  const withdrawn = payouts.filter((p) => p.status === PayoutStatus.COMPLETED).reduce((sum, p) => sum + p.amount, 0);
  return {
    payments,
    payouts: payouts.map((payout) => ({ ...payout, accountNumber: `****${payout.accountNumber.slice(-4)}` })),
    transactions,
    wallet: { escrow, earnings, withdrawn, available: Math.max(0, earnings - withdrawn) },
  };
}

export async function releaseHirePayment(hireId: string) {
  const payment = await prisma.platformPayment.findUnique({ where: { hireId } });
  if (payment?.status === PaymentStatus.ESCROWED) await prisma.platformPayment.update({ where: { id: payment.id }, data: { status: PaymentStatus.RELEASED, releasedAt: new Date() } });
  if (payment?.status === PaymentStatus.ESCROWED) {
    await recordTransaction({ userId: payment.taskerId, paymentId: payment.id, type: 'TASKER_EARNED', amount: payment.taskerAmount, currency: payment.currency, reference: `tasker-earned-${payment.id}` });
    await recordTransaction({ userId: payment.customerId, paymentId: payment.id, type: 'PLATFORM_FEE', amount: -payment.platformFee, currency: payment.currency, reference: `platform-fee-${payment.id}` });
    await notify({ userId: payment.taskerId, type: 'PAYMENT_RELEASED', title: 'Payment released', body: `${payment.currency} ${payment.taskerAmount.toFixed(2)} is now available in your wallet.` });
  }
}

export async function refundPayment(paymentId: string, actorId?: string) {
    const payment = await prisma.platformPayment.findUnique({ where: { id: paymentId } });
    if (!payment) throw notFound();
    if (payment.status !== PaymentStatus.ESCROWED && payment.status !== PaymentStatus.PROCESSING) throw badRequest('This payment cannot be refunded in its current state.');
    if (payment.flutterwaveTransactionId) {
      await flutterwave(`/transactions/${payment.flutterwaveTransactionId}/refund`, { method: 'POST', body: JSON.stringify({ amount: payment.grossAmount }) });
    }
    const updated = await prisma.platformPayment.update({ where: { id: payment.id }, data: { status: PaymentStatus.REFUNDED, refundedAt: new Date() } });
    await recordTransaction({ userId: payment.customerId, paymentId: payment.id, type: 'REFUND', amount: payment.grossAmount, currency: payment.currency, reference: `refund-${payment.id}`, metadata: { actorId } });
    await notify({ userId: payment.customerId, type: 'GENERIC', title: 'Payment refunded', body: `${payment.currency} ${payment.grossAmount.toFixed(2)} has been refunded.` });
    return updated;
}

export async function handleWebhook(rawBody: Buffer, signature: string) {
  const expected = process.env.FLW_SECRET_HASH;
  if (!expected || signature !== expected) throw forbidden('Invalid Flutterwave webhook signature');
  const event = JSON.parse(rawBody.toString());
  if (event.event === 'charge.completed' && event.data?.status === 'successful') {
    const paymentId = event.data.meta?.paymentId;
    if (paymentId) {
      const existing = await prisma.platformPayment.findUnique({ where: { id: paymentId } });
      if (!existing) throw notFound('Payment not found');
      if (existing.status === PaymentStatus.ESCROWED || existing.status === PaymentStatus.RELEASED || existing.status === PaymentStatus.REFUNDED) return { received: true };
      const payment = await prisma.platformPayment.update({ where: { id: paymentId }, data: { status: PaymentStatus.ESCROWED, paidAt: new Date(), flutterwaveTransactionId: String(event.data.id) } });
      await recordTransaction({ userId: payment.customerId, paymentId: payment.id, type: 'PAYMENT_ESCROWED', amount: -payment.grossAmount, currency: payment.currency, reference: `payment-escrowed-${payment.id}` });
      await notify({ userId: payment.customerId, type: 'PAYMENT_ESCROWED', title: 'Payment secured', body: `${payment.currency} ${payment.grossAmount.toFixed(2)} is held securely for this task.` });
    }
  }
  if (event.event === 'transfer.completed' || event.event === 'transfer.failed') {
    const providerRef = String(event.data?.id || '');
    await prisma.payout.updateMany({ where: { providerRef }, data: { status: event.event === 'transfer.completed' ? PayoutStatus.COMPLETED : PayoutStatus.FAILED, completedAt: event.event === 'transfer.completed' ? new Date() : null } });
  }
  return { received: true };
}

export async function getPayment(userId: string, paymentId: string) {
  const payment = await prisma.platformPayment.findUnique({ where: { id: paymentId } });
  if (!payment) throw notFound();
  if (payment.customerId !== userId && payment.taskerId !== userId) throw forbidden();
  return payment;
}
