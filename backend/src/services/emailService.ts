import nodemailer, { Transporter } from 'nodemailer';

const env = process.env;

let transporter: Transporter | null = null;
let configured = false;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    configured = false;
    return null;
  }
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT) || 587,
    secure: (env.SMTP_PORT === '465'),
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
  configured = true;
  return transporter;
}

export interface SendInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface SendResult { ok: true; messageId: string; dev?: boolean; preview?: string; }

const LAYOUT = (title: string, preheader: string, bodyHtml: string) => `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#F8F9FF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#0B1C30;">
  <span style="display:none;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F9FF;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(14,28,47,0.06);">
          <tr>
            <td style="background:linear-gradient(135deg,#0E1C2F 0%,#1B2A3F 100%);padding:28px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="display:inline-block;background-color:#FFFFFF;border-radius:10px;padding:6px 12px;">
                      <span style="color:#0E1C2F;font-weight:800;font-size:18px;letter-spacing:-0.3px;">TaskSphere</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px 24px 32px;font-size:16px;line-height:1.6;color:#0B1C30;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EFF4FF;border-radius:14px;padding:20px;">
                <tr>
                  <td style="text-align:center;">
                    <p style="margin:0 0 6px 0;color:#44474C;font-size:14px;">Need help getting started?</p>
                    <a href="${env.PUBLIC_BASE_URL || 'http://localhost:3000'}/help" style="color:#0051D5;text-decoration:none;font-weight:600;font-size:14px;">Visit the Help Center →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color:#0E1C2F;padding:24px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#C5C6CD;font-size:12px;line-height:1.5;">
                    <p style="margin:0 0 6px 0;color:#FFFFFF;font-weight:700;">TaskSphere</p>
                    <p style="margin:0 0 6px 0;">The global marketplace for trusted local work.</p>
                    <p style="margin:12px 0 0 0;">© ${new Date().getFullYear()} TaskSphere. All rights reserved.</p>
                    <p style="margin:6px 0 0 0;">
                      <a href="${env.PUBLIC_BASE_URL || 'http://localhost:3000'}/privacy" style="color:#C5C6CD;text-decoration:underline;">Privacy</a>
                      &nbsp;·&nbsp;
                      <a href="${env.PUBLIC_BASE_URL || 'http://localhost:3000'}/terms" style="color:#C5C6CD;text-decoration:underline;">Terms</a>
                      &nbsp;·&nbsp;
                      <a href="${env.PUBLIC_BASE_URL || 'http://localhost:3000'}/help" style="color:#C5C6CD;text-decoration:underline;">Help</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const btn = (href: string, label: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background-color:#0051D5;border-radius:12px;"><a href="${href}" style="display:inline-block;padding:14px 28px;color:#FFFFFF;text-decoration:none;font-weight:600;font-size:15px;letter-spacing:-0.1px;">${label}</a></td></tr></table>`;

const pill = (text: string) =>
  `<span style="display:inline-block;background-color:#D6E3FE;color:#003EA8;font-size:11px;font-weight:700;letter-spacing:0.5px;padding:4px 10px;border-radius:999px;text-transform:uppercase;">${text}</span>`;

const statBlock = (label: string, value: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EFF4FF;border-radius:12px;margin:8px 0;"><tr><td style="padding:16px 20px;"><p style="margin:0 0 4px 0;color:#44474C;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${label}</p><p style="margin:0;color:#0E1C2F;font-size:22px;font-weight:800;letter-spacing:-0.3px;">${value}</p></td></tr></table>`;

export function welcomeEmail(input: { name: string; role: 'CUSTOMER' | 'TASKER' }) {
  const greet = input.name ? `Hi ${input.name.split(' ')[0]}` : 'Welcome to TaskSphere';
  const subject = `Welcome to TaskSphere 🎉`;
  const preheader = `You're in. Here's what to do next.`;
  const baseUrl = env.PUBLIC_BASE_URL || 'http://localhost:3000';
  const isTasker = input.role === 'TASKER';

  const cta = isTasker
    ? `<p style="margin:0 0 6px 0;color:#0B1C30;font-size:18px;font-weight:700;">Find your first task</p>
       <p style="margin:0 0 0 0;color:#44474C;font-size:15px;line-height:1.6;">Browse open tasks, send a great offer, and start earning. Customers can hire you in minutes.</p>
       ${btn(`${baseUrl}/dashboard/find-tasks`, 'Find work')}`
    : `<p style="margin:0 0 6px 0;color:#0B1C30;font-size:18px;font-weight:700;">Post your first task</p>
       <p style="margin:0 0 0 0;color:#44474C;font-size:15px;line-height:1.6;">Describe what you need, set a budget, and we'll match you with verified taskers in minutes.</p>
       ${btn(`${baseUrl}/dashboard/tasks/new`, 'Post a task')}`;

  const bodyHtml = `
    <p style="margin:0 0 6px 0;">${pill(isTasker ? 'Tasker account' : 'Customer account')}</p>
    <h1 style="margin:8px 0 16px 0;color:#0B1C30;font-size:28px;font-weight:800;letter-spacing:-0.5px;line-height:1.15;">${greet} — welcome to TaskSphere.</h1>
    <p style="margin:0 0 16px 0;color:#44474C;font-size:16px;line-height:1.6;">Thanks for joining the global marketplace for trusted local work. Whether you're here to get help or to earn, you're in good company.</p>

    <div style="margin:24px 0;">
      ${statBlock('Taskers on TaskSphere', '89')}
      ${statBlock('Open tasks right now', '52')}
      ${statBlock('Average platform rating', '4.43★')}
    </div>

    <div style="margin:24px 0;padding:20px;background-color:#F8F9FF;border-radius:14px;border:1px solid #DCE9FF;">
      ${cta}
    </div>

    <h2 style="margin:32px 0 12px 0;color:#0B1C30;font-size:18px;font-weight:700;">Here's how TaskSphere works</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:10px 0;vertical-align:top;width:32px;"><span style="display:inline-block;width:24px;height:24px;background-color:#0051D5;color:#FFFFFF;border-radius:50%;text-align:center;line-height:24px;font-weight:700;font-size:12px;">1</span></td>
        <td style="padding:10px 0;color:#44474C;font-size:15px;line-height:1.5;">${isTasker ? 'Find a task that matches your skills and send an offer.' : 'Post a task describing what you need done.'}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;vertical-align:top;"><span style="display:inline-block;width:24px;height:24px;background-color:#0051D5;color:#FFFFFF;border-radius:50%;text-align:center;line-height:24px;font-weight:700;font-size:12px;">2</span></td>
        <td style="padding:10px 0;color:#44474C;font-size:15px;line-height:1.5;">${isTasker ? 'Get hired, agree on details, and complete the work.' : 'Receive offers from verified taskers, chat, and pick the best fit.'}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;vertical-align:top;"><span style="display:inline-block;width:24px;height:24px;background-color:#0051D5;color:#FFFFFF;border-radius:50%;text-align:center;line-height:24px;font-weight:700;font-size:12px;">3</span></td>
        <td style="padding:10px 0;color:#44474C;font-size:15px;line-height:1.5;">${isTasker ? 'Get paid securely through Escrow on completion.' : 'Pay safely into Escrow. Release funds on approval.'}</td>
      </tr>
    </table>

    <h2 style="margin:32px 0 12px 0;color:#0B1C30;font-size:18px;font-weight:700;">Why people trust TaskSphere</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:8px 0;vertical-align:top;width:24px;color:#0051D5;font-size:18px;">✓</td>
        <td style="padding:8px 0;color:#44474C;font-size:15px;line-height:1.5;"><strong style="color:#0B1C30;">Escrow on every task</strong> — funds sit safely until the work is done.</td>
      </tr>
      <tr>
        <td style="padding:8px 0;vertical-align:top;color:#0051D5;font-size:18px;">✓</td>
        <td style="padding:8px 0;color:#44474C;font-size:15px;line-height:1.5;"><strong style="color:#0B1C30;">Verified taskers</strong> — KYC, background checks and skills tests.</td>
      </tr>
      <tr>
        <td style="padding:8px 0;vertical-align:top;color:#0051D5;font-size:18px;">✓</td>
        <td style="padding:8px 0;color:#44474C;font-size:15px;line-height:1.5;"><strong style="color:#0B1C30;">24/7 support</strong> — our team is here whenever you need help.</td>
      </tr>
    </table>

    <p style="margin:32px 0 0 0;color:#44474C;font-size:15px;line-height:1.6;">If you have any questions, just reply to this email — we read every message.</p>
    <p style="margin:16px 0 0 0;color:#0B1C30;font-size:15px;line-height:1.6;">Welcome aboard,<br/><strong style="color:#0B1C30;">The TaskSphere Team</strong></p>
  `;

  return {
    subject,
    html: LAYOUT(subject, preheader, bodyHtml),
    text: `${greet} — welcome to TaskSphere.\n\n${isTasker ? 'Find work: ' + baseUrl + '/dashboard/find-tasks' : 'Post a task: ' + baseUrl + '/dashboard/tasks/new'}\n\nThanks for joining,\nThe TaskSphere Team`,
  };
}

export function passwordResetEmail(input: { name?: string; resetUrl: string }) {
  const greet = input.name ? `Hi ${input.name.split(' ')[0]}` : 'Hi there';
  const subject = 'Reset your TaskSphere password';
  const preheader = 'A secure link to reset your password.';
  const bodyHtml = `
    <p style="margin:0 0 6px 0;">${pill('Account security')}</p>
    <h1 style="margin:8px 0 16px 0;color:#0B1C30;font-size:24px;font-weight:800;letter-spacing:-0.3px;">${greet}, let's get you back in.</h1>
    <p style="margin:0 0 16px 0;color:#44474C;font-size:16px;line-height:1.6;">We received a request to reset the password for your TaskSphere account. Click the button below to choose a new password.</p>
    ${btn(input.resetUrl, 'Reset your password')}
    <p style="margin:16px 0 0 0;color:#44474C;font-size:14px;line-height:1.6;">This link expires in 30 minutes. If you didn't request a password reset, you can safely ignore this email — your password will stay the same.</p>
    <p style="margin:24px 0 0 0;color:#44474C;font-size:13px;line-height:1.5;word-break:break-all;">If the button doesn't work, copy and paste this link: <a href="${input.resetUrl}" style="color:#0051D5;">${input.resetUrl}</a></p>
  `;
  return { subject, html: LAYOUT(subject, preheader, bodyHtml), text: `${greet}, reset your password: ${input.resetUrl}` };
}

export function emailVerifyEmail(input: { name?: string; verifyUrl: string }) {
  const greet = input.name ? `Hi ${input.name.split(' ')[0]}` : 'Hi there';
  const subject = 'Verify your TaskSphere email';
  const preheader = 'One click and your account is verified.';
  const bodyHtml = `
    <p style="margin:0 0 6px 0;">${pill('Verify your email')}</p>
    <h1 style="margin:8px 0 16px 0;color:#0B1C30;font-size:24px;font-weight:800;letter-spacing:-0.3px;">${greet}, one last step.</h1>
    <p style="margin:0 0 16px 0;color:#44474C;font-size:16px;line-height:1.6;">Please confirm your email address to unlock all of TaskSphere — including posting tasks, sending offers, and getting paid.</p>
    ${btn(input.verifyUrl, 'Verify my email')}
    <p style="margin:16px 0 0 0;color:#44474C;font-size:14px;line-height:1.6;">This link expires in 24 hours. If you didn't sign up for TaskSphere, you can safely ignore this email.</p>
  `;
  return { subject, html: LAYOUT(subject, preheader, bodyHtml), text: `${greet}, verify your email: ${input.verifyUrl}` };
}

export function kycDecisionEmail(input: { name?: string; approved: boolean; notes?: string }) {
  const greet = input.name ? `Hi ${input.name.split(' ')[0]}` : 'Hi there';
  const subject = input.approved ? 'Your KYC is approved ✅' : 'We need more info for your KYC';
  const preheader = input.approved ? "You're verified — start earning." : 'Action needed to complete verification.';
  const bodyHtml = input.approved
    ? `
      <p style="margin:0 0 6px 0;">${pill('Identity verified')}</p>
      <h1 style="margin:8px 0 16px 0;color:#0B1C30;font-size:24px;font-weight:800;">${greet}, you're verified.</h1>
      <p style="margin:0 0 16px 0;color:#44474C;font-size:16px;line-height:1.6;">Your identity has been verified. You can now bid on high-value tasks, get paid through Escrow, and access all of TaskSphere.</p>
      ${btn((env.PUBLIC_BASE_URL || 'http://localhost:3000') + '/dashboard/find-tasks', 'Browse tasks')}
    `
    : `
      <p style="margin:0 0 6px 0;">${pill('Action required')}</p>
      <h1 style="margin:8px 0 16px 0;color:#0B1C30;font-size:24px;font-weight:800;">${greet}, we need a bit more info.</h1>
      <p style="margin:0 0 16px 0;color:#44474C;font-size:16px;line-height:1.6;">Our team couldn't verify your identity with the documents you submitted.${input.notes ? ` Here are their notes: <em>${input.notes}</em>.` : ''}</p>
      <p style="margin:0 0 16px 0;color:#44474C;font-size:16px;line-height:1.6;">You can update your documents from your profile and resubmit. We're usually able to verify within a few hours.</p>
      ${btn((env.PUBLIC_BASE_URL || 'http://localhost:3000') + '/dashboard/kyc', 'Update KYC')}
    `;
  return { subject, html: LAYOUT(subject, preheader, bodyHtml), text: `${greet}, ${input.approved ? 'your KYC is approved.' : 'please update your KYC: ' + (env.PUBLIC_BASE_URL || 'http://localhost:3000') + '/dashboard/kyc'}` };
}

export async function sendEmail(input: SendInput): Promise<SendResult> {
  const t = getTransporter();
  if (!t) {
    const preview = input.html.replace(/\s+/g, ' ').slice(0, 200);
    console.log(`[email:dev] to=${input.to} subject=${input.subject} preview=${preview}`);
    return { ok: true, messageId: 'dev-' + Date.now(), dev: true, preview };
  }
  const from = `"${env.SMTP_FROM_NAME || 'TaskSphere'}" <${env.SMTP_FROM || env.SMTP_USER}>`;
  const info = await t.sendMail({ from, to: input.to, subject: input.subject, html: input.html, text: input.text, replyTo: input.replyTo });
  return { ok: true, messageId: info.messageId || '' };
}

export const emailStatus = () => ({ configured });
