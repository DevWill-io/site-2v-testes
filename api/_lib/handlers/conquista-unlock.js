import { db } from "../../_lib/firebase.js";
import { autenticar } from "../auth.js";
import { verificarRateLimit } from "../rateLimit.js";
import { ok, erro, metodoObrigatorio, cors, sanitizar } from "../helpers.js";

const RATE_MAX = 10;
const RATE_JANELA = 60_000;

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!metodoObrigatorio(req, res, "POST")) return;

  const matricula = await autenticar(req);
  if (!matricula) return erro(res, 401, "Não autenticado");

  const id = sanitizar(req.body?.id, 60);
  if (!id) return erro(res, 400, "ID obrigatório");

  const rl = await verificarRateLimit(matricula, "conquistas", RATE_MAX, RATE_JANELA);
  if (!rl.ok) return erro(res, 429, "Rate limit excedido");

  // Verifica se já tem
  const refConq = db.ref(`usuarios_xp/${matricula}/conquistas/${id}`);
  const snap = await refConq.get();
  if (snap.exists()) {
    return ok(res, { desbloqueada: false, jaTinha: true, id });
  }

  // Cria
  const agora = Date.now();
  await refConq.set({ desbloqueadaEm: agora });

  return ok(res, { desbloqueada: true, jaTinha: false, id, desbloqueadaEm: agora });
}