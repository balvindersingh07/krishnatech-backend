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
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2>New Contact Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || "-"}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    </div>
  `;

  // 1️⃣ Send to admin
  await resend.emails.send({
    from: "KrishnaTech Innovations <contact@krishnatechinnovations.com>",
    to: env.EMAIL_TO,
    reply_to: email,
    subject,
    html: adminHtml,
  });

  // 2️⃣ Auto reply (optional)
  if (env.AUTO_REPLY) {
    await resend.emails.send({
      from: "KrishnaTech Innovations <contact@krishnatechinnovations.com>",
      to: email,
      subject: "Thank You for Contacting KrishnaTech Innovations",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color:#4f46e5;">Thank You for Reaching Out 🚀</h2>

          <p>Hi ${name},</p>

          <p>
            We have successfully received your message. 
            Our team at <strong>KrishnaTech Innovations</strong> is reviewing your request.
          </p>

          <p>
            We typically respond within <strong>24 hours</strong>. 
            If your matter is urgent, you can reply directly to this email.
          </p>

          <hr style="margin:20px 0;" />

          <p style="font-size:14px; color:#555;">
            Empowering Businesses with Scalable Digital Solutions
            <br />
            🌐 Web Development | 📱 Mobile Apps | ☁ Cloud & DevOps | 🤖 AI Solutions
          </p>

          <p style="font-size:12px; color:#888;">
            This is an automated confirmation email.
          </p>
        </div>
      `,
    });
  }

  return true;
}

module.exports = { sendContactEmail };