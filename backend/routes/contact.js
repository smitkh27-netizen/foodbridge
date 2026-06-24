const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
  }

  try {
    await transporter.sendMail({
      from: `"FoodBridge Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_RECIPIENT,
      replyTo: email,
      subject: subject ? `[FoodBridge] ${subject} — from ${name}` : `[FoodBridge] New Contact Message from ${name}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #16a34a, #22c55e); padding: 32px 40px;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800;">FoodBridge</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">New Contact Form Submission</p>
          </div>
          <div style="padding: 32px 40px; background: white;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600; width: 120px;">From</td>
                <td style="padding: 10px 0; color: #0f172a; font-size: 15px; font-weight: 700;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Email</td>
                <td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #22c55e; font-weight: 600;">${email}</a></td>
              </tr>
              ${subject ? `<tr><td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Subject</td><td style="padding: 10px 0; color: #0f172a;">${subject}</td></tr>` : ''}
            </table>
            <div style="margin-top: 24px; padding: 20px; background: #f8fafc; border-left: 4px solid #22c55e; border-radius: 0 12px 12px 0;">
              <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">Message</p>
              <p style="margin: 0; color: #1e293b; font-size: 15px; line-height: 1.7;">${message.replace(/\n/g, '<br/>')}</p>
            </div>
          </div>
          <div style="padding: 20px 40px; background: #f8fafc; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} FoodBridge Welfare Platform · Vadodara, Gujarat</p>
          </div>
        </div>
      `,
    });

    res.json({ success: true, message: 'Email sent successfully.' });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ success: false, error: 'Failed to send email. Please try again.' });
  }
});

module.exports = router;
