export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fullName, email, company, phone, message, preferredDate, preferredTime } = req.body;
  const apiKey = process.env.RESEND_API_KEY;

  console.log('Booking request received:', { fullName, email, company });

  if (!apiKey) {
    console.error('RESEND_API_KEY not configured');
    return res.status(500).json({ error: 'API key not configured' });
  }

  const emailBody = `New Consultation Booking

Name: ${fullName}
Email: ${email}
Company: ${company}
Phone: ${phone || 'Not provided'}

Preferred Date: ${preferredDate}
Preferred Time: ${preferredTime}

Message:
${message || 'No additional message'}`;

  const payload = {
    from: 'onboarding@resend.dev',
    to: 'info@stenward.com',
    replyTo: email,
    subject: 'New consultation booking — Stenward',
    text: emailBody,
  };

  console.log('Sending to Resend:', JSON.stringify(payload));

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('Resend response status:', response.status);
    console.log('Resend response data:', JSON.stringify(data));

    if (!response.ok) {
      console.error('Resend API error:', data);
      return res.status(response.status).json({
        error: data.message || data.error || 'Email send failed',
        details: data
      });
    }

    console.log('Email sent successfully:', data.id);
    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    console.error('Booking API fetch error:', error.message);
    return res.status(500).json({ error: error.message || 'Failed to send email' });
  }
}
