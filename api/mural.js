import handlerRecado from "./_lib/handlers/mural-recado.js";
import handlerCurtir from "./_lib/handlers/mural-curtir.js";
import handlerComentar from "./_lib/handlers/mural-comentar.js";

export default function handler(req, res) {
  const tipo = req.query.tipo;
  if (tipo === "recado") return handlerRecado(req, res);
  if (tipo === "curtir") return handlerCurtir(req, res);
  if (tipo === "comentar") return handlerComentar(req, res);
  res.status(404).json({ erro: "Tipo inválido: " + tipo });
}