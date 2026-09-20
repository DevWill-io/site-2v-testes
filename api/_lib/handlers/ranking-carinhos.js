import { db } from "../../_lib/firebase.js";
import { autenticar } from "../auth.js";
import { ok, erro, metodoObrigatorio, cors } from "../helpers.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!metodoObrigatorio(req, res, "GET")) return;

  const matricula = await autenticar(req);
  if (!matricula) return erro(res, 401, "Não autenticado");

  const [snapCarinhos, snapPerfis] = await Promise.all([
    db.ref("mascote/por_aluno").get(),
    db.ref("perfis_alunos").get(),
  ]);

  const carinhos = snapCarinhos.val() || {};
  const perfis = snapPerfis.val() || {};

  const lista = Object.keys(carinhos)
    .map((mat) => ({ matricula: mat, carinhos: Number(carinhos[mat]) || 0 }))
    .sort((a, b) => b.carinhos - a.carinhos);

  const top10 = lista.slice(0, 10).map((item) => ({
    ...item,
    nome: perfis[item.matricula]?.nome || "Aluno",
  }));

  const minhaPos = lista.findIndex((x) => x.matricula === matricula) + 1;
  const meusCarinhos = Number(carinhos[matricula]) || 0;

  return ok(res, { top10, minhaPos: minhaPos || null, meusCarinhos });
}