import { PrismaClient, PaymentStatus, PayoutStatus } from '@prisma/client';
import { badRequest, forbidden, notFound } from '../errors';

const prisma = new PrismaClient();
const FLUTTERWAVE_URL = 'https://api.flutterwave.com/v3';
const PLATFORM_FEE_RATE = 0.2;

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
  const payout = await prisma.payout.create({ data: { userId, amount, currency: currency(currencyValue), bankCode: bank, accountNumber: account, accountName: user.flutterwaveAccountName, status: PayoutStatus.PROCESSING } });
  try {
    const result = await flutterwave<{ data: { id: number; status: string } }>('/transfers', {
      method: 'POST',
      body: JSON.stringify({ account_bank: bank, account_number: account, amount, currency: currency(currencyValue), beneficiary_name: user.flutterwaveAccountName || user.email, narration: 'TaskSphere payout', reference: `tasksphere-payout-${payout.id}` }),
    });
    const updated = await prisma.payout.update({ where: { id: payout.id }, data: { providerRef: String(result.data.id), status: result.data.status === 'SUCCESSFUL' ? PayoutStatus.COMPLETED : PayoutStatus.PROCESSING, completedAt: result.data.status === 'SUCCESSFUL' ? new Date() : null } });
    return updated;
  } catch (error) {
    await prisma.payout.update({ where: { id: payout.id }, data: { status: PayoutStatus.FAILED, failureReason: error instanceof Error ? error.message : 'Transfer failed' } });
    throw error;
  }
}

export async function listPayments(userId: string) {
  const [payments, payouts] = await Promise.all([
    prisma.platformPayment.findMany({ where: { OR: [{ customerId: userId }, { taskerId: userId }] }, orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.payout.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 100 }),
  ]);
  const escrow = payments.filter((p) => p.status === PaymentStatus.ESCROWED).reduce((sum, p) => sum + p.grossAmount, 0);
  const earnings = payments.filter((p) => p.taskerId === userId && p.status === PaymentStatus.RELEASED).reduce((sum, p) => sum + p.taskerAmount, 0);
  const withdrawn = payouts.filter((p) => p.status === PayoutStatus.COMPLETED).reduce((sum, p) => sum + p.amount, 0);
  return { payments, payouts, wallet: { escrow, earnings, withdrawn, available: Math.max(0, earnings - withdrawn) } };
}

export async function releaseHirePayment(hireId: string) {
  const payment = await prisma.platformPayment.findUnique({ where: { hireId } });
  if (payment?.status === PaymentStatus.ESCROWED) await prisma.platformPayment.update({ where: { id: payment.id }, data: { status: PaymentStatus.RELEASED, releasedAt: new Date() } });
}

export async function handleWebhook(rawBody: Buffer, signature: string) {
  const expected = process.env.FLW_SECRET_HASH;
  if (!expected || signature !== expected) throw forbidden('Invalid Flutterwave webhook signature');
  const event = JSON.parse(rawBody.toString());
  if (event.event === 'charge.completed' && event.data?.status === 'successful') {
    const paymentId = event.data.meta?.paymentId;
    if (paymentId) await prisma.platformPayment.update({ where: { id: paymentId }, data: { status: PaymentStatus.ESCROWED, paidAt: new Date(), flutterwaveTransactionId: String(event.data.id) } });
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
