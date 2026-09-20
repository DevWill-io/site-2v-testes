import { db } from "../_lib/firebase.js";
import { autenticar } from "../_lib/auth.js";
import { ok, erro, cors } from "../_lib/helpers.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const matricula = await autenticar(req);
  if (!matricula) return erro(res, 401, "Não autenticado");

  const alvo = req.query.matricula;
  if (!alvo) return erro(res, 400, "Matrícula obrigatória");

  const snap = await db.ref(`perfis_alunos/${alvo}`).get();
  if (!snap.exists()) return erro(res, 404, "Perfil não encontrado");

  return ok(res, { perfil: snap.val() });
}