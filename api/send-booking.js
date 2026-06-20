import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fullName, email, company, phone, message, preferredDate, preferredTime } = req.body;

    const emailBody = `
New Consultation Booking

Name: ${fullName}
Email: ${email}
Company: ${company}
Phone: ${phone || 'Not provided'}

Preferred Date: ${preferredDate}
Preferred Time: ${preferredTime}

Message:
${message || 'No additional message'}
    `.trim();

    const result = await resend.emails.send({
      from: 'noreply@stenward.com',
      to: 'info@stenward.com',
      subject: 'New consultation booking — Stenward',
      text: emailBody,
    });

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    return res.status(200).json({ success: true, id: result.data.id });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
