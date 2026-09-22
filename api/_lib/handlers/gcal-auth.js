// ==========================================
// 🔐 Handler: iniciar OAuth do Google Calendar
// Rota: /api/gcal?tipo=auth
// Acesso: ?secret=SEU_SECRET (obrigatório)
// ==========================================
import { gerarState, montarUrlAutorizacao } from "../gcal.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") {
    return res.status(405).json({ erro: "Use GET" });
  }

  // 🔒 Proteção por secret
  const SECRET = process.env.GCAL_AUTH_SECRET;
  if (!SECRET) {
    console.error("[gcal-auth] GCAL_AUTH_SECRET não configurado");
    return res.status(500).json({ erro: "Configuração ausente" });
  }
  if (req.query.secret !== SECRET) {
    return res.status(401).json({ erro: "Não autorizado" });
  }

  try {
    const state = gerarState();

    res.setHeader(
      "Set-Cookie",
      `gcal_state=${state}; Path=/; Max-Age=600; HttpOnly; Secure; SameSite=Lax`
    );

    const url = montarUrlAutorizacao(state);

    res.writeHead(302, { Location: url });
    res.end();
  } catch (e) {
    console.error("[gcal-auth] erro:", e.message);
    return res.status(500).json({
      sucesso: false,
      erro: "Erro ao iniciar OAuth: " + e.message,
    });
  }
}