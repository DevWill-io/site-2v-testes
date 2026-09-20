import { db } from "../_lib/firebase.js";
import { autenticar } from "../_lib/auth.js";
import { ok, erro, metodoObrigatorio, cors } from "../_lib/helpers.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!metodoObrigatorio(req, res, "POST")) return;

  const matricula = await autenticar(req);
  if (!matricula) return erro(res, 401, "Não autenticado");

  const hoje = new Date().toISOString().slice(0, 10);
  const refXP = db.ref(`usuarios_xp/${matricula}`);
  const snap = await refXP.get();
  const dados = snap.val() || {};
  const ultimaVisita = dados.ultimaVisita || "";
  let streak = Number(dados.streak) || 0;

  if (ultimaVisita === hoje) {
    return ok(res, { streak, novo: false, bonusXP: 0 });
  }

  if (ultimaVisita) {
    const ontem = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    streak = (ultimaVisita === ontem) ? streak + 1 : 1;
  } else {
    streak = 1;
  }

  const bonusXP = streak >= 30 ? 100 : streak >= 7 ? 50 : streak >= 3 ? 20 : 10;

  await refXP.update({ streak, ultimaVisita: hoje });
  await db.ref(`usuarios_xp/${matricula}/xp`).transaction((a) => (Number(a) || 0) + bonusXP);

  return ok(res, { streak, novo: true, bonusXP });
}