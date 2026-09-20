import { db } from "../../_lib/firebase.js";
import { autenticar } from "../auth.js";
import { verificarRateLimit } from "../rateLimit.js";
import { ok, erro, metodoObrigatorio, cors, sanitizar } from "../helpers.js";

const RATE_MAX = 20;
const RATE_JANELA = 60_000;
const TEXTO_MAX = 300;

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!metodoObrigatorio(req, res, "POST")) return;

  const matricula = await autenticar(req);
  if (!matricula) return erro(res, 401, "Não autenticado");

  const recadoId = sanitizar(req.body?.recadoId, 40);
  const texto = sanitizar(req.body?.texto, TEXTO_MAX);
  if (!recadoId || !texto) return erro(res, 400, "Dados incompletos");

  const rl = await verificarRateLimit(matricula, "comentarios", RATE_MAX, RATE_JANELA);
  if (!rl.ok) return erro(res, 429, "Rate limit excedido");

  const snapPerfil = await db.ref(`perfis_alunos/${matricula}`).get();
  const perfil = snapPerfil.val() || {};

  const ref = db.ref(`mural_recados/${recadoId}/comentarios`).push();
  await ref.set({
    autor_matricula: matricula,
    autor_nome: perfil.nome || "Aluno",
    texto,
    timestamp: Date.now(),
  });

  // XP + contadores (contador de recados? não, é comentário)
  await db.ref(`usuarios_xp/${matricula}/xp`).transaction((a) => (Number(a) || 0) + 3);

  return ok(res, { id: ref.key });
}