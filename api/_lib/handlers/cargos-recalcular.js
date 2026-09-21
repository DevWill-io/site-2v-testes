// ==========================================
// 🎖️ Handler: recalcular cargos
// POST /api/cargos?tipo=recalcular
// Auth: admin
// ==========================================
// Lê os dados de todos os alunos e calcula o Top 1 de cada cargo.
// Salva em cargos/ranking/{cargoId} e atualiza cargos/{matricula}.
// Salva os dados desnormalizados (nome, icone, emoji, desc, raridade) junto.
// ==========================================
import { db } from "../firebase.js";
import { autenticar, ehAdmin } from "../auth.js";
import { ok, erro, metodoObrigatorio, cors } from "../helpers.js";
import { CARGOS, PRIORIDADE, escolherCargoAtivo } from "../cargos-config.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!metodoObrigatorio(req, res, "POST")) return;

  const matricula = await autenticar(req);
  if (!matricula) return erro(res, 401, "Não autenticado");

  if (!(await ehAdmin(matricula))) {
    return erro(res, 403, "Apenas admin pode recalcular cargos");
  }

  const agora = Date.now();
  console.log("[cargos] recalculando em", new Date(agora).toISOString());

  // ---- 1. Lê TODOS os dados em paralelo ----
  const [
    snapXP,
    snapCarinhos,
    snapPerfis,
    snapResumos,
    snapMetas,
  ] = await Promise.all([
    db.ref("usuarios_xp").get(),
    db.ref("mascote/por_aluno").get(),
    db.ref("perfis_alunos").get(),
    db.ref("resumo_boletim").get(),
    db.ref("metas_disciplinas").get(),
  ]);

  const xpData = snapXP.val() || {};
  const carinhosData = snapCarinhos.val() || {};
  const perfisData = snapPerfis.val() || {};
  const resumosData = snapResumos.val() || {};
  const metasData = snapMetas.val() || {};

  const todasMatriculas = new Set([
    ...Object.keys(xpData),
    ...Object.keys(perfisData).filter((m) => !String(m).startsWith("anon_")),
  ]);

  // ---- 2. Calcula cada ranking ----
  const rankings = {
    carinhoso: [],
    comunicador: [],
    popular: [],
    em_chamas: [],
    cientista: [],
    metodico: [],
    estudioso: [],
    estiloso: [],
  };

  todasMatriculas.forEach((mat) => {
    const xp = xpData[mat] || {};
    const contadores = xp.contadores || {};
    const resumo = resumosData[mat] || {};
    const metasDoAluno = metasData[mat] || {};

    rankings.carinhoso.push({ matricula: mat, valor: Number(carinhosData[mat]) || 0 });
    rankings.comunicador.push({ matricula: mat, valor: Number(contadores.recados) || 0 });
    rankings.popular.push({ matricula: mat, valor: Number(contadores.curtidas) || 0 });
    rankings.em_chamas.push({ matricula: mat, valor: Number(xp.streak) || 0 });
    rankings.cientista.push({ matricula: mat, valor: Number(contadores.simulador) || 0 });
    rankings.metodico.push({ matricula: mat, valor: Object.keys(metasDoAluno).length });
    rankings.estudioso.push({ matricula: mat, valor: Number(resumo.mediaGeral) || 0 });
    rankings.estiloso.push({ matricula: mat, valor: Number(xp.xp) || 0 });
  });

  // ---- 3. Top 1 de cada ranking ----
  const topDeCada = {};
  Object.keys(rankings).forEach((cargoId) => {
    const lista = rankings[cargoId]
      .filter((e) => e.valor > 0)
      .sort((a, b) => b.valor - a.valor);

    if (lista.length === 0) return;

    const max = lista[0].valor;
    const empatados = lista.filter((e) => e.valor === max);
    empatados.sort((a, b) => String(a.matricula).localeCompare(String(b.matricula)));

    topDeCada[cargoId] = {
      matricula: empatados[0].matricula,
      valor: max,
      desde: agora,
    };
  });

  // ---- 4. Monta lista de cargos por aluno ----
  const cargosPorAluno = {};

  Object.keys(topDeCada).forEach((cargoId) => {
    const { matricula: mat } = topDeCada[cargoId];
    if (!cargosPorAluno[mat]) cargosPorAluno[mat] = [];
    cargosPorAluno[mat].push(cargoId);
  });

  todasMatriculas.forEach((mat) => {
    const xp = xpData[mat] || {};
    const conquistas = xp.conquistas || {};

    if (conquistas.nerd) {
      if (!cargosPorAluno[mat]) cargosPorAluno[mat] = [];
      cargosPorAluno[mat].push("nerd");
    }

    if ((Number(xp.xp) || 0) >= 5000) {
      if (!cargosPorAluno[mat]) cargosPorAluno[mat] = [];
      cargosPorAluno[mat].push("lenda");
    }
  });

  // ---- 5. Monta updates (com dados desnormalizados) ----
  const updates = {};

  // 5.1 — Ranking global (desnormalizado também)
  const rankingDesnormalizado = {};
  Object.keys(topDeCada).forEach((cargoId) => {
    const entry = topDeCada[cargoId];
    const cargo = CARGOS[cargoId];
    if (!cargo) return;

    // Pega nome e foto do aluno (pra UI não precisar buscar depois)
    const perfil = perfisData[entry.matricula] || {};
    const nomeAluno = perfil.nome || perfil.nomeCompleto || "Aluno " + String(entry.matricula).slice(-4);
    const fotoAluno = perfil.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(nomeAluno)}&background=random`;

    rankingDesnormalizado[cargoId] = {
      matricula: entry.matricula,
      valor: entry.valor,
      desde: entry.desde,
      // 🆕 Desnormalizado: info completa do cargo
      cargoNome: cargo.nome,
      cargoIcone: cargo.icone,
      cargoEmoji: cargo.emoji,
      cargoDesc: cargo.desc,
      cargoRaridade: cargo.raridade,
      // 🆕 Desnormalizado: info do dono
      nomeAluno,
      fotoAluno,
    };
  });
  updates["cargos/ranking"] = rankingDesnormalizado;

  // 5.2 — Cargo ativo de cada aluno (com info completa)
  todasMatriculas.forEach((mat) => {
    const cargosDoAluno = cargosPorAluno[mat] || [];
    const ativo = escolherCargoAtivo(cargosDoAluno);

    if (ativo) {
      const cargo = CARGOS[ativo];
      updates[`cargos/${mat}`] = {
        ativo,
        raridade: cargo.raridade,
        // 🆕 Desnormalizado: info completa do cargo (pra Sala/Mural/Membros lerem sem buscar)
        nome: cargo.nome,
        icone: cargo.icone,
        emoji: cargo.emoji,
        desc: cargo.desc,
        desde: agora,
        atualizadoEm: agora,
      };
    } else {
      updates[`cargos/${mat}`] = null;
    }
  });

  // ---- 6. Aplica em transação única ----
  try {
    await db.ref().update(updates);
  } catch (e) {
    console.error("[cargos] erro ao salvar:", e);
    return erro(res, 500, "Erro ao salvar cargos: " + e.message);
  }

  // ---- 7. Resposta ----
  const resumo = Object.keys(topDeCada).map((cargoId) => ({
    cargo: cargoId,
    matricula: topDeCada[cargoId].matricula,
    valor: topDeCada[cargoId].valor,
  }));

  return ok(res, {
    totalAlunos: todasMatriculas.size,
    totalCargos: Object.keys(topDeCada).length,
    cargos: resumo,
    executadoEm: agora,
  });
}