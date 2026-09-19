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
const COOLDOWN_MS = 350; // delay leve pra não spammar Firebase
const MATRICULA_STORAGE_KEY = "mascote_matricula_temp";

// ==========================================
// ESTADO
// ==========================================
let carinhosGlobais = 0;
let meusCarinhos = 0;
let podeClicar = true;
let somLigado = localStorage.getItem("mascote_som") !== "off";
let marcosAnteriores = new Set();

// ==========================================
// PEGA MATRÍCULA (tenta SUAP → cookie → localStorage)
// ==========================================
function obterMatricula() {
  // 1) Cookie do SUAP (definido no login)
  const matCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("matricula="));
  if (matCookie) return matCookie.split("=")[1];

  // 2) LocalStorage (se o login já salvou)
  const matLocal = localStorage.getItem("matricula_suap");
  if (matLocal) return matLocal;

  // 3) Temporário — gera um ID anônimo se não estiver logado
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
const mascoteMensagensSpan = document.getElementById("mascote-mensagens");
const progressoFill = document.getElementById("progresso-fill");
const progressoTexto = document.getElementById("progresso-texto");
const mascoteSection = document.querySelector(".mascote-section");
const mascoteImagem = document.querySelector(".mascote-imagem");

// ==========================================
// 🔊 ÁUDIOS (base64 curtos, sem arquivos externos)
// ==========================================
const SOM_CARINHO = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQBvT18AAAAAAQAAAAAAAAAAAAAAAAAAAAAA"; // placeholder silencioso

let audioCtx = null;
function tocarSom(tipo = "carinho") {
  if (!somLigado) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    // Gera um "pop" curto programaticamente
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (tipo === "carinho") {
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } else if (tipo === "marco") {
      // Fanfarra curta
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
      // Som épico
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
    }
  } catch (e) {
    // navegador pode bloquear antes de interação do usuário
  }
}

// Botão de mute
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
// 🎨 CORAÇÕES VOANDO
// ==========================================
function criarCoracao(x, y) {
  const coracao = document.createElement("div");
  coracao.innerHTML = '<i class="fa-solid fa-heart"></i>';
  coracao.className = "coracao-animado";
  coracao.style.left = x - 15 + "px";
  coracao.style.top = y - 15 + "px";
  document.body.appendChild(coracao);
  setTimeout(() => coracao.remove(), 1200);
}

// ==========================================
// 🎉 CONFETES (nos marcos e no 1M)
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
// 📊 MARCOS DE CONQUISTA
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
  // Atualiza meus carinhos também
  const meuSpan = document.getElementById("meus-carinhos");
  if (meuSpan) meuSpan.textContent = meusCarinhos.toLocaleString("pt-BR");
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
    btnCarinho.innerHTML =
      '<i class="fa-solid fa-trophy"></i> 🏆 MISSÃO CUMPRIDA! 🏆';
    mascoteSection?.classList.add("limite-atingido");

    if (mascoteImagem && !document.querySelector(".medalha-conquista")) {
      const medalha = document.createElement("div");
      medalha.className = "medalha-conquista";
      medalha.innerHTML = "🏆";
      medalha.title = "1 MILHÃO DE CARINHOS!";
      mascoteImagem.appendChild(medalha);
    }

    // 🆕 Coroa em cima do mascote
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
    btnCarinho.innerHTML =
      '<i class="fa-solid fa-heart"></i> Dar carinho';
  }
}

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
});

// ==========================================
// 💖 DAR CARINHO (com cooldown + transaction)
// ==========================================
async function darCarinho(event) {
  if (!podeClicar) return;

  // Se já bateu o limite, avisa
  if (atingiuLimite()) {
    mostrarNotificacao(
      "🎉 JÁ BATEMOS 1 MILHÃO! O MASCOTE É LENDÁRIO! 🎉",
      "erro"
    );
    return;
  }

  // Trava o clique (cooldown leve)
  podeClicar = false;
  setTimeout(() => {
    podeClicar = true;
  }, COOLDOWN_MS);

  // Reação visual
  if (mascoteImg) {
    mascoteImg.classList.add("clicando");
    setTimeout(() => mascoteImg.classList.remove("clicando"), 350);
  }
  tocarSom("carinho");

  // Corações no local do clique
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

  // 💾 Firebase: incrementa global + individual com transaction (evita race)
  try {
    await runTransaction(totalRef, (valorAtual) => {
      const v = Number(valorAtual) || 0;
      if (v >= LIMITE_CARINHOS) return v; // não passa do limite
      return v + 1;
    });
    await runTransaction(meuRef, (valorAtual) => {
      const v = Number(valorAtual) || 0;
      return v + 1;
    });
  } catch (err) {
    console.error("[mascote] Erro ao salvar carinho:", err);
  }

  // Mensagem aleatória
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
    // Só mostra 35% das vezes pra não encher
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