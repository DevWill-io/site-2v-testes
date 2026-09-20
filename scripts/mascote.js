// ==========================================
// 🐾 MASCOTE — Firebase v12 modular + Interações
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  runTransaction,
  get,
  set,
  push,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

// Reaproveita a MESMA config do login
const firebaseConfig = {
  apiKey: "AIzaSyA_wDDRCRJL_WviT6FBorz8dhnHe0-pI8s",
  authDomain: "muralturmanormal.firebaseapp.com",
  projectId: "muralturmanormal",
  storageBucket: "muralturmanormal.firebasestorage.app",
  messagingSenderId: "993749229757",
  appId: "1:993749229757:web:ec87d8ca3b8950d70d57d4",
};

const app = initializeApp(firebaseConfig, "mascoteApp");
const db = getDatabase(app);

// ==========================================
// CONFIGURAÇÕES
// ==========================================
const LIMITE_CARINHOS = 1000000;
const COOLDOWN_MS = 350;
const MATRICULA_STORAGE_KEY = "mascote_matricula_temp";

// ==========================================
// 🎭 AVATARES DO MASCOTE
// ==========================================
const AVATARES = {
  padrao: "🐾",
  genio: "🧠",
  pirata: "🏴‍☠️",
  alien: "👽",
  simpson: "🍩",
  mafioso: "🕴️",
};

// 🖼️ Imagens reais de cada avatar
const IMAGENS_MASCOTE = {
  padrao: "img/MascotePadrao.png",
  genio: "img/MascoteGenio.png",
  pirata: "img/MascotePirata.png",
  alien: "img/MascoteAlien.png",
  simpson: "img/MascoteSimpson.png",
  mafioso: "img/MascoteMafioso.png",
};

const IMAGEM_MASCOTE_PADRAO = "img/MascotePadrao.png";

// ==========================================
// ESTADO
// ==========================================
let carinhosGlobais = 0;
let meusCarinhos = 0;
let podeClicar = true;
let somLigado = localStorage.getItem("mascote_som") !== "off";
let marcosAnteriores = new Set();
let avatarAtual = (function () {
  // 🆕 Prioridade: skin_ativa (novo sistema) → mascote_avatar (legado) → padrao
  const skinAtiva = localStorage.getItem("skin_ativa");
  const avatarLegado = localStorage.getItem("mascote_avatar");
  const escolhido = skinAtiva || avatarLegado || "padrao";
  return IMAGENS_MASCOTE[escolhido] ? escolhido : "padrao";
})();
let perfisCache = {};
let rankingDataCache = {};

// ==========================================
// PEGA MATRÍCULA (SUAP → cookie → localStorage → anônimo)
// ==========================================
function obterMatricula() {
  // 1) Cookie do SUAP
  const matCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("matricula="));
  if (matCookie) return matCookie.split("=")[1];

  // 2) LocalStorage
  const matLocal = localStorage.getItem("matricula_suap");
  if (matLocal) return matLocal;

  // 3) Anônimo
  let temp = localStorage.getItem(MATRICULA_STORAGE_KEY);
  if (!temp) {
    temp = "anon_" + Math.random().toString(36).slice(2, 11);
    localStorage.setItem(MATRICULA_STORAGE_KEY, temp);
  }
  return temp;
}

const MINHA_MATRICULA = obterMatricula();
console.log("[mascote] Matrícula usada:", MINHA_MATRICULA);

// ==========================================
// ELEMENTOS DO DOM
// ==========================================
const mascoteImg = document.getElementById("mascoteImg");
const btnCarinho = document.getElementById("darCarinhoBtn");
const mascoteLikesSpan = document.getElementById("mascote-likes");
const meusCarinhosSpan = document.getElementById("meus-carinhos");
const progressoFill = document.getElementById("progresso-fill");
const progressoTexto = document.getElementById("progresso-texto");
const mascoteSection = document.querySelector(".mascote-section");
const mascoteImagem = document.querySelector(".mascote-imagem");
const rankingLista = document.getElementById("ranking-lista");
const rankingMinhaPosicao = document.getElementById("ranking-minha-posicao");
const rankingMeusCarinhos = document.getElementById("ranking-meus-carinhos");
const btnToggleRanking = document.getElementById("btn-toggle-ranking");
const mascoteRankingEl = document.getElementById("mascote-ranking");

// 🆕 Elementos da barra de progresso da SKIN
const skinProgressoBox = document.getElementById("mascote-skin-progresso");
const proximaSkinNome = document.getElementById("proxima-skin-nome");
const proximaSkinContagem = document.getElementById("proxima-skin-contagem");
const skinProgressoFill = document.getElementById("skin-progresso-fill");

// ==========================================
// 🔊 ÁUDIO (Web Audio API — sem arquivos externos)
// ==========================================
let audioCtx = null;

function tocarSom(tipo = "carinho") {
  if (!somLigado) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (tipo === "carinho") {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } else if (tipo === "marco") {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g);
        g.connect(audioCtx.destination);
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.12, audioCtx.currentTime + i * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.08 + 0.2);
        o.start(audioCtx.currentTime + i * 0.08);
        o.stop(audioCtx.currentTime + i * 0.08 + 0.2);
      });
    } else if (tipo === "limite") {
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g);
        g.connect(audioCtx.destination);
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.15, audioCtx.currentTime + i * 0.12);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.12 + 0.35);
        o.start(audioCtx.currentTime + i * 0.12);
        o.stop(audioCtx.currentTime + i * 0.12 + 0.35);
      });
    } else if (tipo === "desbloqueio") {
      // 🆕 Som especial pra desbloquear skin
      [659.25, 880, 1046.5, 1318.5, 1567.98].forEach((freq, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = "triangle";
        o.connect(g);
        g.connect(audioCtx.destination);
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.18, audioCtx.currentTime + i * 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.1 + 0.4);
        o.start(audioCtx.currentTime + i * 0.1);
        o.stop(audioCtx.currentTime + i * 0.1 + 0.4);
      });
    }
  } catch (e) {
    // navegador pode bloquear antes de interação do usuário
  }
}

// ==========================================
// BOTÃO DE MUTE
// ==========================================
function criarBotaoMute() {
  if (document.getElementById("btn-mute-mascote")) return;
  const btn = document.createElement("button");
  btn.id = "btn-mute-mascote";
  btn.className = "btn-mascote-mute";
  btn.setAttribute("aria-label", "Ligar/desligar som");
  btn.innerHTML = somLigado
    ? '<i class="fa-solid fa-volume-high"></i>'
    : '<i class="fa-solid fa-volume-xmark"></i>';
  btn.addEventListener("click", () => {
    somLigado = !somLigado;
    localStorage.setItem("mascote_som", somLigado ? "on" : "off");
    btn.innerHTML = somLigado
      ? '<i class="fa-solid fa-volume-high"></i>'
      : '<i class="fa-solid fa-volume-xmark"></i>';
    if (somLigado) tocarSom("carinho");
  });
  mascoteSection?.appendChild(btn);
}
criarBotaoMute();

// ==========================================
// 🎨 EMOJI DO AVATAR
// ==========================================
function emojiCoracao() {
  return AVATARES[avatarAtual] || "💖";
}

function mostrarAvatarFlutuante() {
  // 🎯 Troca a IMAGEM principal do mascote
  if (mascoteImg) {
    const novaSrc = IMAGENS_MASCOTE[avatarAtual] || IMAGEM_MASCOTE_PADRAO;

    // Só troca se for diferente (evita repaint desnecessário)
    if (mascoteImg.getAttribute("src") !== novaSrc) {
      // Efeito suave ao trocar
      mascoteImg.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      mascoteImg.style.opacity = "0";
      mascoteImg.style.transform = "scale(0.85)";

      setTimeout(() => {
        mascoteImg.src = novaSrc;
        mascoteImg.style.opacity = "1";
        mascoteImg.style.transform = "scale(1)";
      }, 250);
    }
  }
  // Atualiza data-skin pra CSS/JS saberem qual tá ativa
  if (mascoteImg) {
    mascoteImg.setAttribute("data-skin", avatarAtual);
  }
}
mostrarAvatarFlutuante();

// ==========================================
// 🎁 SISTEMA DE SKINS — Barra de progresso
// ==========================================
function atualizarProgressoSkin() {
  if (!skinProgressoBox || !skinProgressoFill) return;

  // Pega cliques totais do localStorage (sistema global do script.js)
  const cliques = window.obterCliquesMascote
    ? window.obterCliquesMascote()
    : parseInt(localStorage.getItem("xp_cliques_mascote") || "0", 10);

  // Lista de skins bloqueadas (com cliquesNecessarios > 0)
  const SKINS_BLOQUEAVEIS = [
    { id: "simpson", nomeKey: "skin_simpson", meta: 1500 },
    { id: "mafioso", nomeKey: "skin_mafioso", meta: 3000 },
  ];

  // Encontra a próxima skin a desbloquear
  const proxima = SKINS_BLOQUEAVEIS.find((s) => cliques < s.meta);

  // Função auxiliar pra traduzir
  const traduzir = window.t
    ? window.t
    : (k) => k;

  if (!proxima) {
    // Todas desbloqueadas 🎉
    skinProgressoBox.classList.add("completo");
    if (proximaSkinNome) proximaSkinNome.textContent = traduzir("skin_todas_desbloqueadas") || "🎉 Todas desbloqueadas!";
    if (proximaSkinContagem) proximaSkinContagem.textContent = "✓";
    skinProgressoFill.style.width = "100%";
    return;
  }

  skinProgressoBox.classList.remove("completo");

  const nome = traduzir(proxima.nomeKey) || proxima.id;
  if (proximaSkinNome) proximaSkinNome.textContent = nome;
  if (proximaSkinContagem) {
    proximaSkinContagem.textContent = `${cliques.toLocaleString("pt-BR")} / ${proxima.meta.toLocaleString("pt-BR")}`;
  }
  const percentual = Math.min(100, (cliques / proxima.meta) * 100);
  skinProgressoFill.style.width = `${percentual}%`;
}

// Chama na inicialização
atualizarProgressoSkin();

// 🆕 Escuta mudanças de cliques (evento do script.js)
window.addEventListener("mascote:cliques", () => {
  atualizarProgressoSkin();
});

// 🆕 Escuta mudanças de skin
window.addEventListener("skin:mudou", (e) => {
  const skinId = e.detail?.skinId;
  if (skinId && IMAGENS_MASCOTE[skinId]) {
    avatarAtual = skinId;
    try {
      localStorage.setItem("mascote_avatar", skinId);
    } catch (err) {}
    mostrarAvatarFlutuante();
  }
});

// Escuta mudanças no avatar em tempo real (Firebase legado)
onValue(ref(db, "mascote/avatares/" + MINHA_MATRICULA), (snap) => {
  const av = snap.val()?.avatar;
  if (av && AVATARES[av]) {
    // Só sobrescreve se NÃO for uma skin nova (pra preservar escolha do novo sistema)
    const skinAtualLocal = localStorage.getItem("skin_ativa");
    const isSkinNova = skinAtualLocal === "simpson" || skinAtualLocal === "mafioso";
    if (!isSkinNova) {
      avatarAtual = av;
      try {
        localStorage.setItem("mascote_avatar", av);
      } catch (e) {}
      mostrarAvatarFlutuante();
    }
  }
});

// ==========================================
// 🎨 CORAÇÕES VOANDO
// ==========================================
function criarCoracao(x, y) {
  const coracao = document.createElement("div");
  coracao.textContent = emojiCoracao();
  coracao.className = "coracao-animado";
  coracao.style.fontSize = "1.6rem";
  coracao.style.left = x - 15 + "px";
  coracao.style.top = y - 15 + "px";
  document.body.appendChild(coracao);
  setTimeout(() => coracao.remove(), 1200);
}

// ==========================================
// 🎉 CONFETES
// ==========================================
function soltarConfete(qtd = 40) {
  const cores = ["#ff4757", "#ffa502", "#2ed573", "#1e90ff", "#a55eea", "#ffd700"];
  for (let i = 0; i < qtd; i++) {
    setTimeout(() => {
      const confete = document.createElement("div");
      confete.className = "confete";
      confete.style.left = Math.random() * 100 + "vw";
      confete.style.top = "-10px";
      confete.style.backgroundColor = cores[Math.floor(Math.random() * cores.length)];
      confete.style.transform = `rotate(${Math.random() * 360}deg)`;
      confete.style.animationDelay = Math.random() * 0.5 + "s";
      document.body.appendChild(confete);
      setTimeout(() => confete.remove(), 3200);
    }, i * 35);
  }
}

// ==========================================
// 🔔 NOTIFICAÇÕES
// ==========================================
function mostrarNotificacao(mensagem, tipo = "sucesso") {
  const notif = document.createElement("div");
  notif.textContent = mensagem;
  Object.assign(notif.style, {
    position: "fixed",
    bottom: "100px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: tipo === "erro" ? "#e74c3c" : "var(--accent-strong, #8b5edd)",
    color: "#fff",
    padding: "12px 24px",
    borderRadius: "40px",
    fontWeight: "bold",
    zIndex: "9999",
    boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
    opacity: "0",
    transition: "opacity 0.3s ease, transform 0.3s ease",
    maxWidth: "90vw",
    textAlign: "center",
    fontSize: "0.9rem",
  });
  document.body.appendChild(notif);
  requestAnimationFrame(() => {
    notif.style.opacity = "1";
    notif.style.transform = "translateX(-50%) translateY(-10px)";
  });
  setTimeout(() => {
    notif.style.opacity = "0";
    notif.style.transform = "translateX(-50%) translateY(0)";
    setTimeout(() => notif.remove(), 300);
  }, 2200);
}

// ==========================================
// 🏆 MARCOS DE CONQUISTA
// ==========================================
const MARCOS = [
  { valor: 100, icone: "🥉", texto: "100" },
  { valor: 1000, icone: "🥈", texto: "1k" },
  { valor: 10000, icone: "🥇", texto: "10k" },
  { valor: 100000, icone: "💎", texto: "100k" },
  { valor: 500000, icone: "🌟", texto: "500k" },
  { valor: 1000000, icone: "👑", texto: "1M" },
];

function renderizarMarcos() {
  let container = document.getElementById("marcos-mascote");
  if (!container) {
    container = document.createElement("div");
    container.id = "marcos-mascote";
    container.className = "marcos-container";
    const info = document.querySelector(".mascote-info");
    const statsDiv = document.querySelector(".mascote-stats");
    if (info && statsDiv) {
      statsDiv.insertAdjacentElement("afterend", container);
    }
  }
  container.innerHTML = MARCOS.map(
    (m) => `
    <div class="marco ${carinhosGlobais >= m.valor ? "ativo" : ""}" title="${
      m.valor.toLocaleString("pt-BR")
    } carinhos">
      <span>${m.icone}</span><span>${m.texto}</span>
    </div>
  `
  ).join("");
}

function verificarNovoMarco(valorAnterior, valorNovo) {
  MARCOS.forEach((marco) => {
    if (valorAnterior < marco.valor && valorNovo >= marco.valor) {
      if (!marcosAnteriores.has(marco.valor)) {
        marcosAnteriores.add(marco.valor);
        soltarConfete(marco.valor >= 1000000 ? 120 : 40);
        tocarSom(marco.valor >= 1000000 ? "limite" : "marco");
        mostrarNotificacao(
          `${marco.icone} NOVO MARCO: ${marco.valor.toLocaleString(
            "pt-BR"
          )} CARINHOS! 🎉`,
          "sucesso"
        );
      }
    }
  });
}

// ==========================================
// 🎨 ATUALIZAR UI
// ==========================================
function atualizarProgresso() {
  if (progressoFill) {
    const percentual = Math.min((carinhosGlobais / LIMITE_CARINHOS) * 100, 100);
    progressoFill.style.width = `${percentual}%`;
  }
  if (progressoTexto) {
    progressoTexto.textContent = `${carinhosGlobais.toLocaleString(
      "pt-BR"
    )} / ${LIMITE_CARINHOS.toLocaleString("pt-BR")}`;
  }
  if (mascoteLikesSpan) {
    mascoteLikesSpan.textContent = carinhosGlobais.toLocaleString("pt-BR");
  }
  if (meusCarinhosSpan) {
    meusCarinhosSpan.textContent = meusCarinhos.toLocaleString("pt-BR");
  }
}

function atingiuLimite() {
  return carinhosGlobais >= LIMITE_CARINHOS;
}

function atualizarBotaoLimite() {
  if (!btnCarinho) return;
  if (atingiuLimite()) {
    btnCarinho.disabled = true;
    btnCarinho.style.opacity = "0.85";
    btnCarinho.style.cursor = "not-allowed";
    btnCarinho.innerHTML = '<i class="fa-solid fa-trophy"></i> 🏆 MISSÃO CUMPRIDA! 🏆';
    mascoteSection?.classList.add("limite-atingido");

    if (mascoteImagem && !document.querySelector(".medalha-conquista")) {
      const medalha = document.createElement("div");
      medalha.className = "medalha-conquista";
      medalha.innerHTML = "🏆";
      medalha.title = "1 MILHÃO DE CARINHOS!";
      mascoteImagem.appendChild(medalha);
    }

    if (mascoteImagem && !document.querySelector(".coroa-mascote")) {
      const coroa = document.createElement("div");
      coroa.className = "coroa-mascote";
      coroa.innerHTML = "👑";
      coroa.title = "O mascote é LENDÁRIO!";
      mascoteImagem.appendChild(coroa);
    }
  } else {
    btnCarinho.disabled = false;
    btnCarinho.style.opacity = "1";
    btnCarinho.style.cursor = "pointer";
    btnCarinho.innerHTML = '<i class="fa-solid fa-heart"></i> Dar carinho';
  }
}

// ==========================================
// 🏆 RANKING DO MASCOTE
// ==========================================
function renderizarRanking() {
  if (!rankingLista) return;
  const data = rankingDataCache || {};
  const entradas = Object.keys(data)
    .map((mat) => ({ matricula: mat, carinhos: Number(data[mat]) || 0 }))
    .filter((e) => e.carinhos > 0)
    .sort((a, b) => b.carinhos - a.carinhos)
    .slice(0, 10);

  if (entradas.length === 0) {
    rankingLista.innerHTML = `
      <div class="ranking-vazio">
        <i class="fa-regular fa-heart"></i>
        <span>Ninguém deu carinho ainda. Seja o primeiro!</span>
      </div>`;
    if (rankingMinhaPosicao) rankingMinhaPosicao.textContent = "—";
    if (rankingMeusCarinhos)
      rankingMeusCarinhos.textContent = "(0 carinhos)";
    return;
  }

  const medalhas = ["🥇", "🥈", "🥉"];
  rankingLista.innerHTML = entradas
    .map((e, i) => {
      const perfil = perfisCache[e.matricula] || {};
      const nome = perfil.nome || perfil.nomeCompleto || "Aluno " + e.matricula.slice(-4);
      const foto =
        perfil.foto ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=random`;
      const ehEu = e.matricula === MINHA_MATRICULA;
      const medalha = medalhas[i] || "";
      return `
        <div class="ranking-item ${ehEu ? "eu" : ""}">
          <span class="ranking-posicao">${medalha || i + 1}º</span>
          <img class="ranking-avatar" src="${foto}" alt="${nome}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=random'">
          <div class="ranking-info">
            <span class="ranking-nome">${nome}${ehEu ? " (você)" : ""}</span>
            ${medalha ? `<span class="ranking-medalha">Top ${i + 1}</span>` : ""}
          </div>
          <span class="ranking-carinhos"><i class="fa-solid fa-heart"></i> ${e.carinhos.toLocaleString("pt-BR")}</span>
        </div>`;
    })
    .join("");

  const todasOrdenadas = Object.keys(data)
    .map((mat) => ({ matricula: mat, carinhos: Number(data[mat]) || 0 }))
    .sort((a, b) => b.carinhos - a.carinhos);
  const minhaPos = todasOrdenadas.findIndex((e) => e.matricula === MINHA_MATRICULA);
  const meus = meusCarinhos || 0;

  if (rankingMinhaPosicao) {
    rankingMinhaPosicao.textContent = minhaPos >= 0 ? minhaPos + 1 : "—";
  }
  if (rankingMeusCarinhos) {
    rankingMeusCarinhos.textContent = `(${meus.toLocaleString("pt-BR")} carinho${meus === 1 ? "" : "s"})`;
  }
}

// Escuta perfis (para pegar nome e foto no ranking)
onValue(ref(db, "perfis_alunos"), (snap) => {
  perfisCache = snap.val() || {};
  renderizarRanking();
});

// Escuta ranking em tempo real
onValue(ref(db, "mascote/por_aluno"), (snap) => {
  rankingDataCache = snap.val() || {};
  renderizarRanking();
});

// Toggle colapsar
btnToggleRanking?.addEventListener("click", () => {
  const colapsado = mascoteRankingEl?.classList.toggle("colapsado");
  btnToggleRanking.setAttribute("aria-expanded", colapsado ? "false" : "true");
});

// ==========================================
// 💾 FIREBASE — leitura em tempo real
// ==========================================
const totalRef = ref(db, "mascote/total_carinhos");
const meuRef = ref(db, "mascote/por_aluno/" + MINHA_MATRICULA);

onValue(totalRef, (snap) => {
  const anterior = carinhosGlobais;
  carinhosGlobais = Number(snap.val()) || 0;
  atualizarProgresso();
  atualizarBotaoLimite();
  renderizarMarcos();
  verificarNovoMarco(anterior, carinhosGlobais);
});

onValue(meuRef, (snap) => {
  meusCarinhos = Number(snap.val()) || 0;
  atualizarProgresso();
  renderizarRanking();
});

// ==========================================
// 💖 DAR CARINHO (com cooldown + transaction)
// ==========================================
async function darCarinho(event) {
  if (!podeClicar) return;

  if (atingiuLimite()) {
    mostrarNotificacao("🎉 JÁ BATEMOS 1 MILHÃO! O MASCOTE É LENDÁRIO! 🎉", "erro");
    return;
  }

  podeClicar = false;
  setTimeout(() => {
    podeClicar = true;
  }, COOLDOWN_MS);

  if (mascoteImg) {
    mascoteImg.classList.add("clicando");
    setTimeout(() => mascoteImg.classList.remove("clicando"), 350);
  }
  tocarSom("carinho");

  // ==========================================
  // 🆕 REGISTRA CLIQUE + XP (sistema global)
  // ==========================================
  const cliquesAntes = window.obterCliquesMascote
    ? window.obterCliquesMascote()
    : parseInt(localStorage.getItem("xp_cliques_mascote") || "0", 10);

  if (window.adicionarCliqueMascote) {
    window.adicionarCliqueMascote(1);
  } else {
    localStorage.setItem("xp_cliques_mascote", String(cliquesAntes + 1));
  }

  if (window.adicionarXP) {
    window.adicionarXP(1, "clique_mascote");
  } else {
    const xpAtual = parseInt(localStorage.getItem("xp_total") || "0", 10);
    localStorage.setItem("xp_total", String(xpAtual + 1));
  }

  // Recalcula a barra da próxima skin
  atualizarProgressoSkin();

  // 🆕 Detecta desbloqueio de skin nova
  const cliquesDepois = cliquesAntes + 1;
  const SKINS_BLOQUEAVEIS = [
    { id: "simpson", meta: 1500, nomeKey: "skin_simpson" },
    { id: "mafioso", meta: 3000, nomeKey: "skin_mafioso" },
  ];
  const traduzir = window.t ? window.t : (k) => k;

  SKINS_BLOQUEAVEIS.forEach((s) => {
    if (cliquesAntes < s.meta && cliquesDepois >= s.meta) {
      // 🎉 Acabou de desbloquear!
      soltarConfete(80);
      tocarSom("desbloqueio");
      const nome = traduzir(s.nomeKey) || s.id;
      setTimeout(() => {
        mostrarNotificacao(`🎉 NOVA SKIN DESBLOQUEADA: ${nome}!`, "sucesso");
      }, 400);
    }
  });

  // ==========================================
  // Corações voando
  // ==========================================
  let x, y;
  if (event && event.clientX && event.clientY) {
    x = event.clientX;
    y = event.clientY;
  } else if (mascoteImg) {
    const rect = mascoteImg.getBoundingClientRect();
    x = rect.left + rect.width / 2;
    y = rect.top + rect.height / 2;
  } else {
    x = window.innerWidth / 2;
    y = window.innerHeight / 2;
  }
  const numCoracoes = carinhosGlobais / LIMITE_CARINHOS > 0.9 ? 6 : 3;
  for (let i = 0; i < numCoracoes; i++) {
    setTimeout(() => {
      criarCoracao(
        x + (Math.random() - 0.5) * 80,
        y + (Math.random() - 0.5) * 80
      );
    }, i * 60);
  }

  try {
    await runTransaction(totalRef, (valorAtual) => {
      const v = Number(valorAtual) || 0;
      if (v >= LIMITE_CARINHOS) return v;
      return v + 1;
    });
    await runTransaction(meuRef, (valorAtual) => {
      const v = Number(valorAtual) || 0;
      return v + 1;
    });
  } catch (err) {
    console.error("[mascote] Erro ao salvar carinho:", err);
  }

  const faltam = LIMITE_CARINHOS - carinhosGlobais - 1;
  let frases;
  if (faltam <= 1000) {
    frases = [
      `🎯 FALTAM ${faltam.toLocaleString("pt-BR")} CARINHOS!`,
      `💪 ÚLTIMO EMPURRÃO!`,
      `🏁 QUASE 1 MILHÃO!`,
    ];
  } else if (faltam <= 100000) {
    frases = [
      `🔥 Faltam só ${faltam.toLocaleString("pt-BR")}!`,
      `💪 Continue assim!`,
      `✨ Rumo ao 1 MILHÃO!`,
    ];
  } else {
    frases = [
      "🥰 Obrigado pelo carinho!",
      "💖 Você é demais!",
      "🐾 Auuu! Adorei!",
      "🤗 Mais um carinho!",
      "✨ Que fofo!",
    ];
  }
  if (Math.random() < 0.35) {
    mostrarNotificacao(frases[Math.floor(Math.random() * frases.length)]);
  }
}

// ==========================================
// 🔗 EVENTOS
// ==========================================
if (btnCarinho) btnCarinho.addEventListener("click", darCarinho);
if (mascoteImg) mascoteImg.addEventListener("click", darCarinho);

// ==========================================
// 🎁 FUNÇÕES EXTRAS
// ==========================================
window.resetarCarinhos = function () {
  if (!confirm("⚠️ Resetar os carinhos? Só admin deveria fazer isso."))
    return;
  set(totalRef, 0);
  set(meuRef, 0);
  mostrarNotificacao("🔄 Carinhos resetados!", "sucesso");
};