// api/_lib/handlers/mascote-carinho.js
import { db } from "../../_lib/firebase.js";
import { autenticar } from "../auth.js";
import { ok, erro, metodoObrigatorio, cors } from "../helpers.js";
import { aplicarBonus } from "../cargos-config.js";

const LIMITE_GLOBAL = 1_000_000;
const RATE_MAX = 60;
const RATE_JANELA = 1_000;
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

  // Rate limit
  const agora = Date.now();
  const refRL = db.ref(`_rateLimit/${matricula}/carinho`);
  const rl = await refRL.transaction((dados) => {
    dados = dados || { historico: [] };
    dados.historico = (dados.historico || []).filter((t) => agora - t < RATE_JANELA);
    if (dados.historico.length >= RATE_MAX) return;
    dados.historico.push(agora);
    return dados;
  });
  if (!rl.committed) return erro(res, 429, "Rate limit excedido");

  // Transação global (nunca passa de 1M)
  const refGlobal = db.ref("mascote/total_carinhos");
  const transGlobal = await refGlobal.transaction((atual) => {
    const valor = Number(atual) || 0;
    if (valor >= LIMITE_GLOBAL) return;
    return valor + 1;
  });

  if (!transGlobal.committed) {
    return erro(res, 400, "Limite de 1 milhão atingido");
  }

  // ---- Aplica bônus do cargo no XP ----
  const cargoId = await obterCargoAtivo(matricula);
  const xpBase = 1;
  const xpComBonus = cargoId
    ? aplicarBonus(xpBase, cargoId, "carinho")
    : xpBase;
  const bonusAplicado = xpComBonus - xpBase;

  // Incrementa por aluno + XP + cliquesMascote (paralelo)
  await Promise.all([
    db.ref(`mascote/por_aluno/${matricula}`).transaction((a) => (Number(a) || 0) + 1),
    db.ref(`usuarios_xp/${matricula}/cliquesMascote`).transaction((a) => (Number(a) || 0) + 1),
    db.ref(`usuarios_xp/${matricula}/xp`).transaction((a) => (Number(a) || 0) + xpComBonus),
  ]);

  const snapMeu = await db.ref(`mascote/por_aluno/${matricula}`).get();

  return ok(res, {
    totalGlobal: transGlobal.snapshot.val(),
    meusCarinhos: Number(snapMeu.val()) || 0,
    xpGanho: xpComBonus,
    bonusAplicado,
    cargoAtivo: cargoId,
  });
}