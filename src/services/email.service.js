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

  const subject = `New Website Inquiry — ${name}`;

  const adminHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color:#4f46e5;">New Contact Submission</h2>
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
      subject: "We’ve Received Your Inquiry – KrishnaTech Innovations",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width:600px; margin:auto;">

          <div style="text-align:center; margin-bottom:20px;">
            <img src="https://krishnatechinnovations.com/logo.png" 
                 alt="KrishnaTech Innovations" 
                 style="max-width:160px;" />
          </div>

          <h2 style="color:#4f46e5; text-align:center;">
            Thank You for Reaching Out 🚀
          </h2>

          <p>Hi ${name},</p>

          <p>
            Thank you for contacting <strong>KrishnaTech Innovations</strong>.
            We have successfully received your inquiry, and our team is currently reviewing your request.
          </p>

          <p>
            You can expect a response within <strong>24 business hours</strong>.
            If your matter is urgent, feel free to reply directly to this email and we will prioritize your request.
          </p>

          <p>
            We look forward to assisting you and helping you build scalable,
            performance-driven digital solutions.
          </p>

          <hr style="margin:25px 0;" />

          <p style="font-size:14px; color:#555; text-align:center;">
            <strong>KrishnaTech Innovations Team</strong><br/>
            Empowering Businesses with Scalable Digital Solutions<br/>
            🌐 Web Development | 📱 Mobile Applications | ☁ Cloud & DevOps | 🤖 AI Solutions
          </p>

          <p style="font-size:12px; color:#888; text-align:center;">
            This is an automated confirmation email.
          </p>
        </div>
      `,
    });
  }

  return true;
}

module.exports = { sendContactEmail };