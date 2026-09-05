export function renderPasswordResetEmail(params: { displayName?: string; resetUrl: string; expiresMinutes: number; brandColor?: string; logoUrl?: string; }) {
  const name = params.displayName || 'there';
  const color = params.brandColor || '#4F46E5';
  const logo = params.logoUrl || '';
  const year = new Date().getFullYear();
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background:#F5F7FB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0F172A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F7FB;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;box-shadow:0 10px 30px rgba(15,23,42,0.08);overflow:hidden;">
        <tr>
          <td style="background:${color};padding:28px 32px;text-align:center;">
            ${logo ? `<img src="${logo}" alt="Marketplace" height="32" style="display:inline-block;" />` : `<span style="color:#fff;font-size:20px;font-weight:700;letter-spacing:.3px;">Marketplace</span>`}
          </td>
        </tr>
        <tr><td style="padding:36px 32px 8px 32px;">
          <h1 style="margin:0 0 8px 0;font-size:24px;line-height:1.3;color:#0F172A;">Reset your password</h1>
          <p style="margin:0;color:#475569;font-size:15px;line-height:1.6;">Hi ${escapeHtml(name)}, we received a request to reset the password for your Marketplace account.</p>
        </td></tr>
        <tr><td style="padding:16px 32px 8px 32px;">
          <p style="margin:0 0 24px 0;color:#475569;font-size:15px;line-height:1.6;">Click the button below to choose a new password. This link expires in <strong>${params.expiresMinutes} minutes</strong>.</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px 0;">
            <tr><td align="center" bgcolor="${color}" style="border-radius:10px;">
              <a href="${params.resetUrl}" target="_blank" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;background:${color};">Reset password</a>
            </td></tr>
          </table>
          <p style="margin:0 0 8px 0;color:#475569;font-size:14px;line-height:1.6;">If the button doesn't work, paste this link into your browser:</p>
          <p style="word-break:break-all;background:#F1F5F9;padding:12px 14px;border-radius:8px;font-size:13px;color:#334155;margin:0 0 16px 0;">${params.resetUrl}</p>
        </td></tr>
        <tr><td style="padding:0 32px 24px 32px;">
          <div style="background:#FEF3C7;border-left:4px solid #F59E0B;padding:12px 16px;border-radius:8px;">
            <p style="margin:0;color:#92400E;font-size:13px;line-height:1.5;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          </div>
        </td></tr>
        <tr><td style="padding:8px 32px 32px 32px;border-top:1px solid #E2E8F0;">
          <p style="margin:16px 0 0 0;color:#94A3B8;font-size:12px;line-height:1.6;">Need help? Contact our support team — we're here to help.</p>
          <p style="margin:8px 0 0 0;color:#94A3B8;font-size:12px;">&copy; ${year} Marketplace. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function renderEmailVerificationEmail(params: { displayName?: string; verifyUrl: string; brandColor?: string; logoUrl?: string; }) {
  const name = params.displayName || 'there';
  const color = params.brandColor || '#4F46E5';
  const logo = params.logoUrl || '';
  const year = new Date().getFullYear();
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#F5F7FB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0F172A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F7FB;padding:32px 16px;"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;box-shadow:0 10px 30px rgba(15,23,42,0.08);overflow:hidden;">
      <tr><td style="background:${color};padding:28px 32px;text-align:center;">${logo ? `<img src="${logo}" alt="Marketplace" height="32" />` : `<span style="color:#fff;font-size:20px;font-weight:700;">Marketplace</span>`}</td></tr>
      <tr><td style="padding:36px 32px 8px 32px;">
        <h1 style="margin:0 0 8px 0;font-size:24px;color:#0F172A;">Verify your email</h1>
        <p style="margin:0;color:#475569;font-size:15px;line-height:1.6;">Hi ${escapeHtml(name)}, welcome! Please confirm your email to activate your account.</p>
      </td></tr>
      <tr><td style="padding:16px 32px 8px 32px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px 0;"><tr><td align="center" bgcolor="${color}" style="border-radius:10px;">
          <a href="${params.verifyUrl}" target="_blank" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;background:${color};">Verify email</a>
        </td></tr></table>
        <p style="word-break:break-all;background:#F1F5F9;padding:12px 14px;border-radius:8px;font-size:13px;color:#334155;margin:0;">${params.verifyUrl}</p>
      </td></tr>
      <tr><td style="padding:8px 32px 32px 32px;border-top:1px solid #E2E8F0;">
        <p style="margin:16px 0 0 0;color:#94A3B8;font-size:12px;">&copy; ${year} Marketplace.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}