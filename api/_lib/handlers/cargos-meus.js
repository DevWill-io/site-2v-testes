// ==========================================
// 🎖️ Handler: cargos do aluno logado
// GET /api/cargos?tipo=meus
// Auth: aluno (obrigatório)
// ==========================================
// Retorna o cargo ativo do aluno + todos os cargos que ele já ganhou.
// ==========================================
import { db } from "../firebase.js";
import { autenticar } from "../auth.js";
import { ok, erro, metodoObrigatorio, cors } from "../helpers.js";
import { CARGOS, listarCargos } from "../cargos-config.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!metodoObrigatorio(req, res, "GET")) return;

  const matricula = await autenticar(req);
  if (!matricula) return erro(res, 401, "Não autenticado");

  // Lê o cargo do aluno
  const snap = await db.ref(`cargos/${matricula}`).get();
  const dados = snap.val();

  if (!dados || !dados.ativo) {
    return ok(res, {
      ativo: null,
      ativoInfo: null,
      todos: [],
      todosInfo: [],
    });
  }

  const ativoId = dados.ativo;
  const ativoInfo = CARGOS[ativoId] || null;

  // Lista todos os cargos que o aluno tem atualmente (não é histórico)
  // Pra saber todos, precisamos checar em quais rankings ele é Top 1
  const snapRanking = await db.ref("cargos/ranking").get();
  const ranking = snapRanking.val() || {};

  const meusCargos = [];
  Object.keys(ranking).forEach((cargoId) => {
    if (ranking[cargoId]?.matricula === matricula) {
      meusCargos.push(cargoId);
    }
  });

  // Adiciona cargos fixos (nerd, lenda) se aplicável
  const snapXP = await db.ref(`usuarios_xp/${matricula}`).get();
  const xpData = snapXP.val() || {};
  const conquistas = xpData.conquistas || {};

  if (conquistas.nerd && !meusCargos.includes("nerd")) {
    meusCargos.push("nerd");
  }
  if ((Number(xpData.xp) || 0) >= 5000 && !meusCargos.includes("lenda")) {
    meusCargos.push("lenda");
  }

  return ok(res, {
    ativo: ativoId,
    ativoInfo: ativoInfo
      ? {
          id: ativoInfo.id,
          nome: ativoInfo.nome,
          icone: ativoInfo.icone,
          emoji: ativoInfo.emoji,
          desc: ativoInfo.desc,
          raridade: ativoInfo.raridade,
          bonus: ativoInfo.bonus,
        }
      : null,
    desde: dados.desde || null,
    todos: meusCargos,
    todosInfo: meusCargos.map((id) => {
      const c = CARGOS[id];
      return c
        ? {
            id: c.id,
            nome: c.nome,
            icone: c.icone,
            emoji: c.emoji,
            desc: c.desc,
            raridade: c.raridade,
            bonus: c.bonus,
          }
        : null;
    }).filter(Boolean),
    // Lista completa de cargos disponíveis (pra UI mostrar todos os possíveis)
    disponiveis: listarCargos().map((c) => ({
      id: c.id,
      nome: c.nome,
      icone: c.icone,
      emoji: c.emoji,
      desc: c.desc,
      raridade: c.raridade,
    })),
  });
}