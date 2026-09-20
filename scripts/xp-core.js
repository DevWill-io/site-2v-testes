// ==========================================
// 🎯 xp-core.js — Núcleo unificado de XP, contadores e cliques
// ==========================================
// Fonte de verdade: Firebase (usuarios_xp/{matricula})
// Acesso: via API (/api/*) com token SUAP
// Cache: localStorage + memória (pra UI não travar)
// Anônimo: só localStorage (comportamento preservado)
// Rate limiting: client-side (proteção de UX) + server-side (proteção real)
// ==========================================

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  update,
  onValue,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

// ==========================================
// CONFIG FIREBASE
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyA_wDDRCRJL_WviT6FBorz8dhnHe0-pI8s",
  authDomain: "muralturmanormal.firebaseapp.com",
  projectId: "muralturmanormal",
  storageBucket: "muralturmanormal.firebasestorage.app",
  messagingSenderId: "993749229757",
  appId: "1:993749229757:web:ec87d8ca3b8950d70d57d4",
};

const app = getApps().find((a) => a.name === "mascoteApp")
  || initializeApp(firebaseConfig, "mascoteApp");
const db = getDatabase(app);

// ==========================================
// CHAVES DO localStorage
// ==========================================
const LS = {
  XP: "xp_total",
  CLIQUES: "xp_cliques_mascote",
  STREAK: "xp_streak",
  ULTIMO: "xp_ultimo_acesso",
  SKIN: "skin_ativa",
  AVATAR_LEGADO: "mascote_avatar",
  RECADOS: "xp_recados_total",
  CURTIDAS: "xp_curtidas_total",
  SIMULADOR: "xp_simulador_total",
  PERIODOS: "xp_periodos_total",
  PERIODOS_VISTOS: "xp_periodos_vistos",
  MATRICULA: "matricula_suap",
};

// ==========================================
// 🌐 CHAMADAS À API (nova camada)
// ==========================================
function obterTokenSuap() {
  const m = document.cookie.match(/(?:^|;\s*)suapToken=([^;]+)/);
  if (m) return decodeURIComponent(m[1]);
  return localStorage.getItem("suapToken") || null;
}

async function chamarAPI(endpoint, corpo) {
  const token = obterTokenSuap();
  if (!token) throw new Error("Sem token SUAP");
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(corpo || {}),
  });
  const dados = await res.json();
  if (!res.ok) throw new Error(dados.erro || "Erro na API");
  return dados;
}

// ==========================================
// 🛡️ RATE LIMITING (client-side)
// ==========================================
const __rateLimits = {
  xp:         { max: 200,  janela: 60_000, historico: [] },
  cliques:    { max: 60,   janela: 1_000,  historico: [] },
  contadores: { max: 30,   janela: 60_000, historico: [] },
  conquistas: { max: 10,   janela: 60_000, historico: [] },
};

function __verificarRateLimit(tipo) {
  const cfg = __rateLimits[tipo];
  if (!cfg) return true;
  const agora = Date.now();
  cfg.historico = cfg.historico.filter((t) => agora - t < cfg.janela);
  if (cfg.historico.length >= cfg.max) {
    console.warn(`[xp-core] 🛡️ rate limit atingido: ${tipo} (máx ${cfg.max}/${cfg.janela / 1000}s)`);
    return false;
  }
  cfg.historico.push(agora);
  return true;
}

const __tetosPorChamada = {
  xp: 500,
  cliques: 10,
  contadores: 5,
};

function __aplicarTeto(tipo, quantidade) {
  const teto = __tetosPorChamada[tipo];
  if (teto && quantidade > teto) {
    console.warn(`[xp-core] 🛡️ quantidade ${quantidade} acima do teto (${teto}) para ${tipo}`);
    return teto;
  }
  return quantidade;
}

// ==========================================
// ESTADO EM MEMÓRIA
// ==========================================
const cache = {
  matricula: null,
  ehAnonimo: true,
  xp: 0,
  cliquesMascote: 0,
  streak: 0,
  ultimaVisita: "",
  skinAtiva: "padrao",
  conquistas: {},
  contadores: { recados: 0, curtidas: 0, simulador: 0, periodos: 0 },
  pronto: false,
  migrado: false,
};

const filaOffline = [];

// ==========================================
// HELPERS
// ==========================================
function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function obterMatricula() {
  if (window.usuarioLogado?.matricula &&
      window.usuarioLogado.matricula !== "Matrícula não disponível") {
    return window.usuarioLogado.matricula;
  }
  const matCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("matricula="));
  if (matCookie) {
    const v = matCookie.split("=")[1];
    if (v && v !== "Matrícula não disponível") return v;
  }
  const matLocal = localStorage.getItem(LS.MATRICULA);
  if (matLocal && matLocal !== "Matrícula não disponível") return matLocal;
  return null;
}

function lsGet(chave, fallback = 0) {
  try {
    const v = localStorage.getItem(chave);
    if (v === null) return fallback;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(chave, valor) {
  try { localStorage.setItem(chave, String(valor)); } catch {}
}

function emitir(nome, detalhe) {
  try {
    window.dispatchEvent(new CustomEvent(nome, { detail: detalhe || {} }));
  } catch {}
}

// ==========================================
// LEITURA (síncrona, do cache)
// ==========================================
function obterXP() { return cache.xp; }
function obterCliquesMascote() { return cache.cliquesMascote; }
function obterStreak() { return cache.streak; }
function obterSkinAtiva() { return cache.skinAtiva; }
function obterContador(nome) { return cache.contadores[nome] || 0; }
function obterConquistas() { return { ...cache.conquistas }; }
function estaLogado() { return !cache.ehAnonimo && !!cache.matricula; }
function obterMatriculaAtual() { return cache.matricula; }
function estaPronto() { return cache.pronto; }

// ==========================================
// ESCRITA — XP
// ==========================================
async function incrementarXP(quantidade, motivo) {
  quantidade = Number(quantidade) || 0;
  if (quantidade <= 0) return cache.xp;

  if (!__verificarRateLimit("xp")) return cache.xp;
  quantidade = __aplicarTeto("xp", quantidade);

  cache.xp += quantidade;
  lsSet(LS.XP, cache.xp);
  emitir("xp:update", { total: cache.xp, quantidade, motivo: motivo || "geral" });

  if (!cache.ehAnonimo && cache.matricula) {
    try {
      await chamarAPI("/api/xp/add", { quantidade, motivo });
    } catch (e) {
      console.warn("[xp-core] erro API incrementarXP, enfileirando:", e);
      filaOffline.push({ tipo: "xp", qtd: quantidade, motivo });
    }
  }
  return cache.xp;
}

// ==========================================
// ESCRITA — Cliques no mascote
// ==========================================
async function incrementarCliquesMascote(quantidade) {
  quantidade = Number(quantidade) || 1;
  if (quantidade <= 0) return cache.cliquesMascote;

  if (!__verificarRateLimit("cliques")) return cache.cliquesMascote;
  quantidade = __aplicarTeto("cliques", quantidade);

  cache.cliquesMascote += quantidade;
  lsSet(LS.CLIQUES, cache.cliquesMascote);
  emitir("mascote:cliques", { total: cache.cliquesMascote, adicionado: quantidade });

  if (!cache.ehAnonimo && cache.matricula) {
    try {
      // A API do carinho incrementa cliquesMascote + xp + total + por_aluno
      // Uma chamada por clique
      for (let i = 0; i < quantidade; i++) {
        const r = await chamarAPI("/api/mascote/carinho", {});
        // Atualiza cache local com o total global retornado
        if (typeof r.totalGlobal === "number") {
          emitir("mascote:total-global", { total: r.totalGlobal });
        }
      }
    } catch (e) {
      console.warn("[xp-core] erro API cliques, enfileirando:", e);
      filaOffline.push({ tipo: "cliques", qtd: quantidade });
    }
  }
  return cache.cliquesMascote;
}

// ==========================================
// ESCRITA — Contadores
// ==========================================
const CONTADORES_VALIDOS = ["recados", "curtidas", "simulador", "periodos"];

async function incrementarContador(nome, quantidade = 1) {
  if (!CONTADORES_VALIDOS.includes(nome)) {
    console.warn("[xp-core] contador inválido:", nome);
    return 0;
  }
  quantidade = Number(quantidade) || 1;
  if (quantidade <= 0) return cache.contadores[nome] || 0;

  if (!__verificarRateLimit("contadores")) return cache.contadores[nome] || 0;
  quantidade = __aplicarTeto("contadores", quantidade);

  cache.contadores[nome] = (cache.contadores[nome] || 0) + quantidade;

  const lsChave = {
    recados: LS.RECADOS,
    curtidas: LS.CURTIDAS,
    simulador: LS.SIMULADOR,
    periodos: LS.PERIODOS,
  }[nome];
  if (lsChave) lsSet(lsChave, cache.contadores[nome]);

  emitir("xpCore:contador", { nome, total: cache.contadores[nome], adicionado: quantidade });

  if (!cache.ehAnonimo && cache.matricula) {
    try {
      await chamarAPI("/api/xp/contador", { nome, quantidade });
    } catch (e) {
      console.warn("[xp-core] erro API incrementarContador, enfileirando:", e);
      filaOffline.push({ tipo: "contador", nome, qtd: quantidade });
    }
  }
  return cache.contadores[nome];
}

// ==========================================
// ESCRITA — Streak / acesso diário
// ==========================================
async function registrarAcessoDiario() {
  const hoje = hojeISO();
  if (cache.ultimaVisita === hoje) {
    return { streak: cache.streak, novo: false, bonusXP: 0 };
  }

  let novoStreak;
  if (cache.ultimaVisita) {
    const ontem = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    novoStreak = (cache.ultimaVisita === ontem) ? cache.streak + 1 : 1;
  } else {
    novoStreak = 1;
  }

  const bonusXP = novoStreak >= 30 ? 100 : novoStreak >= 7 ? 50 : novoStreak >= 3 ? 20 : 10;

  cache.streak = novoStreak;
  cache.ultimaVisita = hoje;
  lsSet(LS.STREAK, novoStreak);
  lsSet(LS.ULTIMO, hoje);

  emitir("xp:streak", { streak: novoStreak, bonusXP, novo: true });

  if (!cache.ehAnonimo && cache.matricula) {
    try {
      const r = await chamarAPI("/api/xp/acesso-diario", {});
      cache.streak = r.streak || novoStreak;
      if (r.bonusXP) {
        cache.xp += r.bonusXP;
        lsSet(LS.XP, cache.xp);
        emitir("xp:update", { total: cache.xp });
      }
      return { streak: r.streak, novo: r.novo, bonusXP: r.bonusXP };
    } catch (e) {
      console.warn("[xp-core] erro API acessoDiario:", e);
      // Fallback local: soma bônus no cache
      cache.xp += bonusXP;
      lsSet(LS.XP, cache.xp);
    }
  } else {
    // Anônimo: soma bônus local
    cache.xp += bonusXP;
    lsSet(LS.XP, cache.xp);
  }

  return { streak: novoStreak, novo: true, bonusXP };
}

// ==========================================
// ESCRITA — Conquistas
// ==========================================
async function desbloquearConquista(id) {
  if (!id) return false;
  if (cache.conquistas[id]) return false;
  if (!__verificarRateLimit("conquistas")) return false;

  if (!cache.ehAnonimo && cache.matricula) {
    try {
      const r = await chamarAPI("/api/conquista/unlock", { id });
      if (!r.desbloqueada && r.jaTinha) {
        cache.conquistas[id] = { desbloqueadaEm: Date.now() };
        return false;
      }
      const agora = r.desbloqueadaEm || Date.now();
      cache.conquistas[id] = { desbloqueadaEm: agora };
      emitir("xpCore:conquista", { id, desbloqueadaEm: agora });
      return true;
    } catch (e) {
      console.warn("[xp-core] erro API desbloquearConquista:", e);
      return false;
    }
  }

  // Anônimo
  const agora = Date.now();
  cache.conquistas[id] = { desbloqueadaEm: agora };
  emitir("xpCore:conquista", { id, desbloqueadaEm: agora });
  return true;
}

// ==========================================
// ESCRITA — Skin ativa
// ==========================================
async function definirSkinAtiva(skinId) {
  if (!skinId) return false;
  cache.skinAtiva = skinId;
  lsSet(LS.SKIN, skinId);
  lsSet(LS.AVATAR_LEGADO, skinId);
  emitir("skin:mudou", { skinId });

  if (!cache.ehAnonimo && cache.matricula) {
    try {
      await chamarAPI("/api/mascote/skin", { skinId });
    } catch (e) {
      console.warn("[xp-core] erro API definirSkinAtiva:", e);
      return false;
    }
  }
  return true;
}

// ==========================================
// MIGRAÇÃO — local → Firebase (1x por matrícula)
// ==========================================
async function migrarLocalSeNecessario() {
  if (cache.ehAnonimo || !cache.matricula) return;
  if (cache.migrado) return;

  const mat = cache.matricula;
  try {
    const snapFlag = await get(ref(db, `usuarios_xp/${mat}/migracaoLocal/concluidaEm`));
    if (snapFlag.exists()) {
      cache.migrado = true;
      console.log("[xp-core] migração já feita anteriormente.");
      return;
    }

    console.log("[xp-core] 🔄 Iniciando migração local → Firebase...");

    const xpLocal = lsGet(LS.XP, 0);
    const cliquesLocal = lsGet(LS.CLIQUES, 0);
    const recadosLocal = lsGet(LS.RECADOS, 0);
    const curtidasLocal = lsGet(LS.CURTIDAS, 0);
    const simuladorLocal = lsGet(LS.SIMULADOR, 0);
    const periodosLocal = lsGet(LS.PERIODOS, 0);

    const snapFB = await get(ref(db, `usuarios_xp/${mat}`));
    const fb = snapFB.val() || {};
    const xpFB = Number(fb.xp) || 0;
    const cliquesFB = Number(fb.cliquesMascote) || 0;
    const contFB = fb.contadores || {};

    const xpFinal = Math.max(xpLocal, xpFB);
    const cliquesFinal = Math.max(cliquesLocal, cliquesFB);
    const recadosFinal = Math.max(recadosLocal, Number(contFB.recados) || 0);
    const curtidasFinal = Math.max(curtidasLocal, Number(contFB.curtidas) || 0);
    const simuladorFinal = Math.max(simuladorLocal, Number(contFB.simulador) || 0);
    const periodosFinal = Math.max(periodosLocal, Number(contFB.periodos) || 0);

    await update(ref(db, `usuarios_xp/${mat}`), {
      xp: xpFinal,
      cliquesMascote: cliquesFinal,
      contadores: {
        recados: recadosFinal,
        curtidas: curtidasFinal,
        simulador: simuladorFinal,
        periodos: periodosFinal,
      },
      migracaoLocal: {
        concluidaEm: Date.now(),
        xpLocal, xpFB, cliquesLocal, cliquesFB,
      },
    });

    cache.xp = xpFinal;
    cache.cliquesMascote = cliquesFinal;
    cache.contadores = {
      recados: recadosFinal,
      curtidas: curtidasFinal,
      simulador: simuladorFinal,
      periodos: periodosFinal,
    };
    cache.migrado = true;

    try {
      localStorage.removeItem(LS.XP);
      localStorage.removeItem(LS.CLIQUES);
      localStorage.removeItem(LS.RECADOS);
      localStorage.removeItem(LS.CURTIDAS);
      localStorage.removeItem(LS.SIMULADOR);
      localStorage.removeItem(LS.PERIODOS);
      localStorage.removeItem(LS.PERIODOS_VISTOS);
    } catch {}

    emitir("xpCore:migracao", { xpFinal, cliquesFinal });
    console.log("[xp-core] ✅ Migração concluída:", {
      xp: xpFinal, cliques: cliquesFinal,
      recados: recadosFinal, curtidas: curtidasFinal,
      simulador: simuladorFinal, periodos: periodosFinal,
    });
  } catch (e) {
    console.warn("[xp-core] erro na migração:", e);
  }
}

// ==========================================
// SINCRONIZAÇÃO
// ==========================================
async function sincronizar() {
  cache.matricula = obterMatricula();
  cache.ehAnonimo = !cache.matricula;

  cache.xp = lsGet(LS.XP, 0);
  cache.cliquesMascote = lsGet(LS.CLIQUES, 0);
  cache.streak = lsGet(LS.STREAK, 0);
  cache.ultimaVisita = localStorage.getItem(LS.ULTIMO) || "";
  cache.skinAtiva = localStorage.getItem(LS.SKIN)
    || localStorage.getItem(LS.AVATAR_LEGADO)
    || "padrao";
  cache.contadores = {
    recados: lsGet(LS.RECADOS, 0),
    curtidas: lsGet(LS.CURTIDAS, 0),
    simulador: lsGet(LS.SIMULADOR, 0),
    periodos: lsGet(LS.PERIODOS, 0),
  };

  if (cache.ehAnonimo) {
    cache.pronto = true;
    emitir("xpCore:pronto", { anonimo: true });
    return;
  }

  try {
    const snap = await get(ref(db, `usuarios_xp/${cache.matricula}`));
    const dados = snap.val() || {};

    if (dados.xp !== undefined) cache.xp = Number(dados.xp) || 0;
    if (dados.cliquesMascote !== undefined) cache.cliquesMascote = Number(dados.cliquesMascote) || 0;
    if (dados.streak !== undefined) cache.streak = Number(dados.streak) || 0;
    if (dados.ultimaVisita) cache.ultimaVisita = dados.ultimaVisita;
    if (dados.conquistas) cache.conquistas = dados.conquistas;
    if (dados.contadores) {
      cache.contadores = {
        recados: Number(dados.contadores.recados) || 0,
        curtidas: Number(dados.contadores.curtidas) || 0,
        simulador: Number(dados.contadores.simulador) || 0,
        periodos: Number(dados.contadores.periodos) || 0,
      };
    }

    try {
      const snapSkin = await get(ref(db, `perfis_alunos/${cache.matricula}/mascoteAvatar`));
      if (snapSkin.exists()) {
        cache.skinAtiva = snapSkin.val();
        lsSet(LS.SKIN, cache.skinAtiva);
        lsSet(LS.AVATAR_LEGADO, cache.skinAtiva);
      }
    } catch {}

    lsSet(LS.XP, cache.xp);
    lsSet(LS.CLIQUES, cache.cliquesMascote);
    lsSet(LS.STREAK, cache.streak);
    if (cache.ultimaVisita) lsSet(LS.ULTIMO, cache.ultimaVisita);
    lsSet(LS.RECADOS, cache.contadores.recados);
    lsSet(LS.CURTIDAS, cache.contadores.curtidas);
    lsSet(LS.SIMULADOR, cache.contadores.simulador);
    lsSet(LS.PERIODOS, cache.contadores.periodos);

    cache.pronto = true;
    emitir("xpCore:pronto", { anonimo: false, matricula: cache.matricula });
    emitir("xp:update", { total: cache.xp });
    emitir("mascote:cliques", { total: cache.cliquesMascote });

    await migrarLocalSeNecessario();
  } catch (e) {
    console.warn("[xp-core] erro ao sincronizar:", e);
    cache.pronto = true;
    emitir("xpCore:pronto", { anonimo: false, erro: true });
  }
}

// ==========================================
// OBSERVER EM TEMPO REAL
// ==========================================
function observarFirebase() {
  if (cache.ehAnonimo || !cache.matricula) return;
  const refXP = ref(db, `usuarios_xp/${cache.matricula}`);
  onValue(refXP, (snap) => {
    const dados = snap.val() || {};
    if (dados.xp !== undefined) cache.xp = Number(dados.xp) || 0;
    if (dados.cliquesMascote !== undefined) cache.cliquesMascote = Number(dados.cliquesMascote) || 0;
    if (dados.streak !== undefined) cache.streak = Number(dados.streak) || 0;
    if (dados.conquistas) cache.conquistas = dados.conquistas;
    if (dados.contadores) {
      cache.contadores = {
        recados: Number(dados.contadores.recados) || 0,
        curtidas: Number(dados.contadores.curtidas) || 0,
        simulador: Number(dados.contadores.simulador) || 0,
        periodos: Number(dados.contadores.periodos) || 0,
      };
    }
    emitir("xp:update", { total: cache.xp });
    emitir("mascote:cliques", { total: cache.cliquesMascote });
  });
}

// ==========================================
// FILA OFFLINE
// ==========================================
async function processarFilaOffline() {
  if (!filaOffline.length) return;
  if (cache.ehAnonimo || !cache.matricula) return;
  console.log(`[xp-core] reprocessando ${filaOffline.length} itens offline...`);
  const fila = [...filaOffline];
  filaOffline.length = 0;
  for (const item of fila) {
    try {
      if (item.tipo === "xp") {
        await chamarAPI("/api/xp/add", { quantidade: item.qtd, motivo: item.motivo });
      } else if (item.tipo === "cliques") {
        for (let i = 0; i < item.qtd; i++) {
          await chamarAPI("/api/mascote/carinho", {});
        }
      } else if (item.tipo === "contador") {
        await chamarAPI("/api/xp/contador", { nome: item.nome, quantidade: item.qtd });
      }
    } catch (e) {
      filaOffline.push(item);
      break;
    }
  }
}

window.addEventListener("online", processarFilaOffline);

// ==========================================
// ATALHOS ESPECÍFICOS
// ==========================================
async function registrarPeriodoVisto(periodoLabel) {
  if (!periodoLabel) return false;
  let vistos = [];
  try {
    vistos = JSON.parse(localStorage.getItem(LS.PERIODOS_VISTOS) || "[]");
  } catch { vistos = []; }

  if (vistos.includes(periodoLabel)) return false;

  vistos.push(periodoLabel);
  localStorage.setItem(LS.PERIODOS_VISTOS, JSON.stringify(vistos));
  await incrementarContador("periodos", 1);
  return true;
}

async function registrarUsoSimulador() {
  const hoje = hojeISO();
  let dados = {};
  try {
    const raw = localStorage.getItem("xp_simulador_hoje");
    dados = raw ? JSON.parse(raw) : {};
  } catch {}
  if (dados.data !== hoje) dados = { data: hoje, count: 0 };
  if (dados.count >= 10) return false;
  dados.count++;
  localStorage.setItem("xp_simulador_hoje", JSON.stringify(dados));
  await incrementarContador("simulador", 1);
  return true;
}

// ==========================================
// API PÚBLICA
// ==========================================
window.xpCore = {
  obterXP,
  obterCliquesMascote,
  obterStreak,
  obterSkinAtiva,
  obterContador,
  obterConquistas,
  estaLogado,
  obterMatriculaAtual,
  estaPronto,

  incrementarXP,
  incrementarCliquesMascote,
  incrementarContador,
  registrarAcessoDiario,
  desbloquearConquista,
  definirSkinAtiva,
  registrarPeriodoVisto,
  registrarUsoSimulador,

  sincronizar,
  migrarLocalSeNecessario,
  observarFirebase,

  _cache: cache,
  _filaOffline: filaOffline,
  _rateLimits: __rateLimits,
};

// ==========================================
// INICIALIZAÇÃO
// ==========================================
(async () => {
  console.log("[xp-core] inicializando...");
  await sincronizar();
  if (!cache.ehAnonimo) observarFirebase();
  if (navigator.onLine && !cache.ehAnonimo) processarFilaOffline();
  console.log("[xp-core] pronto.", {
    anonimo: cache.ehAnonimo,
    matricula: cache.matricula,
    xp: cache.xp,
    cliques: cache.cliquesMascote,
    contadores: cache.contadores,
  });
})();