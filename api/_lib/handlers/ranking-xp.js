import { db } from "../../_lib/firebase.js";
import { autenticar } from "../auth.js";
import { ok, erro, metodoObrigatorio, cors } from "../helpers.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!metodoObrigatorio(req, res, "GET")) return;

  const matricula = await autenticar(req);
  if (!matricula) return erro(res, 401, "Não autenticado");

  const [snapXP, snapPerfis] = await Promise.all([
    db.ref("usuarios_xp").get(),
    db.ref("perfis_alunos").get(),
  ]);

  const xpData = snapXP.val() || {};
  const perfis = snapPerfis.val() || {};

  const lista = Object.keys(xpData)
    .map((mat) => ({
      matricula: mat,
      xp: Number(xpData[mat]?.xp) || 0,
      nome: perfis[mat]?.nome || "Aluno",
    }))
    .sort((a, b) => b.xp - a.xp);

  return ok(res, { top10: lista.slice(0, 10) });
}