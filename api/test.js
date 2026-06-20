export default async function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    method: req.method,
    hasApiKey: !!process.env.RESEND_API_KEY
  });
}
