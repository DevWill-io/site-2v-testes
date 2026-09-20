export default function handler(req, res) {
  res.status(200).json({ ok: true, onde: "xp/test", url: req.url });
}