// ==========================================
// 🎖️ CONFIGURAÇÃO DE CARGOS
// ==========================================
// Fonte única de verdade pros cargos: id, nome, ícone, raridade, bônus.
// Usado por: cargos-recalcular.js, cargos-meus.js, cargos-top.js, xp-add.js
// ==========================================

// ==========================================
// LISTA DE CARGOS
// ==========================================
// tipo: "ranking" → só Top 1 ganha (volátil, pode migrar)
// tipo: "fixo"    → quem desbloqueia, mantém (Nerd, Lenda)
//
// bonus:
//   alvo:  ação específica ("carinho", "recado", ...) ou "tudo"
//   valor: multiplicador de XP (0.5 = +50%, 0.1 = +10%, 0.2 = +20%)
//
// raridade: "comum" | "raro" | "epico" | "lendario"
// ==========================================
export const CARGOS = {
  // ===== FIXOS =====
  nerd: {
    id: "nerd",
    nome: "Nerd",
    icone: "fa-graduation-cap",
    emoji: "🎓",
    desc: "Tirou nota 100 em alguma matéria",
    raridade: "epico",
    tipo: "fixo",
    bonus: { alvo: "tudo", valor: 0.10 },
  },
  lenda: {
    id: "lenda",
    nome: "Lenda",
    icone: "fa-star",
    emoji: "🌟",
    desc: "Alcançou o nível 10 (Lenda)",
    raridade: "lendario",
    tipo: "fixo",
    bonus: { alvo: "tudo", valor: 0.20 },
  },

  // ===== RANKING (RAROS) =====
  metodico: {
    id: "metodico",
    nome: "Metódico",
    icone: "fa-bullseye",
    emoji: "🎯",
    desc: "Top 1 em metas individuais definidas",
    raridade: "raro",
    tipo: "ranking",
    bonus: { alvo: "meta", valor: 0.50 },
  },
  cientista: {
    id: "cientista",
    nome: "Cientista",
    icone: "fa-flask",
    emoji: "🧪",
    desc: "Top 1 em uso do simulador de notas",
    raridade: "raro",
    tipo: "ranking",
    bonus: { alvo: "simulador", valor: 0.50 },
  },
  estudioso: {
    id: "estudioso",
    nome: "Estudioso",
    icone: "fa-book",
    emoji: "📚",
    desc: "Top 1 em média geral do boletim",
    raridade: "raro",
    tipo: "ranking",
    bonus: { alvo: "boletim", valor: 0.25 },
  },

  // ===== RANKING (COMUNS) =====
  carinhoso: {
    id: "carinhoso",
    nome: "Carinhoso",
    icone: "fa-paw",
    emoji: "🐾",
    desc: "Top 1 em carinhos dados no mascote",
    raridade: "comum",
    tipo: "ranking",
    bonus: { alvo: "carinho", valor: 0.50 },
  },
  comunicador: {
    id: "comunicador",
    nome: "Comunicador",
    icone: "fa-comments",
    emoji: "💬",
    desc: "Top 1 em recados postados no mural",
    raridade: "comum",
    tipo: "ranking",
    bonus: { alvo: "recado", valor: 0.50 },
  },
  popular: {
    id: "popular",
    nome: "Popular",
    icone: "fa-heart",
    emoji: "💜",
    desc: "Top 1 em curtidas recebidas nos recados",
    raridade: "comum",
    tipo: "ranking",
    bonus: { alvo: "curtida", valor: 0.50 },
  },
  em_chamas: {
    id: "em_chamas",
    nome: "Em Chamas",
    icone: "fa-fire",
    emoji: "🔥",
    desc: "Maior streak ativa (dias seguidos)",
    raridade: "comum",
    tipo: "ranking",
    bonus: { alvo: "login_diario", valor: 0.25 },
  },
  estiloso: {
    id: "estiloso",
    nome: "Estiloso",
    icone: "fa-palette",
    emoji: "🎨",
    desc: "Top 1 em trocas de skin do mascote",
    raridade: "comum",
    tipo: "ranking",
    bonus: { alvo: "trocar_avatar", valor: 0.50 },
  },
};

// ==========================================
// PRIORIDADE (se o aluno tem mais de um cargo)
// ==========================================
// Quando um aluno tem cargo "lenda" E "carinhoso", o "lenda" prevalece.
// Quanto maior o número, mais prioritário.
export const PRIORIDADE = {
  lendario: 4,
  epico: 3,
  raro: 2,
  comum: 1,
};

// ==========================================
// HELPERS
// ==========================================

/**
 * Retorna o cargo mais prioritário entre uma lista de IDs.
 * Ex: ["carinhoso", "lenda"] → "lenda"
 */
export function escolherCargoAtivo(ids) {
  if (!ids || ids.length === 0) return null;
  return ids
    .filter((id) => CARGOS[id])
    .sort((a, b) => {
      const pa = PRIORIDADE[CARGOS[a].raridade] || 0;
      const pb = PRIORIDADE[CARGOS[b].raridade] || 0;
      return pb - pa;
    })[0] || null;
}

/**
 * Calcula o bônus de XP de um cargo para uma ação.
 * Retorna multiplicador (0.5 = +50%) ou 0 se não aplica.
 */
export function bonusDoCargo(cargoId, acao) {
  const cargo = CARGOS[cargoId];
  if (!cargo || !cargo.bonus) return 0;
  const { alvo, valor } = cargo.bonus;
  if (alvo === "tudo") return valor;
  if (alvo === acao) return valor;
  return 0;
}

/**
 * Aplica bônus em uma quantidade de XP.
 * Ex: aplicarBonus(10, "carinhoso", "carinho") → 15 (com +50%)
 */
export function aplicarBonus(xp, cargoId, acao) {
  const bonus = bonusDoCargo(cargoId, acao);
  return Math.ceil(xp * (1 + bonus));
}

/**
 * Retorna a classe CSS da raridade (pra frontend usar).
 */
export function classeRaridade(cargoId) {
  const cargo = CARGOS[cargoId];
  if (!cargo) return "";
  return `cargo-badge-${cargo.raridade}`;
}

/**
 * Valida se um ID de cargo existe.
 */
export function cargoValido(id) {
  return !!CARGOS[id];
}

/**
 * Lista todos os cargos (array).
 */
export function listarCargos() {
  return Object.values(CARGOS);
}