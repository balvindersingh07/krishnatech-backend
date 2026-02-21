// backend/src/services/email.service.js
const nodemailer = require("nodemailer");
const env = require("../config/env");

/**
 * Sends contact email to your inbox + optional auto-reply to client.
 * Works with:
 * 1) SMTP (recommended)  -> SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 * 2) Gmail App Password  -> EMAIL_USER, EMAIL_PASS (also works as SMTP_USER/PASS)
 */

function getTransporter() {
  // Preferred: explicit SMTP settings
  const host = env.SMTP_HOST;
  const port = Number(env.SMTP_PORT || 587);
  const user = env.SMTP_USER || env.EMAIL_USER;
  const pass = env.SMTP_PASS || env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error(
      "Email credentials missing. Add SMTP_USER/SMTP_PASS (or EMAIL_USER/EMAIL_PASS) in backend/.env"
    );
  }

  // If SMTP_HOST not provided, default to Gmail SMTP (works with Gmail App Password)
  const finalHost = host || "smtp.gmail.com";
  const secure = port === 465; // true only for 465

  return nodemailer.createTransport({
    host: finalHost,
    port,
    secure,
    auth: { user, pass },
  });
}

/**
 * @param {{ name:string, email:string, phone?:string, message:string, id?:string }} payload
 */
async function sendContactEmail(payload) {
  const { name, email, phone, message, id } = payload || {};

  const to = env.EMAIL_TO || env.EMAIL_USER || env.SMTP_USER;
  const fromUser = env.EMAIL_USER || env.SMTP_USER;

  if (!to) {
    throw new Error("EMAIL_TO missing. Set EMAIL_TO in backend/.env (your inbox).");
  }
  if (!fromUser) {
    throw new Error(
      "EMAIL_USER missing. Set EMAIL_USER (or SMTP_USER) in backend/.env"
    );
  }

  const transporter = getTransporter();

  // quick verify (helps catch wrong pass/host early)
  await transporter.verify();

  const subject = `New Website Message — ${name}${id ? ` (#${id})` : ""}`;

  const text = [
    `New contact form submission`,
    ``,
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || "-"}`,
    `ID: ${id || "-"}`,
    ``,
    `Message:`,
    `${message}`,
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.55">
      <h2 style="margin: 0 0 12px;">New contact form submission</h2>
      <table cellpadding="6" style="border-collapse: collapse;">
        <tr><td><b>Name</b></td><td>${escapeHtml(name)}</td></tr>
        <tr><td><b>Email</b></td><td>${escapeHtml(email)}</td></tr>
        <tr><td><b>Phone</b></td><td>${escapeHtml(phone || "-")}</td></tr>
        <tr><td><b>ID</b></td><td>${escapeHtml(id || "-")}</td></tr>
      </table>
      <hr style="margin: 14px 0;" />
      <div>
        <b>Message</b>
        <div style="margin-top: 8px; white-space: pre-wrap;">${escapeHtml(message)}</div>
      </div>
    </div>
  `;

  // 1) Send to your inbox
  await transporter.sendMail({
    from: `"KrishnaTech Innovations" <${fromUser}>`,
    to,
    subject,
    text,
    html,
    replyTo: email, // so you can reply directly to client
  });

  // 2) Optional auto-reply to client (enable/disable via env.AUTO_REPLY)
  const autoReplyOn = String(env.AUTO_REPLY || "true").toLowerCase() === "true";
  if (autoReplyOn) {
    const replySubject = "We received your message — KrishnaTech Innovations";
    const replyText =
      `Hi ${name},\n\n` +
      `Thanks for reaching out to KrishnaTech Innovations. We received your message and will get back to you within 24 hours.\n\n` +
      `— KrishnaTech Innovations`;

    const replyHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6">
        <p>Hi <b>${escapeHtml(name)}</b>,</p>
        <p>
          Thanks for reaching out to <b>KrishnaTech Innovations</b>.
          We received your message and will get back to you within <b>24 hours</b>.
        </p>
        <p style="margin-top: 18px;">
          — KrishnaTech Innovations
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"KrishnaTech Innovations" <${fromUser}>`,
      to: email,
      subject: replySubject,
      text: replyText,
      html: replyHtml,
    });
  }

  return true;
}

// small helper to prevent HTML injection in email templates
function escapeHtml(v) {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

module.exports = { sendContactEmail };
