import handlerListar from "./_lib/handlers/adm-listar.js";
import handlerAdicionar from "./_lib/handlers/adm-adicionar.js";
import handlerLogs from "./_lib/handlers/adm-logs.js";

export default function handler(req, res) {
  const tipo = req.query.tipo;
  if (tipo === "listar") return handlerListar(req, res);
  if (tipo === "adicionar") return handlerAdicionar(req, res);
  if (tipo === "logs") return handlerLogs(req, res);
  res.status(404).json({ erro: "Tipo inválido: " + tipo });
}