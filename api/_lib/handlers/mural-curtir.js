import { db } from "../../_lib/firebase.js";
import { autenticar, ehAdmin } from "../../_lib/auth.js";
import { ok, erro, metodoObrigatorio, cors, sanitizar } from "../../_lib/helpers.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!metodoObrigatorio(req, res, "POST")) return;

  const matricula = await autenticar(req);
  if (!matricula) return erro(res, 401, "Não autenticado");

  const id = sanitizar(req.body?.id, 40);
  if (!id) return erro(res, 400, "ID obrigatório");

  // 🆕 Valida se o recado existe
  const snap = await db.ref(`mural_recados/${id}`).get();
  if (!snap.exists()) return erro(res, 404, "Recado não encontrado");

  const ref = db.ref(`mural_recados/${id}/likes`);
  let curtiu = false;

  const resultado = await ref.transaction((likes) => {
    likes = Array.isArray(likes) ? likes : [];
    const idx = likes.indexOf(matricula);
    if (idx === -1) {
      likes.push(matricula);
      curtiu = true;
    } else {
      likes.splice(idx, 1);
      curtiu = false;
    }
    return likes;
  });

  if (!resultado.committed) return erro(res, 500, "Erro ao curtir");

  if (curtiu) {
    await Promise.all([
      db.ref(`usuarios_xp/${matricula}/contadores/curtidas`).transaction((a) => (Number(a) || 0) + 1),
      db.ref(`usuarios_xp/${matricula}/xp`).transaction((a) => (Number(a) || 0) + 1),
    ]);
  }

  return ok(res, { id, curtiu, totalLikes: resultado.snapshot.val()?.length || 0 });
}