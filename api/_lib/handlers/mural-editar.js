import { db } from "../../_lib/firebase.js";
import { autenticar, ehAdmin } from "../../_lib/auth.js";
import { ok, erro, metodoObrigatorio, cors, sanitizar } from "../../_lib/helpers.js";

const MSG_MAX = 200;

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!metodoObrigatorio(req, res, "POST")) return;

  const matricula = await autenticar(req);
  if (!matricula) return erro(res, 401, "Não autenticado");

  const id = sanitizar(req.body?.id, 40);
  const mensagem = sanitizar(req.body?.mensagem, MSG_MAX);
  const duracaoHoras = Math.max(1, Math.min(360, Number(req.body?.duracaoHoras) || 168));

  if (!id || !mensagem) return erro(res, 400, "Dados incompletos");

  const ref = db.ref(`mural_recados/${id}`);
  const snap = await ref.get();
  if (!snap.exists()) return erro(res, 404, "Recado não encontrado");

  const recado = snap.val();
  const ehAutor = recado.autor_matricula === matricula;
  const admin = ehAdmin(matricula);

  if (!ehAutor && !admin) return erro(res, 403, "Sem permissão");

  await ref.update({
    mensagem,
    duracao_horas: duracaoHoras,
    editado: true,
  });

  return ok(res, { id });
}