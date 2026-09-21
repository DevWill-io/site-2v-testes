// ==========================================
// 🎖️ Handler: recalcular cargos
// POST /api/cargos?tipo=recalcular
// Auth: admin
// ==========================================
// Lê os dados de todos os alunos e calcula o Top 1 de cada cargo.
// Salva em cargos/ranking/{cargoId} e atualiza cargos/{matricula}/ativo.
//
// Roda sob demanda (admin clica no botão). Não é automático.
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

  // Só admin pode recalcular
  if (!(await ehAdmin(matricula))) {
    return erro(res, 403, "Apenas admin pode recalcular cargos");
  }

  const agora = Date.now();
  console.log("[cargos] recalculando em", new Date(agora).toISOString());

  // ---- 1. Lê TODOS os dados necessários em paralelo ----
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

  // Todos os alunos = quem tem XP ou perfil
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

    // Carinhoso: total de carinhos
    rankings.carinhoso.push({
      matricula: mat,
      valor: Number(carinhosData[mat]) || 0,
    });

    // Comunicador: recados postados
    rankings.comunicador.push({
      matricula: mat,
      valor: Number(contadores.recados) || 0,
    });

    // Popular: curtidas recebidas (não dadas)
    // Precisa contar as curtidas nos recados do aluno
    // Por enquanto, aproxima com o contador "curtidas" dele
    // ⚠️ Isso conta curtidas DADAS, não RECEBIDAS
    // TODO: melhorar depois lendo mural_recados
    rankings.popular.push({
      matricula: mat,
      valor: Number(contadores.curtidas) || 0,
    });

    // Em Chamas: streak
    rankings.em_chamas.push({
      matricula: mat,
      valor: Number(xp.streak) || 0,
    });

    // Cientista: uso do simulador
    rankings.cientista.push({
      matricula: mat,
      valor: Number(contadores.simulador) || 0,
    });

    // Metódico: metas definidas
    rankings.metodico.push({
      matricula: mat,
      valor: Object.keys(metasDoAluno).length,
    });

    // Estudioso: média geral
    rankings.estudioso.push({
      matricula: mat,
      valor: Number(resumo.mediaGeral) || 0,
    });

    // Estiloso: trocas de skin (aproximado pelo XP ganho trocando skin)
    // Como não temos contador específico, usamos o XP total como fallback
    // TODO: criar contador "trocas_skin" no futuro
    rankings.estiloso.push({
      matricula: mat,
      valor: Number(xp.xp) || 0,
    });
  });

  // ---- 3. Encontra o Top 1 de cada ranking ----
  const topDeCada = {};
  Object.keys(rankings).forEach((cargoId) => {
    const lista = rankings[cargoId]
      .filter((e) => e.valor > 0)
      .sort((a, b) => b.valor - a.valor);

    if (lista.length === 0) return;

    // Se empate, pega o primeiro (ordem alfabética pra ser determinístico)
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

  // 4.1 — Cargos de ranking (Top 1 de cada)
  Object.keys(topDeCada).forEach((cargoId) => {
    const { matricula: mat } = topDeCada[cargoId];
    if (!cargosPorAluno[mat]) cargosPorAluno[mat] = [];
    cargosPorAluno[mat].push(cargoId);
  });

  // 4.2 — Cargos fixos (Nerd, Lenda)
  todasMatriculas.forEach((mat) => {
    const xp = xpData[mat] || {};
    const conquistas = xp.conquistas || {};

    // Nerd: tem a conquista "nerd"
    if (conquistas.nerd) {
      if (!cargosPorAluno[mat]) cargosPorAluno[mat] = [];
      cargosPorAluno[mat].push("nerd");
    }

    // Lenda: xp >= 5000 (nível 10)
    if ((Number(xp.xp) || 0) >= 5000) {
      if (!cargosPorAluno[mat]) cargosPorAluno[mat] = [];
      cargosPorAluno[mat].push("lenda");
    }
  });

  // ---- 5. Escolhe cargo ativo (com prioridade) e salva ----
  const updates = {};

  // 5.1 — Salva ranking global
  updates["cargos/ranking"] = topDeCada;

  // 5.2 — Salva cargo ativo de cada aluno
  todasMatriculas.forEach((mat) => {
    const cargosDoAluno = cargosPorAluno[mat] || [];
    const ativo = escolherCargoAtivo(cargosDoAluno);

    if (ativo) {
      updates[`cargos/${mat}`] = {
        ativo,
        raridade: CARGOS[ativo].raridade,
        desde: agora,
        atualizadoEm: agora,
      };
    } else {
      // Não tem cargo — limpa
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