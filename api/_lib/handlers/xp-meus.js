import { db } from "../../_lib/firebase.js";
import { autenticar } from "../auth.js";
import { ok, erro, metodoObrigatorio, cors } from "../helpers.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!metodoObrigatorio(req, res, "GET")) return;

  const matricula = await autenticar(req);
  if (!matricula) return erro(res, 401, "Não autenticado");

  const snap = await db.ref(`usuarios_xp/${matricula}`).get();
  const dados = snap.val() || {};

  return ok(res, {
    xp: Number(dados.xp) || 0,
    streak: Number(dados.streak) || 0,
    ultimaVisita: dados.ultimaVisita || "",
    cliquesMascote: Number(dados.cliquesMascote) || 0,
    conquistas: dados.conquistas || {},
    contadores: {
      recados: Number(dados.contadores?.recados) || 0,
      curtidas: Number(dados.contadores?.curtidas) || 0,
      simulador: Number(dados.contadores?.simulador) || 0,
      periodos: Number(dados.contadores?.periodos) || 0,
    },
  });
}