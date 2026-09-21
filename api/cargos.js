// ==========================================
// Wrapper: /api/cargos
// ==========================================
// Rotas:
//   POST /api/cargos?tipo=recalcular  →  cargos-recalcular.js  (admin)
//   GET  /api/cargos?tipo=meus        →  cargos-meus.js        (aluno)
//   GET  /api/cargos?tipo=top         →  cargos-top.js         (público)
// ==========================================
import handlerRecalcular from "./_lib/handlers/cargos-recalcular.js";
import handlerMeus from "./_lib/handlers/cargos-meus.js";
import handlerTop from "./_lib/handlers/cargos-top.js";

export default function handler(req, res) {
  const tipo = req.query.tipo;
  if (tipo === "recalcular") return handlerRecalcular(req, res);
  if (tipo === "meus") return handlerMeus(req, res);
  if (tipo === "top") return handlerTop(req, res);
  res.status(404).json({ erro: "Tipo inválido: " + tipo });
}