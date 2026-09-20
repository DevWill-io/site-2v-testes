import handlerRecado from "./_lib/handlers/mural-recado.js";
import handlerCurtir from "./_lib/handlers/mural-curtir.js";
import handlerComentar from "./_lib/handlers/mural-comentar.js";
import handlerEditar from "./_lib/handlers/mural-editar.js";
import handlerComentarioExcluir from "./_lib/handlers/mural-comentario-excluir.js";

export default function handler(req, res) {
  const tipo = req.query.tipo;
  if (tipo === "recado") return handlerRecado(req, res);
  if (tipo === "curtir") return handlerCurtir(req, res);
  if (tipo === "comentar") return handlerComentar(req, res);
  if (tipo === "editar") return handlerEditar(req, res);
  if (tipo === "excluir-comentario") return handlerComentarioExcluir(req, res);
  res.status(404).json({ erro: "Tipo inválido: " + tipo });
}