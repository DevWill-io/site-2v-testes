import { db } from "../../_lib/firebase.js";
import { autenticar } from "../../_lib/auth.js";
import { ok, erro, metodoObrigatorio, cors, sanitizar } from "../../_lib/helpers.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!metodoObrigatorio(req, res, "POST")) return;

  const matricula = await autenticar(req);
  if (!matricula) return erro(res, 401, "Não autenticado");

  const { metas } = req.body || {};
  if (!metas || typeof metas !== "object") {
    return erro(res, 400, "Metas inválidas");
  }

  // Limpa metas: só aceita códigos numéricos/string e valores 0-100
  const metasLimpas = {};
  Object.keys(metas).forEach((codigo) => {
    const cod = sanitizar(codigo, 40);
    const valor = Number(metas[codigo]);
    if (cod && Number.isFinite(valor) && valor >= 0 && valor <= 100) {
      metasLimpas[cod] = valor;
    }
  });

  await db.ref(`metas_disciplinas/${matricula}`).set(metasLimpas);

  return ok(res, { matricula, metas: metasLimpas });
}