import { db } from "../../_lib/firebase.js";
import { autenticar, ehAdmin } from "../auth.js";
import { ok, erro, metodoObrigatorio, cors, sanitizar } from "../helpers.js";

const SKINS = {
  padrao:  { gratis: true },
  alien:   { gratis: true },
  pirata:  { gratis: true },
  genio:   { gratis: true },
  simpson: { gratis: false, cliques: 1500 },
  mafioso: { gratis: false, cliques: 3000 },
  admin:   { gratis: false, apenasAdmin: true },
};

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!metodoObrigatorio(req, res, "POST")) return;

  const matricula = await autenticar(req);
  if (!matricula) return erro(res, 401, "Não autenticado");

  const skinId = sanitizar(req.body?.skinId, 30);
  const skin = SKINS[skinId];
  if (!skin) return erro(res, 400, "Skin inválida");

  // Skin admin
  if (skin.apenasAdmin && !ehAdmin(matricula)) {
    return erro(res, 403, "Skin exclusiva do admin");
  }

  // Skin bloqueada por cliques
  if (!skin.gratis && !skin.apenasAdmin) {
    const snap = await db.ref(`usuarios_xp/${matricula}/cliquesMascote`).get();
    const cliques = Number(snap.val()) || 0;
    if (cliques < skin.cliques) {
      return erro(res, 403, `Precisa de ${skin.cliques} cliques (tem ${cliques})`);
    }
  }

  // Escreve nos 2 lugares
  await Promise.all([
    db.ref(`perfis_alunos/${matricula}/mascoteAvatar`).set(skinId),
    db.ref(`mascote/avatares/${matricula}/avatar`).set(skinId),
  ]);

  return ok(res, { skinId });
}