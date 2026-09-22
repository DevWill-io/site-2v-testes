// ==========================================
// Wrapper: /api/gcal
// ==========================================
// Rotas:
//   GET /api/gcal?tipo=auth&secret=XXX   → inicia OAuth (admin)
//   GET /api/gcal?tipo=callback          → recebe código do Google
//   GET /api/gcal?tipo=cores             → retorna cores dos eventos
// ==========================================
import handlerAuth from "./_lib/handlers/gcal-auth.js";
import handlerCallback from "./_lib/handlers/gcal-callback.js";
import handlerCores from "./_lib/handlers/gcal-cores.js";

export default function handler(req, res) {
  const tipo = req.query.tipo;
  if (tipo === "auth") return handlerAuth(req, res);
  if (tipo === "callback") return handlerCallback(req, res);
  if (tipo === "cores") return handlerCores(req, res);
  res.status(404).json({ erro: "Tipo inválido: " + tipo });
}