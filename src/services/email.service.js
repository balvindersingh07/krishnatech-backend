// backend/src/services/email.service.js
const { Resend } = require("resend");
const env = require("../config/env");

if (!env.RESEND_API_KEY) {
  console.warn("⚠️ RESEND_API_KEY not set");
}

const resend = new Resend(env.RESEND_API_KEY);

async function sendContactEmail({ name, email, phone, message }) {
  if (!env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY missing in environment variables");
  }

  if (!env.EMAIL_TO) {
    throw new Error("EMAIL_TO missing in environment variables");
  }

  const subject = `New Website Message — ${name}`;

  const adminHtml = `
    <div style="font-family: Arial; line-height: 1.6;">
      <h2>New Contact Submission</h2>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Phone:</b> ${phone || "-"}</p>
      <p><b>Message:</b></p>
      <p>${message}</p>
    </div>
  `;

  // 1️⃣ Send to admin
  await resend.emails.send({
    from: "KrishnaTech <noreply@krishnatechinnovations.com>",
    to: env.EMAIL_TO,
    subject,
    html: adminHtml,
  });

  // 2️⃣ Auto reply (optional)
  if (env.AUTO_REPLY) {
    await resend.emails.send({
      from: "KrishnaTech <noreply@krishnatechinnovations.com>",
      to: email,
      subject: "We received your message",
      html: `
        <p>Hi ${name},</p>
        <p>Thanks for contacting KrishnaTech Innovations.</p>
        <p>We will get back to you within 24 hours.</p>
      `,
    });
  }

  return true;
}

module.exports = { sendContactEmail };