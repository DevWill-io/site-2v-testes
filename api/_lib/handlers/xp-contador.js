import { db } from "../../_lib/firebase.js";
import { autenticar } from "../auth.js";
import { verificarRateLimit } from "../rateLimit.js";
import { ok, erro, metodoObrigatorio, cors, numValido } from "../helpers.js";

const CONTADORES_VALIDOS = ["recados", "curtidas", "simulador", "periodos"];
const MAX_POR_CHAMADA = 5;
const RATE_MAX = 30;
const RATE_JANELA = 60_000;

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!metodoObrigatorio(req, res, "POST")) return;

  const matricula = await autenticar(req);
  if (!matricula) return erro(res, 401, "Não autenticado");

  const { nome, quantidade } = req.body || {};
  if (!CONTADORES_VALIDOS.includes(nome)) {
    return erro(res, 400, "Contador inválido");
  }
  if (!numValido(quantidade) || quantidade <= 0) {
    return erro(res, 400, "Quantidade inválida");
  }
  if (quantidade > MAX_POR_CHAMADA) {
    return erro(res, 400, `Máximo por chamada: ${MAX_POR_CHAMADA}`);
  }

  const rl = await verificarRateLimit(matricula, "contadores", RATE_MAX, RATE_JANELA);
  if (!rl.ok) return erro(res, 429, "Rate limit excedido");

  const refCont = db.ref(`usuarios_xp/${matricula}/contadores/${nome}`);
  const resultado = await refCont.transaction((atual) => {
    const valor = Number(atual) || 0;
    return valor + Number(quantidade);
  });

  return ok(res, {
    nome,
    total: resultado.snapshot.val(),
    adicionado: quantidade,
  });
}