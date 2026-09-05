// Per-country, per-role KYC rules engine.
//
// Each country gets a tailored set of verification modes. Some are file-based
// (e.g. ID document upload), some are value-based (e.g. national ID number),
// some are automated (phone OTP, email OTP, sanctions screen).
//
// This is the *single source of truth* for "what does a user from X need to
// provide before they can use TaskSphere?". The schema only stores the
// canonical list in `KycRequirement` — this file seeds it on boot, and the
// /api/auth/kyc/requirements endpoint returns it to the UI.

import type { Role, KycMode } from '@prisma/client';

export interface KycModeRule {
  mode: KycMode;
  label: string;
  helpText: string;
  required: boolean;
  order: number;
  fileBased: boolean;
  pattern?: string;       // regex enforced by the server on submit
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
}

export interface CountryKycRule {
  country: string;         // ISO-2
  countryName: string;
  customerModes: KycModeRule[];
  taskerModes: KycModeRule[];
  // Optional human description shown at the top of the KYC screen
  description: string;
}

// ---------- shared building blocks ----------

const PHONE_OTP: KycModeRule = {
  mode: 'PHONE_OTP',
  label: 'Verify your phone',
  helpText: 'We’ll send a 6-digit code by SMS. Standard rates may apply.',
  required: true,
  order: 1,
  fileBased: false,
  pattern: '^\\+[1-9]\\d{6,14}$',
  placeholder: '+15551234567',
};

const EMAIL_OTP: KycModeRule = {
  mode: 'EMAIL_OTP',
  label: 'Verify your email',
  helpText: 'We’ll send a one-time link to your inbox.',
  required: true,
  order: 0,
  fileBased: false,
};

const ID_DOC: KycModeRule = {
  mode: 'ID_DOCUMENT',
  label: 'Government-issued ID',
  helpText: 'A clear photo of your national ID, passport or driver’s licence. Both sides if applicable.',
  required: true,
  order: 3,
  fileBased: true,
};

const SELFIE: KycModeRule = {
  mode: 'SELFIE',
  label: 'Liveness selfie',
  helpText: 'A short selfie video. We compare it to your ID to confirm you’re a real person.',
  required: true,
  order: 4,
  fileBased: true,
};

const ADDRESS_PROOF: KycModeRule = {
  mode: 'ADDRESS_PROOF',
  label: 'Proof of address',
  helpText: 'A utility bill or bank statement from the last 3 months showing your name and address.',
  required: false,
  order: 5,
  fileBased: true,
};

const SANCTIONS: KycModeRule = {
  mode: 'SANCTIONS_SCREEN',
  label: 'Sanctions & PEP check',
  helpText: 'We screen your details against global sanctions and politically-exposed-person lists. No action needed.',
  required: true,
  order: 99,
  fileBased: false,
};

// ---------- per-country rules ----------

const NG: CountryKycRule = {
  country: 'NG',
  countryName: 'Nigeria',
  description: 'TaskSphere uses BVN and NIN verification through approved providers, plus an ID photo and liveness check.',
  customerModes: [
    EMAIL_OTP,
    PHONE_OTP,
    {
      mode: 'NATIONAL_ID_NUMBER',
      label: 'NIN (National Identification Number)',
      helpText: 'Your 11-digit National Identification Number issued by NIMC.',
      required: true,
      order: 2,
      fileBased: false,
      pattern: '^\\d{11}$',
      minLength: 11,
      maxLength: 11,
      placeholder: '12345678901',
    },
    {
      mode: 'BANK_VERIFICATION',
      label: 'BVN (Bank Verification Number)',
      helpText: 'Your 11-digit BVN. We use it to confirm your identity with your bank.',
      required: true,
      order: 3,
      fileBased: false,
      pattern: '^\\d{11}$',
      minLength: 11,
      maxLength: 11,
      placeholder: '12345678901',
    },
    SANCTIONS,
  ],
  taskerModes: [
    EMAIL_OTP,
    PHONE_OTP,
    {
      mode: 'NATIONAL_ID_NUMBER',
      label: 'NIN (National Identification Number)',
      helpText: 'Your 11-digit National Identification Number.',
      required: true,
      order: 2,
      fileBased: false,
      pattern: '^\\d{11}$',
      minLength: 11,
      maxLength: 11,
      placeholder: '12345678901',
    },
    {
      mode: 'BANK_VERIFICATION',
      label: 'BVN (Bank Verification Number)',
      helpText: 'We verify your BVN so customers can pay you safely.',
      required: true,
      order: 3,
      fileBased: false,
      pattern: '^\\d{11}$',
      minLength: 11,
      maxLength: 11,
      placeholder: '12345678901',
    },
    ID_DOC,
    SELFIE,
    ADDRESS_PROOF,
    SANCTIONS,
  ],
};

const US: CountryKycRule = {
  country: 'US',
  countryName: 'United States',
  description: 'US verification uses your SSN or ITIN, a driver’s licence or passport, and a selfie.',
  customerModes: [
    EMAIL_OTP,
    PHONE_OTP,
    {
      mode: 'TAX_ID',
      label: 'SSN (last 4) or full ITIN',
      helpText: 'Last 4 digits of your SSN is enough for low-value accounts. For ITIN, enter all 9 digits.',
      required: true,
      order: 2,
      fileBased: false,
      pattern: '^(\\d{4}|\\d{9})$',
      minLength: 4,
      maxLength: 9,
      placeholder: '1234 or 123456789',
    },
    ID_DOC,
    SANCTIONS,
  ],
  taskerModes: [
    EMAIL_OTP,
    PHONE_OTP,
    {
      mode: 'TAX_ID',
      label: 'SSN (last 4) or full ITIN',
      helpText: 'Last 4 digits of your SSN, or full 9-digit ITIN.',
      required: true,
      order: 2,
      fileBased: false,
      pattern: '^(\\d{4}|\\d{9})$',
      minLength: 4,
      maxLength: 9,
      placeholder: '1234 or 123456789',
    },
    ID_DOC,
    SELFIE,
    ADDRESS_PROOF,
    SANCTIONS,
  ],
};

const GB: CountryKycRule = {
  country: 'GB',
  countryName: 'United Kingdom',
  description: 'UK verification uses your National Insurance Number, a photo ID, and a selfie.',
  customerModes: [
    EMAIL_OTP,
    PHONE_OTP,
    {
      mode: 'TAX_ID',
      label: 'National Insurance Number',
      helpText: 'Format: QQ123456A. We use it to confirm your identity with HMRC.',
      required: true,
      order: 2,
      fileBased: false,
      pattern: '^[A-CEGHJ-PR-TW-Z]{2}\\d{6}[A-D]$',
      placeholder: 'AB123456C',
    },
    ID_DOC,
    SANCTIONS,
  ],
  taskerModes: [
    EMAIL_OTP,
    PHONE_OTP,
    {
      mode: 'TAX_ID',
      label: 'National Insurance Number',
      helpText: 'Format: QQ123456A.',
      required: true,
      order: 2,
      fileBased: false,
      pattern: '^[A-CEGHJ-PR-TW-Z]{2}\\d{6}[A-D]$',
      placeholder: 'AB123456C',
    },
    ID_DOC,
    SELFIE,
    ADDRESS_PROOF,
    SANCTIONS,
  ],
};

const IE: CountryKycRule = {
  country: 'IE',
  countryName: 'Ireland',
  description: 'Irish verification uses your PPS Number, a passport or driver’s licence, and a selfie.',
  customerModes: [
    EMAIL_OTP, PHONE_OTP,
    {
      mode: 'TAX_ID', label: 'PPS Number',
      helpText: 'Your Personal Public Service Number, 7 digits + 1–2 letters (e.g. 1234567A).',
      required: true, order: 2, fileBased: false,
      pattern: '^\\d{7}[A-Z]{1,2}$', minLength: 8, maxLength: 9,
      placeholder: '1234567A',
    },
    ID_DOC, SANCTIONS,
  ],
  taskerModes: [
    EMAIL_OTP, PHONE_OTP,
    { mode: 'TAX_ID', label: 'PPS Number', helpText: '7 digits + 1–2 letters.', required: true, order: 2, fileBased: false, pattern: '^\\d{7}[A-Z]{1,2}$', placeholder: '1234567A' },
    ID_DOC, SELFIE, ADDRESS_PROOF, SANCTIONS,
  ],
};

const DE: CountryKycRule = {
  country: 'DE', countryName: 'Germany',
  description: 'German verification uses your Steuer-ID, a German national ID or passport, and a selfie.',
  customerModes: [
    EMAIL_OTP, PHONE_OTP,
    { mode: 'TAX_ID', label: 'Steuer-Identifikationsnummer', helpText: '11 digits, starts with a non-zero digit.', required: true, order: 2, fileBased: false, pattern: '^\\d{11}$', placeholder: '12345678901' },
    ID_DOC, SANCTIONS,
  ],
  taskerModes: [
    EMAIL_OTP, PHONE_OTP,
    { mode: 'TAX_ID', label: 'Steuer-Identifikationsnummer', helpText: '11 digits.', required: true, order: 2, fileBased: false, pattern: '^\\d{11}$', placeholder: '12345678901' },
    ID_DOC, SELFIE, ADDRESS_PROOF, SANCTIONS,
  ],
};

const FR: CountryKycRule = {
  country: 'FR', countryName: 'France',
  description: 'French verification uses your numéro fiscal, a national ID, and a selfie.',
  customerModes: [
    EMAIL_OTP, PHONE_OTP,
    { mode: 'TAX_ID', label: 'Numéro fiscal', helpText: '13 digits.', required: true, order: 2, fileBased: false, pattern: '^\\d{13}$', placeholder: '1234567890123' },
    ID_DOC, SANCTIONS,
  ],
  taskerModes: [
    EMAIL_OTP, PHONE_OTP,
    { mode: 'TAX_ID', label: 'Numéro fiscal', helpText: '13 digits.', required: true, order: 2, fileBased: false, pattern: '^\\d{13}$', placeholder: '1234567890123' },
    ID_DOC, SELFIE, ADDRESS_PROOF, SANCTIONS,
  ],
};

const NL: CountryKycRule = {
  country: 'NL', countryName: 'Netherlands',
  description: 'Dutch verification uses your BSN, a national ID, and a selfie.',
  customerModes: [
    EMAIL_OTP, PHONE_OTP,
    { mode: 'TAX_ID', label: 'BSN (Burgerservicenummer)', helpText: '9 digits.', required: true, order: 2, fileBased: false, pattern: '^\\d{9}$', placeholder: '123456789' },
    ID_DOC, SANCTIONS,
  ],
  taskerModes: [
    EMAIL_OTP, PHONE_OTP,
    { mode: 'TAX_ID', label: 'BSN', helpText: '9 digits.', required: true, order: 2, fileBased: false, pattern: '^\\d{9}$', placeholder: '123456789' },
    ID_DOC, SELFIE, ADDRESS_PROOF, SANCTIONS,
  ],
};

const ZA: CountryKycRule = {
  country: 'ZA', countryName: 'South Africa',
  description: 'South African verification uses your SA ID number, an ID document, and a selfie.',
  customerModes: [
    EMAIL_OTP, PHONE_OTP,
    { mode: 'NATIONAL_ID_NUMBER', label: 'SA ID Number', helpText: '13 digits.', required: true, order: 2, fileBased: false, pattern: '^\\d{13}$', placeholder: '9001010001088' },
    ID_DOC, SANCTIONS,
  ],
  taskerModes: [
    EMAIL_OTP, PHONE_OTP,
    { mode: 'NATIONAL_ID_NUMBER', label: 'SA ID Number', helpText: '13 digits.', required: true, order: 2, fileBased: false, pattern: '^\\d{13}$', placeholder: '9001010001088' },
    ID_DOC, SELFIE, ADDRESS_PROOF, SANCTIONS,
  ],
};

const KE: CountryKycRule = {
  country: 'KE', countryName: 'Kenya',
  description: 'Kenyan verification uses your KRA PIN, a national ID, and a selfie.',
  customerModes: [
    EMAIL_OTP, PHONE_OTP,
    { mode: 'TAX_ID', label: 'KRA PIN', helpText: 'Format: A123456789A.', required: true, order: 2, fileBased: false, pattern: '^[A-Z]\\d{9}[A-Z]$', placeholder: 'A123456789B' },
    ID_DOC, SANCTIONS,
  ],
  taskerModes: [
    EMAIL_OTP, PHONE_OTP,
    { mode: 'TAX_ID', label: 'KRA PIN', helpText: 'Format: A123456789A.', required: true, order: 2, fileBased: false, pattern: '^[A-Z]\\d{9}[A-Z]$', placeholder: 'A123456789B' },
    ID_DOC, SELFIE, ADDRESS_PROOF, SANCTIONS,
  ],
};

const GH: CountryKycRule = {
  country: 'GH', countryName: 'Ghana',
  description: 'Ghanaian verification uses your Ghana Card PIN, a national ID, and a selfie.',
  customerModes: [
    EMAIL_OTP, PHONE_OTP,
    { mode: 'NATIONAL_ID_NUMBER', label: 'Ghana Card PIN', helpText: 'Format: GHA-XXXXXXXXX-X.', required: true, order: 2, fileBased: false, pattern: '^GHA-\\d{9}-\\d$', placeholder: 'GHA-123456789-0' },
    ID_DOC, SANCTIONS,
  ],
  taskerModes: [
    EMAIL_OTP, PHONE_OTP,
    { mode: 'NATIONAL_ID_NUMBER', label: 'Ghana Card PIN', helpText: 'Format: GHA-XXXXXXXXX-X.', required: true, order: 2, fileBased: false, pattern: '^GHA-\\d{9}-\\d$', placeholder: 'GHA-123456789-0' },
    ID_DOC, SELFIE, ADDRESS_PROOF, SANCTIONS,
  ],
};

const IN: CountryKycRule = {
  country: 'IN', countryName: 'India',
  description: 'Indian verification uses your Aadhaar (last 4) or PAN, a national ID, and a selfie.',
  customerModes: [
    EMAIL_OTP, PHONE_OTP,
    { mode: 'TAX_ID', label: 'PAN', helpText: '10 characters, e.g. ABCDE1234F.', required: true, order: 2, fileBased: false, pattern: '^[A-Z]{5}\\d{4}[A-Z]$', placeholder: 'ABCDE1234F' },
    ID_DOC, SANCTIONS,
  ],
  taskerModes: [
    EMAIL_OTP, PHONE_OTP,
    { mode: 'TAX_ID', label: 'PAN', helpText: '10 characters, e.g. ABCDE1234F.', required: true, order: 2, fileBased: false, pattern: '^[A-Z]{5}\\d{4}[A-Z]$', placeholder: 'ABCDE1234F' },
    ID_DOC, SELFIE, ADDRESS_PROOF, SANCTIONS,
  ],
};

// Default fallback for any country we don't have explicit rules for.
// Document + selfie + sanctions check is the most common KYC pattern.
const FALLBACK: CountryKycRule = {
  country: 'XX',
  countryName: 'your country',
  description: 'We verify your identity with a government-issued ID, a selfie, and a sanctions check. Most people finish in under two minutes.',
  customerModes: [
    EMAIL_OTP, PHONE_OTP, ID_DOC, SANCTIONS,
  ],
  taskerModes: [
    EMAIL_OTP, PHONE_OTP, ID_DOC, SELFIE, ADDRESS_PROOF, SANCTIONS,
  ],
};

const ALL: Record<string, CountryKycRule> = {
  NG, US, GB, IE, DE, FR, NL, ZA, KE, GH, IN,
};

export function getKycRules(country: string, role: Role): CountryKycRule & { modes: KycModeRule[] } {
  const rule = ALL[country.toUpperCase()] || { ...FALLBACK, country: country.toUpperCase() };
  const modes = role === 'TASKER' ? rule.taskerModes : rule.customerModes;
  return { ...rule, modes };
}

export function listSupportedCountries(): { code: string; name: string }[] {
  return Object.values(ALL).map((r) => ({ code: r.country, name: r.countryName }));
}

// Country -> ISO-2 only (used by the signup form's country picker)
export const COUNTRIES: { code: string; name: string; currency: string; defaultLocale: string }[] = [
  { code: 'NG', name: 'Nigeria', currency: 'NGN', defaultLocale: 'en' },
  { code: 'US', name: 'United States', currency: 'USD', defaultLocale: 'en' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', defaultLocale: 'en' },
  { code: 'IE', name: 'Ireland', currency: 'EUR', defaultLocale: 'en' },
  { code: 'DE', name: 'Germany', currency: 'EUR', defaultLocale: 'de' },
  { code: 'FR', name: 'France', currency: 'EUR', defaultLocale: 'fr' },
  { code: 'NL', name: 'Netherlands', currency: 'EUR', defaultLocale: 'nl' },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR', defaultLocale: 'en' },
  { code: 'KE', name: 'Kenya', currency: 'KES', defaultLocale: 'en' },
  { code: 'GH', name: 'Ghana', currency: 'GHS', defaultLocale: 'en' },
  { code: 'IN', name: 'India', currency: 'INR', defaultLocale: 'en' },
];

export function countryMeta(code: string) {
  return COUNTRIES.find((c) => c.code === code.toUpperCase()) || null;
}
