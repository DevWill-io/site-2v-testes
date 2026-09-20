import { db } from "../../_lib/firebase.js";
import { autenticar, ehAdmin } from "../../_lib/auth.js";
import { ok, erro, metodoObrigatorio, cors, sanitizar } from "../../_lib/helpers.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!metodoObrigatorio(req, res, "POST")) return;

  const matricula = await autenticar(req);
  if (!matricula) return erro(res, 401, "Não autenticado");

  const recadoId = sanitizar(req.body?.recadoId, 40);
  const comentarioId = sanitizar(req.body?.comentarioId, 40);

  if (!recadoId || !comentarioId) return erro(res, 400, "IDs obrigatórios");

  const ref = db.ref(`mural_recados/${recadoId}/comentarios/${comentarioId}`);
  const snap = await ref.get();
  if (!snap.exists()) return erro(res, 404, "Comentário não encontrado");

  const com = snap.val();
  const ehAutor = com.autor_matricula === matricula;
  const admin = await ehAdmin(matricula);

  if (!ehAutor && !admin) return erro(res, 403, "Sem permissão");

  await ref.remove();
  return ok(res, { recadoId, comentarioId });
}