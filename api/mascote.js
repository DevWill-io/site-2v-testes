import handlerCarinho from "./_lib/handlers/mascote-carinho.js";
import handlerSkin from "./_lib/handlers/mascote-skin.js";

export default function handler(req, res) {
  const tipo = req.query.tipo;
  if (tipo === "carinho") return handlerCarinho(req, res);
  if (tipo === "skin") return handlerSkin(req, res);
  res.status(404).json({ erro: "Tipo inválido: " + tipo });
}