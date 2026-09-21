// ==========================================
// 🎖️ Handler: Top 1 de cada cargo
// GET /api/cargos?tipo=top
// Auth: pública (qualquer um vê)
// ==========================================
// Retorna quem é o dono atual de cada cargo de ranking.
// Não inclui cargos fixos (nerd/lenda) porque esses não são "Top 1".
// ==========================================
import { db } from "../firebase.js";
import { ok, metodoObrigatorio, cors } from "../helpers.js";
import { CARGOS } from "../cargos-config.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!metodoObrigatorio(req, res, "GET")) return;

  // Lê o ranking salvo (calculado pelo cargos-recalcular)
  const snapRanking = await db.ref("cargos/ranking").get();
  const ranking = snapRanking.val() || {};

  // Lê perfis pra pegar nome e foto
  const snapPerfis = await db.ref("perfis_alunos").get();
  const perfis = snapPerfis.val() || {};

  const resultado = {};

  Object.keys(ranking).forEach((cargoId) => {
    const entry = ranking[cargoId];
    if (!entry || !entry.matricula) return;

    const cargo = CARGOS[cargoId];
    if (!cargo) return;

    const mat = entry.matricula;
    const perfil = perfis[mat] || {};
    const nome = perfil.nome || perfil.nomeCompleto || "Aluno " + String(mat).slice(-4);
    const foto =
      perfil.foto ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=random`;

    resultado[cargoId] = {
      cargo: {
        id: cargo.id,
        nome: cargo.nome,
        icone: cargo.icone,
        emoji: cargo.emoji,
        desc: cargo.desc,
        raridade: cargo.raridade,
      },
      matricula: mat,
      nome,
      foto,
      valor: entry.valor,
      desde: entry.desde,
    };
  });

  return ok(res, { cargos: resultado });
}