// Admin capability keys. The set is the single source of truth for what
// admins and support agents can do. Use these as the keys for the
// AdminPermission.allow / deny JSON arrays too.

export const CAPABILITIES = {
  // Users
  USERS_VIEW: 'users:view',
  USERS_EDIT: 'users:edit',
  USERS_BAN: 'users:ban',
  USERS_CHANGE_ROLE: 'users:change-role',
  USERS_IMPERSONATE: 'users:impersonate',
  USERS_NOTE: 'users:note',
  USERS_EXPORT: 'users:export',

  // KYC
  KYC_VIEW: 'kyc:view',
  KYC_REVIEW: 'kyc:review',
  KYC_OVERRIDE: 'kyc:override',

  // Tasks
  TASKS_VIEW: 'tasks:view',
  TASKS_EDIT: 'tasks:edit',
  TASKS_CANCEL: 'tasks:cancel',
  TASKS_FORCE_COMPLETE: 'tasks:force-complete',

  // Disputes
  DISPUTES_VIEW: 'disputes:view',
  DISPUTES_RESOLVE: 'disputes:resolve',
  DISPUTES_ESCALATE: 'disputes:escalate',

  // Reports / moderation
  REPORTS_VIEW: 'reports:view',
  REPORTS_ACTION: 'reports:action',
  REVIEWS_MODERATE: 'reviews:moderate',

  // Categories
  CATEGORIES_VIEW: 'categories:view',
  CATEGORIES_EDIT: 'categories:edit',

  // Broadcasts
  BROADCASTS_SEND: 'broadcasts:send',
  BROADCASTS_VIEW: 'broadcasts:view',

  // Analytics
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export',

  // Risk
  RISK_VIEW: 'risk:view',
  RISK_ACTION: 'risk:action',

  // Settings
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_WRITE: 'settings:write',

  // Admin management
  ADMINS_VIEW: 'admins:view',
  ADMINS_MANAGE: 'admins:manage',

  // Audit
  AUDIT_VIEW: 'audit:view',
  AUDIT_EXPORT: 'audit:export',
} as const;

export type Capability = typeof CAPABILITIES[keyof typeof CAPABILITIES];

// Default role-based capabilities.
// ADMIN  → all capabilities
// SUPPORT → read + light action; no admin management, no settings write,
//           no impersonation, no destructive actions
const ROLE_DEFAULTS: Record<string, Capability[]> = {
  ADMIN: Object.values(CAPABILITIES),
  SUPPORT: [
    CAPABILITIES.USERS_VIEW,
    CAPABILITIES.USERS_NOTE,
    CAPABILITIES.KYC_VIEW,
    CAPABILITIES.KYC_REVIEW,
    CAPABILITIES.TASKS_VIEW,
    CAPABILITIES.DISPUTES_VIEW,
    CAPABILITIES.DISPUTES_RESOLVE,
    CAPABILITIES.REPORTS_VIEW,
    CAPABILITIES.REPORTS_ACTION,
    CAPABILITIES.REVIEWS_MODERATE,
    CAPABILITIES.CATEGORIES_VIEW,
    CAPABILITIES.BROADCASTS_VIEW,
    CAPABILITIES.ANALYTICS_VIEW,
    CAPABILITIES.RISK_VIEW,
    CAPABILITIES.SETTINGS_VIEW,
    CAPABILITIES.AUDIT_VIEW,
  ],
};

export function defaultCapabilitiesForRole(role: string): Capability[] {
  return ROLE_DEFAULTS[role] || [];
}

export function effectiveCapabilities(role: string, override?: { allow?: string[]; deny?: string[] } | null): Set<string> {
  const base: Set<string> = new Set(defaultCapabilitiesForRole(role));
  if (override?.allow) for (const k of override.allow) base.add(k as string);
  if (override?.deny) for (const k of override.deny) base.delete(k as string);
  return base;
}

export function can(actor: { role: string; permissions?: { allow?: string[]; deny?: string[] } | null }, capability: Capability): boolean {
  return effectiveCapabilities(actor.role, actor.permissions || undefined).has(capability as string);
}
