import { db } from "../_lib/firebase.js";
import { autenticar, ehAdmin } from "../_lib/auth.js";
import { ok, erro, metodoObrigatorio, cors, sanitizar } from "../_lib/helpers.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!metodoObrigatorio(req, res, "POST")) return;

  const matricula = await autenticar(req);
  if (!matricula) return erro(res, 401, "Não autenticado");
  if (!ehAdmin(matricula)) return erro(res, 403, "Só admin");

  const tipo = sanitizar(req.body?.tipo, 20);
  const id = sanitizar(req.body?.id, 40);

  if (tipo === "recado") {
    await db.ref(`mural_recados/${id}`).remove();
    return ok(res, { removido: id });
  }

  return erro(res, 400, "Tipo inválido");
}