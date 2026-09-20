// ==========================================
// 🎭 Handler: trocar skin do mascote
// POST /api/mascote?tipo=skin
// Body: { skinId: "jojo" }
// Auth: obrigatório (SUAP Bearer token)
// Valida: grátis / cliques / conquista / admin
// Escreve em: perfis_alunos/{mat}/mascoteAvatar + mascote/avatares/{mat}/avatar
// ==========================================
import { db } from "../../_lib/firebase.js";
import { autenticar, ehAdmin } from "../auth.js";
import { ok, erro, metodoObrigatorio, cors, sanitizar } from "../helpers.js";

// ==========================================
// 🎭 SKINS VÁLIDAS — deve espelhar o AVATARES_MASCOTE do login.js
// tipo: "cliques"   → exige usuarios_xp/{mat}/cliquesMascote >= cliques
// tipo: "conquista" → exige usuarios_xp/{mat}/conquistas/{id} desbloqueada
// ==========================================
const SKINS = {
  // Gratuitas
  padrao:  { gratis: true },
  alien:   { gratis: true },
  pirata:  { gratis: true },
  genio:   { gratis: true },

  // Desbloqueio por cliques
  if:      { gratis: false, tipo: "cliques", cliques: 500 },
  jojo:    { gratis: false, tipo: "cliques", cliques: 1000 },
  simpson: { gratis: false, tipo: "cliques", cliques: 1500 },
  antigo:  { gratis: false, tipo: "cliques", cliques: 2000 },
  mafioso: { gratis: false, tipo: "cliques", cliques: 2500 },
  retro:   { gratis: false, tipo: "cliques", cliques: 3000 },
  turma1:  { gratis: false, tipo: "cliques", cliques: 4000 },
  turma2:  { gratis: false, tipo: "cliques", cliques: 5000 },
  turma3:  { gratis: false, tipo: "cliques", cliques: 10000 },

  // Desbloqueio por conquista
  "100":     { gratis: false, tipo: "conquista", conquista: "nerd" },
  vestuario: { gratis: false, tipo: "conquista", conquista: "vestuario" },

  // Exclusiva admin
  admin:   { gratis: false, apenasAdmin: true },
};

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!metodoObrigatorio(req, res, "POST")) return;

  const matricula = await autenticar(req);
  if (!matricula) return erro(res, 401, "Não autenticado");

  const skinId = sanitizar(req.body?.skinId, 30);
  if (!skinId) return erro(res, 400, "skinId é obrigatório");

  const skin = SKINS[skinId];
  if (!skin) return erro(res, 400, "Skin inválida");

  // ---- Validação 1: skin admin ----
  if (skin.apenasAdmin && !(await ehAdmin(matricula))) {
    return erro(res, 403, "Skin exclusiva do admin");
  }

  // ---- Validação 2: skin bloqueada (cliques ou conquista) ----
  if (!skin.gratis && !skin.apenasAdmin) {
    if (skin.tipo === "conquista") {
      const snapC = await db.ref(`usuarios_xp/${matricula}/conquistas/${skin.conquista}`).get();
      if (!snapC.exists()) {
        return erro(res, 403, `Precisa da conquista "${skin.conquista}"`);
      }
    } else {
      // tipo "cliques" (padrão)
      const snap = await db.ref(`usuarios_xp/${matricula}/cliquesMascote`).get();
      const cliques = Number(snap.val()) || 0;
      if (cliques < skin.cliques) {
        return erro(res, 403, `Precisa de ${skin.cliques} cliques (tem ${cliques})`);
      }
    }
  }

  // ---- Escrita: grava nos 2 lugares (compatibilidade) ----
  await Promise.all([
    db.ref(`perfis_alunos/${matricula}/mascoteAvatar`).set(skinId),
    db.ref(`mascote/avatares/${matricula}/avatar`).set(skinId),
  ]);

  return ok(res, { skinId });
}