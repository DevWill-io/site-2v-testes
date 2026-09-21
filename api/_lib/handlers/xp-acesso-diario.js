// api/_lib/handlers/xp-acesso-diario.js
import { db } from "../../_lib/firebase.js";
import { autenticar } from "../auth.js";
import { ok, erro, metodoObrigatorio, cors } from "../helpers.js";
import { aplicarBonus } from "../cargos-config.js";

const CARGO_CACHE_TTL = 60_000;

const __cacheCargos = new Map();

async function obterCargoAtivo(matricula) {
  const agora = Date.now();
  const cache = __cacheCargos.get(matricula);
  if (cache && cache.expiraEm > agora) return cache.cargoId;

  try {
    const snap = await db.ref(`cargos/${matricula}/ativo`).get();
    const cargoId = snap.val() || null;
    __cacheCargos.set(matricula, { cargoId, expiraEm: agora + CARGO_CACHE_TTL });
    return cargoId;
  } catch (e) {
    return null;
  }
}

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

  const bonusXPBase = streak >= 30 ? 100 : streak >= 7 ? 50 : streak >= 3 ? 20 : 10;

  // ---- Bônus do cargo em cima do bônus de streak ----
  const cargoId = await obterCargoAtivo(matricula);
  const bonusXP = cargoId
    ? aplicarBonus(bonusXPBase, cargoId, "login_diario")
    : bonusXPBase;
  const bonusAplicado = bonusXP - bonusXPBase;

  await refXP.update({ streak, ultimaVisita: hoje });
  await db.ref(`usuarios_xp/${matricula}/xp`).transaction((a) => (Number(a) || 0) + bonusXP);

  return ok(res, {
    streak,
    novo: true,
    bonusXP,
    bonusXPBase,
    bonusAplicado,
    cargoAtivo: cargoId,
  });
}