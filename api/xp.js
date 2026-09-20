import handlerAdd from "./_lib/handlers/xp-add.js";
import handlerContador from "./_lib/handlers/xp-contador.js";
import handlerMeus from "./_lib/handlers/xp-meus.js";
import handlerDiario from "./_lib/handlers/xp-acesso-diario.js";

export default function handler(req, res) {
  const tipo = req.query.tipo;
  if (tipo === "add") return handlerAdd(req, res);
  if (tipo === "contador") return handlerContador(req, res);
  if (tipo === "meus") return handlerMeus(req, res);
  if (tipo === "acesso-diario") return handlerDiario(req, res);
  res.status(404).json({ erro: "Tipo inválido: " + tipo });
}