export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    timestamp: Date.now(),
    method: req.method,
    url: req.url,
  });
}