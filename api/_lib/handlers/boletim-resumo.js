import { db } from "../../_lib/firebase.js";
import { autenticar } from "../../_lib/auth.js";
import { ok, erro, metodoObrigatorio, cors } from "../../_lib/helpers.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!metodoObrigatorio(req, res, "POST")) return;

  const matricula = await autenticar(req);
  if (!matricula) return erro(res, 401, "Não autenticado");

  const { mediaGeral, faltasTotais, disciplinasCount, periodo } = req.body || {};

  const payload = {
    mediaGeral: Number.isFinite(Number(mediaGeral)) ? Number(mediaGeral) : null,
    faltasTotais: Number.isFinite(Number(faltasTotais)) ? Number(faltasTotais) : 0,
    disciplinasCount: Number.isFinite(Number(disciplinasCount)) ? Number(disciplinasCount) : 0,
    periodo: String(periodo || "").slice(0, 20),
    atualizadoEm: Date.now(),
  };

  await db.ref(`resumo_boletim/${matricula}`).set(payload);

  return ok(res, { matricula, ...payload });
}