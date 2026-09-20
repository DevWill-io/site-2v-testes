import handlerCarinhos from "./_lib/handlers/ranking-carinhos.js";
import handlerXp from "./_lib/handlers/ranking-xp.js";

export default function handler(req, res) {
  const tipo = req.query.tipo;
  if (tipo === "carinhos") return handlerCarinhos(req, res);
  if (tipo === "xp") return handlerXp(req, res);
  res.status(404).json({ erro: "Tipo inválido: " + tipo });
}