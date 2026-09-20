import { db } from "../_lib/firebase.js";
import { autenticar } from "../_lib/auth.js";
import { verificarRateLimit } from "../_lib/rateLimit.js";
import { ok, erro, metodoObrigatorio, cors, numValido } from "../_lib/helpers.js";

const MAX_POR_CHAMADA = 500;
const RATE_MAX = 200;
const RATE_JANELA = 60_000;

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

  // Incrementa com transação
  const refXP = db.ref(`usuarios_xp/${matricula}/xp`);
  const resultado = await refXP.transaction((atual) => {
    const valor = Number(atual) || 0;
    const novo = valor + Number(quantidade);
    // Teto absoluto (1 milhão)
    return Math.min(novo, 1_000_000);
  });

  return ok(res, {
    xpTotal: resultado.snapshot.val(),
    adicionado: quantidade,
    motivo: motivo || "geral",
  });
}