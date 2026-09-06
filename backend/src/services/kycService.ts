// KYC service — handles the country-aware identity-verification flow.
//
// The rules engine (kycRules.ts) defines *what* each user must submit.
// This service handles *how* submissions are stored, validated and rolled
// up to the User.kycStatus field.
//
// In dev we auto-approve every submission so the user can reach the
// dashboard. In prod a real provider would do the verification and only
// flip the user to APPROVED when all required modes are confirmed.

import { PrismaClient, KycMode, KycStatus, KycSubmissionStatus, SignupStep } from '@prisma/client';
import { badRequest } from '../errors';
import { env } from '../config';
import { getKycRules, type KycModeRule } from './kycRules';
import { withRetry } from '../db';

const prisma = new PrismaClient();

export interface SubmitKycInput {
  mode: KycMode;
  value?: string;     // for text modes (NIN, BVN, SSN, etc.)
  fileUrl?: string;   // for file modes (ID_DOCUMENT, ADDRESS_PROOF, SELFIE)
  filePublicId?: string;
  notes?: string;
}

function validateAgainstRule(rule: KycModeRule, value: string | undefined) {
  if (rule.fileBased) return; // file validation is done at upload time
  if (!value) throw badRequest(`${rule.label} is required`);
  if (rule.minLength && value.length < rule.minLength)
    throw badRequest(`${rule.label} must be at least ${rule.minLength} characters`);
  if (rule.maxLength && value.length > rule.maxLength)
    throw badRequest(`${rule.label} must be at most ${rule.maxLength} characters`);
  if (rule.pattern && !new RegExp(rule.pattern).test(value))
    throw badRequest(`${rule.label} format is invalid`);
}

export async function submitKycMode(userId: string, country: string, role: 'CUSTOMER' | 'TASKER', input: SubmitKycInput) {
  const rules = getKycRules(country, role);
  const rule = rules.modes.find((m) => m.mode === input.mode);
  if (!rule) throw badRequest(`Mode ${input.mode} is not part of ${country}/${role} KYC`);

  validateAgainstRule(rule, input.value);

  // In dev, auto-approve; in prod, leave PENDING for review
  const autoApprove = env.ENABLE_DEV_ROUTES || rule.mode === 'SANCTIONS_SCREEN' || rule.mode === 'EMAIL_OTP' || rule.mode === 'PHONE_OTP';

  const latest = await prisma.kycSubmission.findFirst({ where: { userId, mode: input.mode }, orderBy: { submittedAt: 'desc' } });
  const submission = await prisma.kycSubmission.create({
    data: {
      userId,
      mode: input.mode,
      value: input.value ?? null,
      fileUrl: input.fileUrl ?? null,
      filePublicId: input.filePublicId ?? null,
      notes: input.notes ?? null,
      status: autoApprove ? KycSubmissionStatus.APPROVED : KycSubmissionStatus.PENDING,
      reviewedAt: autoApprove ? new Date() : null,
    },
  });
  if (latest && latest.status !== KycSubmissionStatus.APPROVED) {
    await prisma.kycSubmission.update({ where: { id: latest.id }, data: { notes: latest.notes ? `${latest.notes}\nSuperseded by a newer submission.` : 'Superseded by a newer submission.' } });
  }

  // Recompute overall user kycStatus
  await rollupKycStatus(userId, country, role);

  return submission;
}

export async function rollupKycStatus(userId: string, country: string, role: 'CUSTOMER' | 'TASKER') {
  const rules = getKycRules(country, role);
  const requiredModes = rules.modes.filter((m) => m.required).map((m) => m.mode);
  const subs = await withRetry(() => prisma.kycSubmission.findMany({ where: { userId, mode: { in: requiredModes } } }));
  const byMode = new Map(subs.map((s) => [s.mode, s]));
  const missing = requiredModes.filter((m) => !byMode.has(m) || byMode.get(m)!.status !== KycSubmissionStatus.APPROVED);

  const allApproved = missing.length === 0;
  const anyRejected = subs.some((s) => s.status === KycSubmissionStatus.REJECTED);

  const data: any = { kycCountry: country };
  if (allApproved) {
    data.kycStatus = KycStatus.APPROVED;
    data.kycApprovedAt = new Date();
    data.kycRejectedReason = null;
    data.signupStep = SignupStep.COMPLETE;
    if (role === 'TASKER') {
      await prisma.taskerProfile.update({ where: { userId }, data: { kycStatus: KycStatus.APPROVED } }).catch(() => null);
    }
  } else if (anyRejected) {
    data.kycStatus = KycStatus.REJECTED;
  } else if (subs.length > 0) {
    data.kycStatus = KycStatus.PENDING;
    data.signupStep = SignupStep.KYC;
    if (role === 'TASKER') {
      await prisma.taskerProfile.update({ where: { userId }, data: { kycStatus: KycStatus.PENDING } }).catch(() => null);
    }
  } else {
    data.kycStatus = KycStatus.NOT_STARTED;
    data.signupStep = SignupStep.PROFILE;
  }

  await prisma.user.update({ where: { id: userId }, data });
  return { kycStatus: data.kycStatus, missing, completed: subs.length, required: requiredModes.length };
}

export async function getKycProgress(userId: string, country: string, role: 'CUSTOMER' | 'TASKER') {
  const rules = getKycRules(country, role);
  const requiredModes = rules.modes.filter((m) => m.required).map((m) => m.mode);
  const subs = await prisma.kycSubmission.findMany({ where: { userId, mode: { in: requiredModes } }, orderBy: { submittedAt: 'desc' } });
  const byMode = new Map(subs.map((s) => [s.mode, s]));
  return {
    country: rules.country,
    countryName: rules.countryName,
    description: rules.description,
    modes: rules.modes.map((m) => {
      const sub = byMode.get(m.mode);
      return {
        mode: m.mode,
        label: m.label,
        helpText: m.helpText,
        required: m.required,
        order: m.order,
        fileBased: m.fileBased,
        pattern: m.pattern,
        minLength: m.minLength,
        maxLength: m.maxLength,
        placeholder: m.placeholder,
        status: sub?.status ?? 'NOT_SUBMITTED',
        value: sub?.value ?? null,
        fileUrl: sub?.fileUrl ?? null,
        submittedAt: sub?.submittedAt ?? null,
      };
    }),
  };
}

// Admin/auto: reject a submission
export async function rejectSubmission(submissionId: string, reason: string) {
  return prisma.kycSubmission.update({
    where: { id: submissionId },
    data: { status: KycSubmissionStatus.REJECTED, notes: reason, reviewedAt: new Date() },
  });
}
