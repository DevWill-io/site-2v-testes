// api/_lib/handlers/xp-add.js
import { db } from "../../_lib/firebase.js";
import { autenticar } from "../auth.js";
import { verificarRateLimit } from "../rateLimit.js";
import { ok, erro, metodoObrigatorio, cors, numValido } from "../helpers.js";
import { aplicarBonus, CARGOS } from "../cargos-config.js";

const MAX_POR_CHAMADA = 500;
const RATE_MAX = 200;
const RATE_JANELA = 60_000;
const CARGO_CACHE_TTL = 60_000;

// ==========================================
// Cache de cargo ativo por matrícula (60s)
// ==========================================
const __cacheCargos = new Map(); // matricula → { cargoId, expiraEm }

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
    console.warn("[xp-add] erro ao ler cargo:", e.message);
    return null;
  }
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!metodoObrigatorio(req, res, "POST")) return;

  const matricula = await autenticar(req);
  if (!matricula) return erro(res, 401, "Não autenticado");

  const { quantidade, motivo } = req.body || {};
  if (!numValido(quantidade) || quantidade <= 0) {
    return erro(res, 400, "Quantidade inválida");
  }
  if (quantidade > MAX_POR_CHAMADA) {
    return erro(res, 400, `Máximo por chamada: ${MAX_POR_CHAMADA}`);
  }

  // Rate limit server-side
  const rl = await verificarRateLimit(matricula, "xp", RATE_MAX, RATE_JANELA);
  if (!rl.ok) return erro(res, 429, "Rate limit excedido");

  // ---- Aplica bônus do cargo ----
  const cargoId = await obterCargoAtivo(matricula);
  const quantidadeComBonus = cargoId
    ? aplicarBonus(quantidade, cargoId, motivo || "geral")
    : quantidade;
  const bonusAplicado = quantidadeComBonus - quantidade;

  // Incrementa com transação
  const refXP = db.ref(`usuarios_xp/${matricula}/xp`);
  const resultado = await refXP.transaction((atual) => {
    const valor = Number(atual) || 0;
    const novo = valor + quantidadeComBonus;
    return Math.min(novo, 1_000_000);
  });

  return ok(res, {
    xpTotal: resultado.snapshot.val(),
    adicionado: quantidadeComBonus,
    adicionadoBase: quantidade,
    bonusAplicado,
    cargoAtivo: cargoId,
    motivo: motivo || "geral",
  });
}