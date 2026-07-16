const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendMail({ to, subject, html }) {
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || `"Social Media Generator" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
  console.log(`[Email] Sent to ${to}: ${info.messageId}`);
  return info;
}

async function sendVerificationEmail(email, token, frontendUrl) {
  const url = `${frontendUrl}/verify-email?token=${token}`;
  return sendMail({
    to: email,
    subject: 'Verify your email address',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="color:#7c3aed;">Verify your email</h2>
        <p>Thanks for signing up! Click the button below to verify your email address.</p>
        <a href="${url}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">Verify Email</a>
        <p style="color:#666;font-size:13px;">If the button doesn't work, copy and paste this link:<br/><a href="${url}">${url}</a></p>
        <p style="color:#999;font-size:12px;">This link expires in 24 hours.</p>
      </div>
    `,
  });
}

async function sendPasswordResetEmail(email, token, frontendUrl) {
  const url = `${frontendUrl}/reset-password?token=${token}`;
  return sendMail({
    to: email,
    subject: 'Reset your password',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="color:#7c3aed;">Reset your password</h2>
        <p>We received a request to reset your password. Click the button below to set a new password.</p>
        <a href="${url}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">Reset Password</a>
        <p style="color:#666;font-size:13px;">If the button doesn't work, copy and paste this link:<br/><a href="${url}">${url}</a></p>
        <p style="color:#999;font-size:12px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

module.exports = { sendMail, sendVerificationEmail, sendPasswordResetEmail };
