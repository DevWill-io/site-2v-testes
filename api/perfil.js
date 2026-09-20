import handlerUpdate from "./_lib/handlers/perfil-update.js";
import handlerPublico from "./_lib/handlers/perfil-publico.js";

export default function handler(req, res) {
  const tipo = req.query.tipo;
  const matricula = req.query.matricula;

  if (tipo === "update") return handlerUpdate(req, res);
  if (tipo === "publico" || matricula) {
    req.query.matricula = matricula;
    return handlerPublico(req, res);
  }
  res.status(404).json({ erro: "Tipo inválido" });
}