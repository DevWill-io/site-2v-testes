// ==========================================
// CONFIGURAÇÕES DO SUAP
// ==========================================
var CLIENT_ID = "St1KggSNx1eA8FnNe5Bi8jfM7MODYSFZGUaj8cpf";
var REDIRECT_URI = "https://infoweb-2v-devlopers.vercel.app/login.html";
var SUAP_URL = "https://suap.ifrn.edu.br";
var SCOPE = "identificacao email documentos_pessoais";

// ==========================================
// 0. IMPORTAÇÕES DO FIREBASE (Versão 12)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  push,
  update,
  remove,
  get,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA_wDDRCRJL_WviT6FBorz8dhnHe0-pI8s",
  authDomain: "muralturmanormal.firebaseapp.com",
  projectId: "muralturmanormal",
  storageBucket: "muralturmanormal.firebasestorage.app",
  messagingSenderId: "993749229757",
  appId: "1:993749229757:web:ec87d8ca3b8950d70d57d4",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const recadosRef = ref(db, "mural_recados");
const perfisRef = ref(db, "perfis_alunos");

const MATRICULAS_ADMIN = ["20261101110002"];

window.usuarioLogado = {
  nome: "",
  matricula: "",
  foto: "",
  fotoOriginal: "",
};
let bancoDeRecados = [];
let bancoDePerfis = [];
let filtroRecadoTexto = "";
let filtroPerfilTexto = "";

// ==========================================
// AUXILIARES / SEGURANÇA / TOASTS
// ==========================================
function escaparHTML(texto) {
  if (!texto) return "";
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function converterLinks(textoEscapado) {
  if (!textoEscapado) return "";
  const urlRegex = /(https?:\/\/[^\s<]+)/g;
  return textoEscapado.replace(urlRegex, function (url) {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="link-destaque" style="color: #4cd137; text-decoration: underline;">${url}</a>`;
  });
}

function exibirToast(mensagem, tipo = "info") {
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; z-index: 10000;
      display: flex; flex-direction: column; gap: 10px; pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
  }
  const toast = document.createElement("div");
  const corBg = tipo === "erro" ? "#ff4757" : tipo === "sucesso" ? "#2ed573" : "#2f3542";
  toast.style.cssText = `
    background: ${corBg}; color: #fff; padding: 12px 20px; border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-size: 0.9em;
    pointer-events: auto; opacity: 0; transform: translateY(20px);
    transition: all 0.3s ease; font-family: sans-serif;
  `;
  toast.textContent = mensagem;
  toastContainer.appendChild(toast);
  setTimeout(() => { toast.style.opacity = "1"; toast.style.transform = "translateY(0)"; }, 10);
  setTimeout(() => {
    toast.style.opacity = "0"; toast.style.transform = "translateY(20px)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function nomeParaExibicao(nome) {
  var partes = String(nome || "Usuário").trim().split(/\s+/);
  if (partes.length < 2) return partes[0] || "Usuário";
  return partes[0] + " " + partes[partes.length - 1].charAt(0) + ".";
}

function matriculaParaExibicao(matricula) {
  var valor = String(matricula || "");
  if (valor.length <= 4) return "Matrícula protegida";
  return "******" + valor.slice(-4);
}

function parseDuracaoParaHoras(valor) {
  if (!valor) return 24 * 7;
  let str = String(valor).trim().toLowerCase();
  let horas = 0;
  if (str.endsWith("h")) horas = parseFloat(str.replace("h", ""));
  else if (str.endsWith("d")) horas = parseFloat(str.replace("d", "")) * 24;
  else horas = parseFloat(str) * 24;
  if (isNaN(horas) || horas <= 0) horas = 24 * 7;
  if (horas < 1) horas = 1;
  if (horas > 360) horas = 360;
  return Math.round(horas);
}

function calcularTempoRestante(timestampCriacao, duracaoHoras) {
  const agora = Date.now();
  const tempoLimite = timestampCriacao + duracaoHoras * 60 * 60 * 1000;
  const msRestantes = tempoLimite - agora;
  if (msRestantes <= 0) return `Expirado`;
  const horasRestantes = Math.floor(msRestantes / (1000 * 60 * 60));
  const diasRestantes = Math.floor(horasRestantes / 24);
  if (diasRestantes > 1) return `Expira em ${diasRestantes} dias`;
  else if (diasRestantes === 1) return `Expira amanhã`;
  else if (horasRestantes > 0) return `Expira em ${horasRestantes}h`;
  else {
    const minRestantes = Math.floor(msRestantes / (1000 * 60));
    return `Expira em ${minRestantes} min`;
  }
}

// ==========================================
// 1. TEMA
// ==========================================
const themeToggle = document.getElementById("theme-toggle");
if (themeToggle) {
  const themeIcon = themeToggle.querySelector("i");
  const currentTheme = localStorage.getItem("theme") || "dark";
  if (currentTheme === "light") {
    document.body.classList.add("light-theme");
    if (themeIcon) themeIcon.classList.replace("fa-moon", "fa-sun");
  }
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    let theme = "dark";
    if (document.body.classList.contains("light-theme")) {
      theme = "light";
      if (themeIcon) themeIcon.classList.replace("fa-moon", "fa-sun");
    } else {
      if (themeIcon) themeIcon.classList.replace("fa-sun", "fa-moon");
    }
    localStorage.setItem("theme", theme);
  });
}

// ==========================================
// 2. FIREBASE LISTENERS
// ==========================================
onValue(recadosRef, (snapshot) => {
  bancoDeRecados = [];
  const agora = Date.now();
  snapshot.forEach((childSnapshot) => {
    const recado = childSnapshot.val();
    const id = childSnapshot.key;
    const timestampCriacao = recado.timestamp || agora;
    const duracaoHoras = recado.duracao_horas || (recado.duracao_dias ? recado.duracao_dias * 24 : 7 * 24);
    const tempoDeVidaMs = duracaoHoras * 60 * 60 * 1000;
    if (agora - timestampCriacao > tempoDeVidaMs) {
      remove(ref(db, "mural_recados/" + id));
    } else {
      bancoDeRecados.push({ id, ...recado, timestampCriacao, duracaoHoras });
    }
  });
  window.renderizarMural();
});

onValue(perfisRef, (snapshot) => {
  bancoDePerfis = [];
  snapshot.forEach((childSnapshot) => {
    const dados = childSnapshot.val() || {};
    bancoDePerfis.push({ id: childSnapshot.key, ...dados });
  });
  window.renderizarPerfis();
  if (window.usuarioLogado.matricula) {
    const meuPerfil = bancoDePerfis.find(
      (p) =>
        String(p.matricula) === String(window.usuarioLogado.matricula) ||
        String(p.id) === String(window.usuarioLogado.matricula)
    );
    if (meuPerfil && typeof window.aplicarPerfilNoCard === "function") {
      window.aplicarPerfilNoCard(meuPerfil);
    }
  }
});

// ==========================================
// 3. ENVIO DE RECADOS
// ==========================================
const formRecado = document.getElementById("form-recado");
if (formRecado) {
  formRecado.addEventListener("submit", function (e) {
    e.preventDefault();
    const msgInput = document.getElementById("recado-mensagem");
    const linkInput = document.getElementById("recado-link");
    const selectDuracao = document.getElementById("recado-duracao");
    const mensagemBruta = msgInput ? msgInput.value.trim() : "";
    if (!mensagemBruta) { exibirToast("Escreva uma mensagem antes de enviar!", "erro"); return; }
    const mensagemSegura = escaparHTML(mensagemBruta);
    const linkAnexo = linkInput ? escaparHTML(linkInput.value.trim()) : "";
    const nomeSeguro = escaparHTML(window.usuarioLogado.nome);
    const valorInputDuracao = selectDuracao ? selectDuracao.value : "7d";
    const duracaoTotalHoras = parseDuracaoParaHoras(valorInputDuracao);
    push(recadosRef, {
      autor_nome: nomeSeguro,
      autor_matricula: window.usuarioLogado.matricula,
      mensagem: mensagemSegura,
      link_anexo: linkAnexo,
      data: new Date().toLocaleDateString("pt-BR"),
      timestamp: Date.now(),
      duracao_horas: duracaoTotalHoras,
      likes: [],
      comentarios: {},
    })
      .then(() => {
        exibirToast("Recado publicado com sucesso!", "sucesso");
        if (msgInput) msgInput.value = "";
        if (linkInput) linkInput.value = "";
        const contador = document.getElementById("contador-caracteres");
        if (contador) contador.textContent = "0";
      })
      .catch((err) => exibirToast("Erro ao enviar recado: " + err.message, "erro"));
  });
}

const recadoMensagemInput = document.getElementById("recado-mensagem");
if (recadoMensagemInput) {
  recadoMensagemInput.addEventListener("input", function (e) {
    const contador = document.getElementById("contador-caracteres");
    if (contador) contador.textContent = e.target.value.length;
  });
}

// ==========================================
// 4. MURAL — MÉTODOS GLOBAIS
// ==========================================
const inputBuscaMural = document.getElementById("busca-recados");
if (inputBuscaMural) {
  inputBuscaMural.addEventListener("input", function (e) {
    filtroRecadoTexto = e.target.value.toLowerCase().trim();
    window.renderizarMural();
  });
}

const inputBuscaPerfis = document.getElementById("busca-perfis");
if (inputBuscaPerfis) {
  inputBuscaPerfis.addEventListener("input", function (e) {
    filtroPerfilTexto = e.target.value.toLowerCase().trim();
    window.renderizarPerfis();
  });
}

window.abrirModalPerfil = function (identificador) {
  const modal = document.getElementById("modal-perfil");
  if (!modal) return;
  const perfil = bancoDePerfis.find((p) => {
    const mat = String(p.matricula || "").trim();
    const id = String(p.id || "").trim();
    const alvo = String(identificador || "").trim();
    return mat === alvo || id === alvo;
  });
  if (!perfil) { exibirToast("Perfil não encontrado.", "erro"); return; }
  const imgEl = document.getElementById("modal-perfil-foto");
  const nomeEl = document.getElementById("modal-perfil-nome");
  const matEl = document.getElementById("modal-perfil-matricula");
  const acessoEl = document.getElementById("modal-perfil-acesso");
  const bioEl = document.getElementById("modal-perfil-bio");
  const redesEl = document.getElementById("modal-perfil-redes");
  const nomeExibir = perfil.nomeCompleto || perfil.nome || "Não informado";
  const fotoExibir = perfil.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(nomeExibir)}&background=random`;
  if (imgEl) imgEl.src = fotoExibir;
  if (nomeEl) nomeEl.textContent = nomeExibir;
  if (matEl) matEl.textContent = perfil.matricula || perfil.id || "Não informada";
  if (acessoEl) {
    acessoEl.textContent = perfil.ultimoAcesso
      ? new Date(perfil.ultimoAcesso).toLocaleString("pt-BR")
      : "Não registrado";
  }
  if (bioEl) {
    if (perfil.bio && String(perfil.bio).trim()) {
      bioEl.textContent = perfil.bio;
      bioEl.classList.remove("is-hidden");
    } else {
      bioEl.textContent = "";
      bioEl.classList.add("is-hidden");
    }
  }
  if (redesEl) {
    const links = montarLinksRedes(perfil.redes);
    if (links.length > 0) {
      redesEl.innerHTML = links
        .map((l) => `<a href="${l.url}" target="_blank" rel="noopener noreferrer" title="${l.titulo}" aria-label="${l.titulo}" class="modal-rede-link"><i class="${l.icone}"></i></a>`)
        .join("");
      redesEl.classList.remove("is-hidden");
    } else {
      redesEl.innerHTML = "";
      redesEl.classList.add("is-hidden");
    }
  }
  modal.classList.remove("is-hidden");
};

window.fecharModalPerfil = function () {
  const modal = document.getElementById("modal-perfil");
  if (modal) modal.classList.add("is-hidden");
};

window.renderizarMural = function () {
  const lista = document.getElementById("lista-recados");
  if (!lista) return;
  lista.innerHTML = "";
  const recadosFiltrados = bancoDeRecados.filter((r) => {
    if (!filtroRecadoTexto) return true;
    const msg = (r.mensagem || "").toLowerCase();
    const autor = (r.autor_nome || "").toLowerCase();
    return msg.includes(filtroRecadoTexto) || autor.includes(filtroRecadoTexto);
  });
  if (recadosFiltrados.length === 0) {
    lista.innerHTML = '<p class="sem-recados" style="text-align: center; opacity: 0.7; padding: 15px;">Nenhum recado encontrado.</p>';
    return;
  }
  const recadosReversos = [...recadosFiltrados].reverse();
  const ehAdmin = MATRICULAS_ADMIN.includes(window.usuarioLogado.matricula);
  recadosReversos.forEach((recado) => {
    const jaCurtiu = recado.likes && recado.likes.includes(window.usuarioLogado.matricula);
    const iconeCoracao = jaCurtiu ? "fa-solid fa-heart" : "fa-regular fa-heart";
    const corCoracao = jaCurtiu ? "color: #ff4757;" : "";
    const totalLikes = recado.likes ? recado.likes.length : 0;
    const textoExpiracao = calcularTempoRestante(recado.timestampCriacao, recado.duracaoHoras);
    const ehAutor = recado.autor_matricula === window.usuarioLogado.matricula;
    const btnExcluir = ehAutor || ehAdmin
      ? `<button type="button" class="btn-like" style="color: #ff4757;" onclick="excluirRecado('${recado.id}')" title="${ehAdmin && !ehAutor ? "Excluir como Admin" : "Excluir meu recado"}"><i class="fa-solid fa-trash"></i></button>`
      : "";
    const btnEditar = ehAutor || ehAdmin
      ? `<button type="button" class="btn-like" style="color: #eccc68;" onclick="editarRecado('${recado.id}')" title="${ehAdmin && !ehAutor ? "Editar como Admin" : "Editar meu recado"}"><i class="fa-solid fa-pen"></i></button>`
      : "";
    const mensagemComLinks = converterLinks(escaparHTML(recado.mensagem));
    const nomeSeguro = escaparHTML(nomeParaExibicao(recado.autor_nome));
    const tagEditado = recado.editado
      ? ' <small style="opacity: 0.6; font-style: italic;">(editado)</small>'
      : "";
    const anexoHTML = recado.link_anexo
      ? `<div class="recado-anexo" style="margin-top: 8px;"><a href="${recado.link_anexo}" target="_blank" rel="noopener noreferrer" style="font-size: 0.85em; color: #70a1ff; text-decoration: underline;"><i class="fa-solid fa-paperclip"></i> Ver anexo</a></div>`
      : "";
    const comentariosObj = recado.comentarios || {};
    const listaComentarios = Object.keys(comentariosObj).map((cId) => ({ cId, ...comentariosObj[cId] }));
    const totalComentarios = listaComentarios.length;
    let htmlComentarios = "";
    listaComentarios.forEach((com) => {
      const ehAutorCom = com.autor_matricula === window.usuarioLogado.matricula;
      const btnDelCom = ehAutorCom || ehAdmin
        ? `<button type="button" style="background:none; border:none; color:#ff4757; cursor:pointer; font-size:0.8em;" onclick="excluirComentario('${recado.id}', '${com.cId}')"><i class="fa-solid fa-xmark"></i></button>`
        : "";
      htmlComentarios += `
        <div class="comentario-item" style="display:flex; justify-content:space-between; align-items:center; background: rgba(255,255,255,0.05); padding: 6px 10px; border-radius: 6px; margin-top: 5px; font-size: 0.85em;">
          <div style="flex:1;"><strong>${escaparHTML(com.autor_nome)}:</strong> ${converterLinks(escaparHTML(com.texto))}</div>
          ${btnDelCom}
        </div>`;
    });
    const div = document.createElement("div");
    div.className = "recado-item";
    div.innerHTML = `
      <div class="recado-header">
        <span class="recado-nome">${nomeSeguro}</span>
        <span class="recado-data" title="${textoExpiracao}">
          <i class="fa-regular fa-clock" style="font-size: 0.85em; margin-right: 3px;"></i>${recado.data}${tagEditado} • <small style="opacity: 0.8;">${textoExpiracao}</small>
        </span>
      </div>
      <p class="recado-mensagem">${mensagemComLinks}</p>
      ${anexoHTML}
      <div class="recado-acoes" style="margin-top: 10px; display: flex; gap: 8px; align-items: center;">
        ${btnEditar}
        ${btnExcluir}
        <button type="button" class="btn-like" style="${corCoracao}" onclick="curtirRecado('${recado.id}')"><i class="${iconeCoracao}"></i> ${totalLikes}</button>
        <button type="button" class="btn-like" onclick="alternarComentarios('${recado.id}')" title="Comentários"><i class="fa-regular fa-comment"></i> ${totalComentarios}</button>
      </div>
      <div id="box-comentarios-${recado.id}" class="box-comentarios" style="display: none; margin-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px;">
        <div id="lista-comentarios-${recado.id}">${htmlComentarios}</div>
        <div style="display: flex; gap: 5px; margin-top: 8px;">
          <input type="text" id="input-comentario-${recado.id}" placeholder="Escreva um comentário..." style="flex:1; padding: 6px 10px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: inherit; font-size: 0.85em;" />
          <button type="button" onclick="adicionarComentario('${recado.id}')" style="padding: 6px 12px; border-radius: 4px; border: none; background: #70a1ff; color: white; cursor: pointer; font-size: 0.85em;">Enviar</button>
        </div>
      </div>
    `;
    lista.appendChild(div);
  });
};

window.alternarComentarios = function (recadoId) {
  const box = document.getElementById(`box-comentarios-${recadoId}`);
  if (box) box.style.display = box.style.display === "none" ? "block" : "none";
};

window.adicionarComentario = function (recadoId) {
  const inputEl = document.getElementById(`input-comentario-${recadoId}`);
  if (!inputEl) return;
  const texto = inputEl.value.trim();
  if (!texto) { exibirToast("Escreva um comentário antes de enviar.", "erro"); return; }
  const comentariosRef = ref(db, `mural_recados/${recadoId}/comentarios`);
  push(comentariosRef, {
    autor_nome: escaparHTML(window.usuarioLogado.nome),
    autor_matricula: window.usuarioLogado.matricula,
    texto: escaparHTML(texto),
    timestamp: Date.now(),
  })
    .then(() => { exibirToast("Comentário adicionado!", "sucesso"); inputEl.value = ""; })
    .catch((err) => exibirToast("Erro: " + err.message, "erro"));
};

window.excluirComentario = function (recadoId, comentarioId) {
  const itemRef = ref(db, `mural_recados/${recadoId}/comentarios/${comentarioId}`);
  get(itemRef).then((snapshot) => {
    const com = snapshot.val();
    if (com) {
      const ehAdmin = MATRICULAS_ADMIN.includes(window.usuarioLogado.matricula);
      const ehAutor = com.autor_matricula === window.usuarioLogado.matricula;
      if (!ehAutor && !ehAdmin) { exibirToast("Você não tem permissão para excluir este comentário!", "erro"); return; }
      if (confirm("Deseja excluir este comentário?")) {
        remove(itemRef).then(() => exibirToast("Comentário removido.", "sucesso"));
      }
    }
  });
};

window.renderizarPerfis = function () {
  const container = document.getElementById("lista-perfis");
  if (!container) return;
  container.innerHTML = "";
  const filtro = String(filtroPerfilTexto || "").trim().toLowerCase();
  const perfisFiltrados = bancoDePerfis.filter((p) => {
    if (!filtro) return true;
    const nome = (p.nomeCompleto || p.nome || "").toLowerCase();
    const mat = String(p.matricula || "").toLowerCase();
    return nome.includes(filtro) || mat.includes(filtro);
  });
  const contadorEl = document.getElementById("contador-membros");
  if (contadorEl) contadorEl.textContent = `${bancoDePerfis.length} membro(s) cadastrado(s)`;
  if (perfisFiltrados.length === 0) {
    container.innerHTML = `
      <p class="sem-perfis" style="text-align:center; opacity:0.7; padding:20px; grid-column: 1 / -1;">
        ${bancoDePerfis.length === 0 ? "Nenhum membro cadastrado ainda. Os alunos aparecerão aqui após fazerem login." : "Nenhum perfil corresponde ao filtro."}
      </p>`;
    return;
  }
  perfisFiltrados.forEach((perfil) => {
    const card = document.createElement("div");
    card.className = "perfil-card";
    const identificador = perfil.matricula || perfil.id;
    card.setAttribute("onclick", `abrirModalPerfil('${identificador}')`);
    card.style.cursor = "pointer";
    const nomeExibir = perfil.nomeCompleto || perfil.nome || "Usuário sem nome";
    const fotoFinal = perfil.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(nomeExibir)}&background=random`;
    card.innerHTML = `
      <div class="perfil-avatar">
        <img src="${escaparHTML(fotoFinal)}" alt="${escaparHTML(nomeExibir)}" onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(nomeExibir)}&background=random'" />
      </div>
      <div class="perfil-info">
        <h4 class="perfil-nome">${escaparHTML(nomeExibir)}</h4>
        <span class="perfil-matricula">${escaparHTML(matriculaParaExibicao(perfil.matricula || perfil.id))}</span>
      </div>
    `;
    container.appendChild(card);
  });
};

window.editarRecado = function (id) {
  const itemRef = ref(db, "mural_recados/" + id);
  get(itemRef).then((snapshot) => {
    const recado = snapshot.val();
    if (recado) {
      const ehAdmin = MATRICULAS_ADMIN.includes(window.usuarioLogado.matricula);
      const ehAutor = recado.autor_matricula === window.usuarioLogado.matricula;
      if (!ehAutor && !ehAdmin) { exibirToast("Você não tem permissão para editar este recado!", "erro"); return; }
      const textoAtual = recado.mensagem.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#039;/g, "'");
      const novaMensagem = prompt("1/2 - Edite a sua mensagem:", textoAtual);
      if (novaMensagem !== null && novaMensagem.trim() !== "") {
        const horasAtuais = recado.duracao_horas || (recado.duracao_dias ? recado.duracao_dias * 24 : 168);
        const tempoAtualStr = horasAtuais % 24 === 0 ? horasAtuais / 24 + "d" : horasAtuais + "h";
        const promptTempo = '2/2 - Digite o tempo de duração.\nUse "h" para horas ou "d" para dias.\n(Ex: 5h, 12h, 2d, 15d)';
        const novosDiasInput = prompt(promptTempo, tempoAtualStr);
        let novasHoras = horasAtuais;
        if (novosDiasInput !== null && novosDiasInput.trim() !== "") {
          novasHoras = parseDuracaoParaHoras(novosDiasInput);
        }
        const mensagemSegura = escaparHTML(novaMensagem.trim());
        update(itemRef, { mensagem: mensagemSegura, duracao_horas: novasHoras, editado: true })
          .then(() => exibirToast("Recado atualizado com sucesso!", "sucesso"))
          .catch((err) => exibirToast("Erro: " + err.message, "erro"));
      }
    }
  });
};

window.curtirRecado = function (id) {
  const itemRef = ref(db, "mural_recados/" + id);
  get(itemRef).then((snapshot) => {
    const recado = snapshot.val();
    if (recado) {
      let likes = recado.likes || [];
      const indexLike = likes.indexOf(window.usuarioLogado.matricula);
      if (indexLike === -1) likes.push(window.usuarioLogado.matricula);
      else likes.splice(indexLike, 1);
      update(itemRef, { likes: likes });
    }
  });
};

window.excluirRecado = function (id) {
  const itemRef = ref(db, "mural_recados/" + id);
  get(itemRef).then((snapshot) => {
    const recado = snapshot.val();
    if (recado) {
      const ehAdmin = MATRICULAS_ADMIN.includes(window.usuarioLogado.matricula);
      const ehAutor = recado.autor_matricula === window.usuarioLogado.matricula;
      if (!ehAutor && !ehAdmin) { exibirToast("Você não tem permissão para excluir este recado!", "erro"); return; }
      if (confirm("Tem certeza que deseja excluir este recado?")) {
        remove(itemRef).then(() => exibirToast("Recado excluído com sucesso.", "sucesso")).catch((err) => exibirToast("Erro: " + err.message, "erro"));
      }
    }
  });
};

window.forceLogout = function () {
  if (typeof suap !== "undefined") suap.logout();
  document.cookie = "suapToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "suapToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/login;";
  document.cookie = "suapToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=" + window.location.hostname + "; path=/;";
  localStorage.removeItem("suapToken");
  sessionStorage.clear();
  window.location.replace(window.location.origin + "/login.html");
};

// ==========================================
// 4.5. EDIÇÃO DE PERFIL
// ==========================================
const CHAVE_STORAGE_PERFIL = "perfil_custom_";
const MAX_FOTO_BYTES = 500 * 1024;
let perfilUsuarioAtual = null;

function limparArroba(valor) {
  return String(valor || "").trim().replace(/^@+/, "").replace(/\s+/g, "");
}

function montarLinksRedes(redes) {
  if (!redes) return [];
  const links = [];
  if (redes.tiktok) links.push({ url: `https://tiktok.com/@${limparArroba(redes.tiktok)}`, icone: "fa-brands fa-tiktok", titulo: "TikTok" });
  if (redes.instagram) links.push({ url: `https://instagram.com/${limparArroba(redes.instagram)}`, icone: "fa-brands fa-instagram", titulo: "Instagram" });
  if (redes.github) links.push({ url: `https://github.com/${limparArroba(redes.github)}`, icone: "fa-brands fa-github", titulo: "GitHub" });
  if (redes.email) links.push({ url: `mailto:${redes.email}`, icone: "fa-solid fa-envelope", titulo: "Email" });
  if (redes.site) links.push({ url: redes.site, icone: "fa-solid fa-globe", titulo: "Site" });
  return links;
}

function comprimirImagem(file, maxLado = 500, qualidade = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) { reject(new Error("Arquivo não é uma imagem.")); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxLado) { height = Math.round((height * maxLado) / width); width = maxLado; }
        else if (height > maxLado) { width = Math.round((width * maxLado) / height); height = maxLado; }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        let qualidadeAtual = qualidade;
        let dataUrl = canvas.toDataURL("image/jpeg", qualidadeAtual);
        let tentativas = 0;
        while (dataUrl.length * 0.75 > MAX_FOTO_BYTES && tentativas < 5 && qualidadeAtual > 0.4) {
          qualidadeAtual -= 0.12;
          dataUrl = canvas.toDataURL("image/jpeg", qualidadeAtual);
          tentativas++;
        }
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Falha ao carregar imagem."));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Falha ao ler arquivo."));
    reader.readAsDataURL(file);
  });
}

function salvarPerfilLocal(matricula, perfil) {
  try { localStorage.setItem(CHAVE_STORAGE_PERFIL + matricula, JSON.stringify(perfil)); }
  catch (e) { console.warn("Falha ao salvar no localStorage:", e); }
}

function lerPerfilLocal(matricula) {
  try {
    const raw = localStorage.getItem(CHAVE_STORAGE_PERFIL + matricula);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

window.aplicarPerfilNoCard = function (perfil) {
  if (!perfil) return;
  perfilUsuarioAtual = perfil;
  const fotoEl = document.getElementById("user-foto");
  const nomeEl = document.getElementById("user-nome");
  const bioEl = document.getElementById("user-bio");
  const redesEl = document.getElementById("user-redes");
  if (fotoEl && perfil.foto) fotoEl.src = perfil.foto;
  if (nomeEl) nomeEl.textContent = perfil.nomeCompleto || perfil.nome || window.usuarioLogado.nome || "Usuário";
  if (bioEl) {
    if (perfil.bio) { bioEl.textContent = perfil.bio; bioEl.classList.remove("is-hidden"); }
    else { bioEl.textContent = ""; bioEl.classList.add("is-hidden"); }
  }
  if (redesEl) {
    const links = montarLinksRedes(perfil.redes);
    redesEl.innerHTML = links
      .map((l) => `<a href="${l.url}" target="_blank" rel="noopener noreferrer" title="${l.titulo}" aria-label="${l.titulo}"><i class="${l.icone}"></i></a>`)
      .join("");
  }
  if (perfil.foto) window.usuarioLogado.foto = perfil.foto;
  if (perfil.nome) window.usuarioLogado.nome = perfil.nome;
  const btn = document.getElementById("btn-editar-perfil");
  const label = document.getElementById("btn-editar-perfil-label");
  if (btn && label) {
    btn.disabled = false;
    label.textContent = "Editar Perfil";
    btn.title = "Personalize seu perfil";
  }
};

window.carregarPerfilUsuario = function (matricula) {
  if (!matricula) return Promise.resolve(null);
  const local = lerPerfilLocal(matricula);
  if (local) window.aplicarPerfilNoCard(local);
  return get(ref(db, "perfis_alunos/" + matricula))
    .then((snap) => {
      const dados = snap.val();
      if (!dados) return local;
      const perfilFinal = {
        nome: dados.nome || (local && local.nome) || window.usuarioLogado.nome,
        nomeCompleto: dados.nomeCompleto || (local && local.nomeCompleto) || "",
        matricula: dados.matricula || matricula,
        foto: dados.foto || (local && local.foto) || window.usuarioLogado.foto,
        bio: dados.bio || (local && local.bio) || "",
        redes: dados.redes || (local && local.redes) || {},
        perfilEditadoEm: dados.perfilEditadoEm || (local && local.perfilEditadoEm) || 0,
        ultimoAcesso: dados.ultimoAcesso || Date.now(),
      };
      window.aplicarPerfilNoCard(perfilFinal);
      salvarPerfilLocal(matricula, perfilFinal);
      return perfilFinal;
    })
    .catch((err) => { console.warn("Falha ao consultar Firebase, usando local:", err); return local; });
};

window.abrirModalEditarPerfil = function () {
  if (!perfilUsuarioAtual) { exibirToast("Perfil ainda não carregado. Aguarde um instante.", "erro"); return; }
  const bloqueioEl = document.getElementById("edit-perfil-bloqueio");
  const btnSalvar = document.getElementById("btn-salvar-perfil");
  const inputFoto = document.getElementById("edit-foto-input");
  document.getElementById("edit-nome").value = perfilUsuarioAtual.nome || "";
  document.getElementById("edit-bio").value = perfilUsuarioAtual.bio || "";
  document.getElementById("edit-bio-count").textContent = (perfilUsuarioAtual.bio || "").length;
  const redes = perfilUsuarioAtual.redes || {};
  document.getElementById("edit-tiktok").value = redes.tiktok ? "@" + limparArroba(redes.tiktok) : "";
  document.getElementById("edit-instagram").value = redes.instagram ? "@" + limparArroba(redes.instagram) : "";
  document.getElementById("edit-github").value = redes.github ? "@" + limparArroba(redes.github) : "";
  document.getElementById("edit-email").value = redes.email || "";
  document.getElementById("edit-site").value = redes.site || "";
  document.getElementById("edit-avatar-preview").src = perfilUsuarioAtual.foto || "";
  if (inputFoto) { inputFoto.value = ""; delete inputFoto.dataset.novaFoto; delete inputFoto.dataset.restaurar; inputFoto.disabled = false; }
  if (bloqueioEl) bloqueioEl.classList.add("is-hidden");
  if (btnSalvar) btnSalvar.disabled = false;
  document.querySelectorAll("#form-editar-perfil input, #form-editar-perfil textarea").forEach((el) => (el.disabled = false));
  const btnRestaurar = document.getElementById("btn-restaurar-foto");
  if (btnRestaurar) btnRestaurar.disabled = false;
  const btnUpload = document.querySelector(".btn-upload");
  if (btnUpload) { btnUpload.style.pointerEvents = "auto"; btnUpload.style.opacity = "1"; }
  const modal = document.getElementById("modal-editar-perfil");
  if (modal) modal.classList.remove("is-hidden");
};

window.fecharModalEditarPerfil = function () {
  const modal = document.getElementById("modal-editar-perfil");
  if (modal) modal.classList.add("is-hidden");
};

function inicializarModalEditarPerfil() {
  const btnEditar = document.getElementById("btn-editar-perfil");
  if (btnEditar) btnEditar.addEventListener("click", window.abrirModalEditarPerfil);
  const inputFoto = document.getElementById("edit-foto-input");
  if (inputFoto) {
    inputFoto.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) { exibirToast("Imagem muito grande (máx 5MB).", "erro"); return; }
      try {
        const dataUrl = await comprimirImagem(file);
        document.getElementById("edit-avatar-preview").src = dataUrl;
        inputFoto.dataset.novaFoto = dataUrl;
        delete inputFoto.dataset.restaurar;
      } catch (err) { exibirToast("Erro ao processar imagem: " + err.message, "erro"); }
    });
  }
  const btnRestaurar = document.getElementById("btn-restaurar-foto");
  if (btnRestaurar) {
    btnRestaurar.addEventListener("click", () => {
      const fotoOriginal = window.usuarioLogado.fotoOriginal || window.usuarioLogado.foto;
      document.getElementById("edit-avatar-preview").src = fotoOriginal;
      if (inputFoto) { delete inputFoto.dataset.novaFoto; inputFoto.dataset.restaurar = "1"; inputFoto.value = ""; }
    });
  }
  const bioInput = document.getElementById("edit-bio");
  if (bioInput) {
    bioInput.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/[\r\n]+/g, " ");
      const count = document.getElementById("edit-bio-count");
      if (count) count.textContent = e.target.value.length;
    });
  }
  const form = document.getElementById("form-editar-perfil");
  if (form) form.addEventListener("submit", async (e) => { e.preventDefault(); await salvarPerfilEditado(); });
  const modal = document.getElementById("modal-editar-perfil");
  if (modal) modal.addEventListener("click", (e) => { if (e.target === modal) window.fecharModalEditarPerfil(); });
}

async function salvarPerfilEditado() {
  const matricula = window.usuarioLogado.matricula;
  if (!matricula) { exibirToast("Matrícula não encontrada.", "erro"); return; }
  const inputFoto = document.getElementById("edit-foto-input");
  let fotoFinal;
  if (inputFoto && inputFoto.dataset.restaurar === "1") fotoFinal = window.usuarioLogado.fotoOriginal || window.usuarioLogado.foto;
  else if (inputFoto && inputFoto.dataset.novaFoto) fotoFinal = inputFoto.dataset.novaFoto;
  else fotoFinal = perfilUsuarioAtual.foto || window.usuarioLogado.foto;
  const nome = document.getElementById("edit-nome").value.trim();
  if (!nome) { exibirToast("Informe um nome de exibição.", "erro"); return; }
  const bio = document.getElementById("edit-bio").value.replace(/[\r\n]+/g, " ").trim().slice(0, 160);
  const redes = {
    tiktok: limparArroba(document.getElementById("edit-tiktok").value),
    instagram: limparArroba(document.getElementById("edit-instagram").value),
    github: limparArroba(document.getElementById("edit-github").value),
    email: document.getElementById("edit-email").value.trim(),
    site: document.getElementById("edit-site").value.trim(),
  };
  if (redes.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(redes.email)) { exibirToast("Email inválido.", "erro"); return; }
  if (redes.site && !/^https?:\/\/.+/.test(redes.site)) { exibirToast("Site deve começar com http:// ou https://", "erro"); return; }
  const agora = Date.now();
  const perfilAtualizado = {
    nome,
    nomeCompleto: perfilUsuarioAtual.nomeCompleto || window.usuarioLogado.nome,
    matricula,
    foto: fotoFinal,
    bio,
    redes,
    perfilEditadoEm: agora,
    ultimoAcesso: agora,
  };
  const btnSalvar = document.getElementById("btn-salvar-perfil");
  const textoOriginal = btnSalvar.innerHTML;
  btnSalvar.disabled = true;
  btnSalvar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
  try {
    await update(ref(db, "perfis_alunos/" + matricula), perfilAtualizado);
    salvarPerfilLocal(matricula, perfilAtualizado);
    window.aplicarPerfilNoCard(perfilAtualizado);
    exibirToast("Perfil atualizado com sucesso!", "sucesso");
    window.fecharModalEditarPerfil();
  } catch (err) {
    console.error(err);
    exibirToast("Erro ao salvar perfil: " + err.message, "erro");
  } finally {
    btnSalvar.disabled = false;
    btnSalvar.innerHTML = textoOriginal;
  }
}

// ==========================================
// 5. INTEGRAÇÃO SUAP E BOLETIM
// ==========================================
var suap = new SuapClient(SUAP_URL, CLIENT_ID, REDIRECT_URI, SCOPE);
suap.init();

function formatarNota(valor) {
  if (valor === null || valor === undefined || valor === "") return null;
  var nota = Number(String(valor).replace(",", "."));
  return Number.isFinite(nota) ? nota : null;
}

function textoNota(valor) {
  return valor === null ? "-" : valor.toFixed(1);
}

function atualizarStatusNotas(mensagem, tipo) {
  var status = document.getElementById("notas-status");
  if (!status) return;
  var variante = tipo === true ? "erro" : (typeof tipo === "string" ? tipo : "info");
  var icones = {
    info: "fa-circle-info",
    loading: "fa-spinner",
    sucesso: "fa-circle-check",
    erro: "fa-circle-exclamation",
  };
  status.className = "notas-status" + (variante === "loading" ? " loading" : (variante === "info" ? "" : " " + variante));
  status.innerHTML = `<i class="fa-solid ${icones[variante] || icones.info}"></i> ${mensagem}`;
}

/* ---------- Detecção robusta Semestral/Anual ---------- */
function obterEtapasDaDisciplina(disciplina) {
  // 1) Se o SUAP manda explicitamente, respeita
  if (disciplina.segundo_semestre === true) {
    return { tipo: "Semestral", etapas: [3, 4] };
  }
  if (disciplina.segundo_semestre === false) {
    return { tipo: "Semestral", etapas: [1, 2] };
  }

  // 2) Fallback: verifica notas lançadas
  var tem12 = [1, 2].some(function (n) {
    var e = disciplina["nota_etapa_" + n];
    return formatarNota(e && typeof e === "object" ? e.nota : e) !== null;
  });
  var tem34 = [3, 4].some(function (n) {
    var e = disciplina["nota_etapa_" + n];
    return formatarNota(e && typeof e === "object" ? e.nota : e) !== null;
  });

  // 3) Só tem nota em 3/4 → semestral do 2º
  if (tem34 && !tem12) return { tipo: "Semestral", etapas: [3, 4] };

  // 4) Tem nota nos dois blocos → ANUAL
  if (tem12 && tem34) return { tipo: "Anual", etapas: [1, 2, 3, 4] };

  // 5) Só tem em 1/2
  if (tem12) {
    var temCampo34 = ("nota_etapa_3" in disciplina) || ("nota_etapa_4" in disciplina);
    if (temCampo34) return { tipo: "Anual", etapas: [1, 2, 3, 4] };
    return { tipo: "Semestral", etapas: [1, 2] };
  }

  // 6) Nenhuma nota: se tem campos 3/4 declarados → anual
  if (("nota_etapa_3" in disciplina) || ("nota_etapa_4" in disciplina)) {
    return { tipo: "Anual", etapas: [1, 2, 3, 4] };
  }
  return { tipo: "Semestral", etapas: [1, 2] };
}

// ==========================================
// 5.1 ESTADO GLOBAL DA CALCULADORA
// ==========================================
var __notasCache = [];
var __metaAtual = 60;
var __filtroAtivo = "todas";
var __sortKey = null;
var __sortDir = "asc";
var __simulacoes = {};
var __metasDisciplinas = {};
var __gruposColapsados = { Semestral: false, Anual: false };
var __historicoPeriodos = [];

const MATRICULA_STORAGE_KEY = () => "metas_disc_" + (window.usuarioLogado.matricula || "anon");
const LIMITE_FALTAS_PCT = 0.25;
const LIMITE_FALTAS_ALERTA = 0.20;
const CARGA_HORARIA_PADRAO = 60;

// ==========================================
// 5.2 HELPERS
// ==========================================
function getCodigoDisc(d) {
  return String(d.codigo_diario || d.disciplina || d.id || "disc").trim();
}

function metaEfetiva(d) {
  var cod = getCodigoDisc(d);
  return __metasDisciplinas[cod] != null ? __metasDisciplinas[cod] : __metaAtual;
}

function classificarStatusNota(media, faltas, meta) {
  var limite = CARGA_HORARIA_PADRAO * LIMITE_FALTAS_PCT;
  if (faltas > limite) return "reprovado";
  if (media === null) return "recuperacao";
  if (media >= meta) return "aprovado";
  if (media >= meta * 0.6) return "recuperacao";
  return "reprovado";
}

function calcularMediaSimples(d, etapas, simulacao) {
  var notas = etapas.map(function (n) {
    var etapa = d["nota_etapa_" + n];
    return formatarNota(etapa && typeof etapa === "object" ? etapa.nota : etapa);
  });

  var preenchidasReais = notas.filter(function (v) { return v !== null; });
  var somaReal = preenchidasReais.reduce(function (a, b) { return a + b; }, 0);

  var temEtapaAberta = preenchidasReais.length < etapas.length;
  var usarSimulacao = (simulacao != null) && temEtapaAberta;

  if (usarSimulacao) {
    var comSim = preenchidasReais.concat([simulacao]);
    var somaSim = comSim.reduce(function (a, b) { return a + b; }, 0);
    return {
      media: somaSim / comSim.length,
      preenchidasReais: preenchidasReais.length,
      preenchidasComSim: comSim.length,
      somaReal: somaReal,
      somaComSim: somaSim,
      temEtapaAberta: temEtapaAberta,
      simulando: true,
    };
  }

  var mediaApi = formatarNota(d.media_disciplina);
  return {
    media: preenchidasReais.length ? somaReal / preenchidasReais.length : mediaApi,
    preenchidasReais: preenchidasReais.length,
    preenchidasComSim: preenchidasReais.length,
    somaReal: somaReal,
    somaComSim: somaReal,
    temEtapaAberta: temEtapaAberta,
    simulando: false,
  };
}

function calcularProjecaoDisciplina(notasPreenchidas, totalEtapas, soma, meta) {
  var faltantes = totalEtapas - notasPreenchidas;
  if (faltantes <= 0) {
    var mediaFinal = notasPreenchidas ? soma / notasPreenchidas : null;
    if (mediaFinal === null) return { texto: "Sem notas", classe: "projecao-alerta" };
    return mediaFinal >= meta
      ? { texto: "Meta atingida", classe: "projecao-ok" }
      : { texto: "Abaixo da meta", classe: "projecao-ruim" };
  }
  var necessaria = (meta * totalEtapas - soma) / faltantes;
  if (necessaria <= 0) return { texto: "Meta garantida", classe: "projecao-ok" };
  if (necessaria > 100) return { texto: "Meta inviável", classe: "projecao-ruim" };
  return { texto: "Precisa " + necessaria.toFixed(1), classe: "projecao-alerta" };
}

// ==========================================
// 5.3 METAS POR DISCIPLINA
// ==========================================
function carregarMetasDisciplinas() {
  var mat = window.usuarioLogado.matricula;
  if (!mat) return;
  try {
    var local = localStorage.getItem(MATRICULA_STORAGE_KEY());
    if (local) __metasDisciplinas = JSON.parse(local) || {};
  } catch (e) { __metasDisciplinas = {}; }

  get(ref(db, "metas_disciplinas/" + mat))
    .then(function (snap) {
      var dados = snap.val();
      if (dados && typeof dados === "object") {
        __metasDisciplinas = dados;
        try { localStorage.setItem(MATRICULA_STORAGE_KEY(), JSON.stringify(dados)); } catch (e) {}
        if (__notasCache.length) renderizarNotas(__notasCache);
      }
    })
    .catch(function (err) { console.warn("[metas] firebase erro:", err); });
}

function salvarMetasDisciplinas() {
  var mat = window.usuarioLogado.matricula;
  if (!mat) return Promise.resolve();
  try { localStorage.setItem(MATRICULA_STORAGE_KEY(), JSON.stringify(__metasDisciplinas)); } catch (e) {}
  return update(ref(db, "metas_disciplinas/" + mat), __metasDisciplinas)
    .catch(function (err) { console.warn("[metas] save erro:", err); });
}

// ==========================================
// 5.4 ORDENAÇÃO
// ==========================================
function ordenarDisciplinas(lista) {
  if (!__sortKey) return lista;
  var meta = __metaAtual;
  var copia = lista.slice();
  copia.sort(function (a, b) {
    var va, vb;
    if (__sortKey === "nome") {
      va = (a.disciplina || a.codigo_diario || "").toLowerCase();
      vb = (b.disciplina || b.codigo_diario || "").toLowerCase();
      return __sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    }
    if (__sortKey === "media") {
      va = calcularMediaSimples(a, obterEtapasDaDisciplina(a).etapas, __simulacoes[getCodigoDisc(a)]).media;
      vb = calcularMediaSimples(b, obterEtapasDaDisciplina(b).etapas, __simulacoes[getCodigoDisc(b)]).media;
      va = va === null ? -1 : va; vb = vb === null ? -1 : vb;
    } else if (__sortKey === "faltas") {
      va = Number(a.numero_faltas) || 0;
      vb = Number(b.numero_faltas) || 0;
    } else if (__sortKey === "status") {
      var ordem = { reprovado: 0, recuperacao: 1, aprovado: 2 };
      var ma = calcularMediaSimples(a, obterEtapasDaDisciplina(a).etapas, __simulacoes[getCodigoDisc(a)]).media;
      var mb = calcularMediaSimples(b, obterEtapasDaDisciplina(b).etapas, __simulacoes[getCodigoDisc(b)]).media;
      va = ordem[classificarStatusNota(ma, Number(a.numero_faltas) || 0, meta)];
      vb = ordem[classificarStatusNota(mb, Number(b.numero_faltas) || 0, meta)];
    }
    if (va < vb) return __sortDir === "asc" ? -1 : 1;
    if (va > vb) return __sortDir === "asc" ? 1 : -1;
    return 0;
  });
  return copia;
}

function aplicarSort(key) {
  if (__sortKey === key) __sortDir = __sortDir === "asc" ? "desc" : "asc";
  else { __sortKey = key; __sortDir = key === "media" ? "desc" : "asc"; }
  document.querySelectorAll(".tabela-notas thead th.sortable").forEach(function (th) {
    th.classList.remove("sort-asc", "sort-desc");
    if (th.dataset.sort === __sortKey) th.classList.add(__sortDir === "asc" ? "sort-asc" : "sort-desc");
  });
  if (__notasCache.length) renderizarNotas(__notasCache);
}

// ==========================================
// 5.5 RESUMO + ALERTA + HISTÓRICO
// ==========================================
function atualizarResumoNotas(disciplinas) {
  var elMedia = document.getElementById("resumo-media");
  var elDisc = document.getElementById("resumo-disciplinas");
  var elRisco = document.getElementById("resumo-risco");
  var elFaltas = document.getElementById("resumo-faltas");
  if (!elMedia && !elDisc && !elRisco && !elFaltas) return;

  var total = disciplinas.length;
  var somaMedias = 0, contMedias = 0, faltasTotais = 0, emRisco = 0;

  disciplinas.forEach(function (d) {
    var etapas = obterEtapasDaDisciplina(d).etapas;
    var calc = calcularMediaSimples(d, etapas, __simulacoes[getCodigoDisc(d)]);
    var faltas = Number(d.numero_faltas) || 0;
    if (calc.media !== null) { somaMedias += calc.media; contMedias++; }
    faltasTotais += faltas;
    var st = classificarStatusNota(calc.media, faltas, metaEfetiva(d));
    if (st !== "aprovado") emRisco++;
  });

  var mediaGeral = contMedias ? somaMedias / contMedias : null;
  if (elMedia) elMedia.textContent = mediaGeral !== null ? mediaGeral.toFixed(1) : "—";
  if (elDisc) elDisc.textContent = total || "—";
  if (elRisco) elRisco.textContent = emRisco;
  if (elFaltas) elFaltas.textContent = faltasTotais;
}

function alertaDeFaltas(disciplinas) {
  var antigo = document.querySelector(".alerta-faltas");
  if (antigo) antigo.remove();

  var alertaMax = 0, discCritica = null;
  var limiteReprov = CARGA_HORARIA_PADRAO * LIMITE_FALTAS_PCT;
  var limiteAlerta = CARGA_HORARIA_PADRAO * LIMITE_FALTAS_ALERTA;

  disciplinas.forEach(function (d) {
    var faltas = Number(d.numero_faltas) || 0;
    if (faltas >= limiteReprov && faltas > alertaMax) {
      alertaMax = faltas;
      discCritica = { nome: d.disciplina || d.codigo_diario, faltas: faltas, nivel: "danger" };
    } else if (faltas >= limiteAlerta && (!discCritica || discCritica.nivel !== "danger")) {
      if (faltas > alertaMax) {
        alertaMax = faltas;
        discCritica = { nome: d.disciplina || d.codigo_diario, faltas: faltas, nivel: "warn" };
      }
    }
  });

  if (!discCritica) return;
  var panel = document.querySelector(".notas-panel");
  if (!panel) return;
  var banner = document.createElement("div");
  banner.className = "alerta-faltas " + discCritica.nivel;
  banner.innerHTML = discCritica.nivel === "danger"
    ? `<i class="fa-solid fa-triangle-exclamation"></i><span><strong>Atenção!</strong> Você está com <strong>${discCritica.faltas} faltas</strong> em <em>${escaparHTML(discCritica.nome)}</em> — próximo do limite de reprovação por falta (${limiteReprov}).</span>`
    : `<i class="fa-solid fa-circle-exclamation"></i><span><strong>Cuidado:</strong> ${discCritica.faltas} faltas em <em>${escaparHTML(discCritica.nome)}</em>. Fique atento!</span>`;
  var refEl = panel.querySelector(".notas-controls");
  if (refEl) panel.insertBefore(banner, refEl);
  else panel.insertBefore(banner, panel.firstChild);
}

function atualizarHistoricoComDisciplinas(disciplinas, periodoLabel, ano) {
  if (!disciplinas || !disciplinas.length) return;
  var soma = 0, cont = 0;
  disciplinas.forEach(function (d) {
    var etapas = obterEtapasDaDisciplina(d).etapas;
    var calc = calcularMediaSimples(d, etapas, null);
    if (calc.media !== null) { soma += calc.media; cont++; }
  });
  var media = cont ? soma / cont : null;
  var idx = __historicoPeriodos.findIndex(function (h) { return h.periodo === periodoLabel; });
  var entry = { periodo: periodoLabel, media: media, disciplinas: disciplinas.length, ano: ano };
  if (idx >= 0) __historicoPeriodos[idx] = entry;
  else __historicoPeriodos.push(entry);
  __historicoPeriodos.sort(function (a, b) { return b.periodo.localeCompare(a.periodo); });
  renderizarHistorico();
  var panel = document.getElementById("historico-panel");
  if (panel) panel.classList.remove("is-hidden");
}

function renderizarHistorico() {
  var container = document.getElementById("historico-content");
  if (!container) return;
  if (__historicoPeriodos.length < 1) {
    container.innerHTML = '<p class="historico-vazio">Carregue pelo menos 1 período para ver o histórico.</p>';
    return;
  }
  var cronologico = __historicoPeriodos.slice().sort(function (a, b) { return a.periodo.localeCompare(b.periodo); });
  var mapa = {};
  cronologico.forEach(function (h, i) {
    mapa[h.periodo] = i > 0 ? (h.media !== null && cronologico[i - 1].media !== null ? h.media - cronologico[i - 1].media : null) : null;
  });
  container.innerHTML = __historicoPeriodos.map(function (h) {
    var diff = mapa[h.periodo];
    var trendHTML = "";
    if (diff !== null && diff !== undefined) {
      if (diff > 0.3) trendHTML = `<span class="periodo-trend up"><i class="fa-solid fa-arrow-up"></i> +${diff.toFixed(1)}</span>`;
      else if (diff < -0.3) trendHTML = `<span class="periodo-trend down"><i class="fa-solid fa-arrow-down"></i> ${diff.toFixed(1)}</span>`;
      else trendHTML = `<span class="periodo-trend eq"><i class="fa-solid fa-minus"></i> estável</span>`;
    }
    return `
      <div class="historico-card">
        <span class="periodo-label">${escaparHTML(h.periodo)}</span>
        <span class="periodo-media">${h.media !== null ? h.media.toFixed(1) : "—"}</span>
        <span class="periodo-info">${h.disciplinas} disciplina(s)</span>
        ${trendHTML}
      </div>`;
  }).join("");
}

// ==========================================
// 5.6 RENDERIZAR TABELA
// ==========================================
function renderizarNotas(disciplinas, apenasLinhaCodigo) {
  var corpo = document.getElementById("lista-notas");
  if (!corpo) return;

  var metaInput = document.getElementById("meta-notas");
  var meta = metaInput ? (formatarNota(metaInput.value) || 60) : 60;
  __metaAtual = meta;

  if (apenasLinhaCodigo && __notasCache.length) {
    var tr = corpo.querySelector(`tr[data-codigo="${CSS.escape(apenasLinhaCodigo)}"]`);
    if (tr) {
      var d = __notasCache.find(function (x) { return getCodigoDisc(x) === apenasLinhaCodigo; });
      if (d) {
        atualizarLinhaNota(tr, d, meta);
        atualizarResumoNotas(__notasCache);
        return;
      }
    }
  }

  __notasCache = disciplinas || [];
  corpo.innerHTML = "";

  if (!__notasCache.length) {
    corpo.innerHTML = '<tr><td colspan="8" class="notas-vazia"><i class="fa-solid fa-inbox"></i>Nenhuma disciplina encontrada neste período.</td></tr>';
    atualizarResumoNotas([]);
    return;
  }

  var visiveis = __notasCache.filter(function (d) {
    if (__filtroAtivo === "todas") return true;
    var etapas = obterEtapasDaDisciplina(d).etapas;
    var calc = calcularMediaSimples(d, etapas, __simulacoes[getCodigoDisc(d)]);
    var faltas = Number(d.numero_faltas) || 0;
    var st = classificarStatusNota(calc.media, faltas, metaEfetiva(d));
    if (__filtroAtivo === "risco") return st !== "aprovado";
    return st === __filtroAtivo;
  });

  if (!visiveis.length) {
    corpo.innerHTML = '<tr><td colspan="8" class="notas-vazia"><i class="fa-solid fa-filter-circle-xmark"></i>Nenhuma disciplina neste filtro.</td></tr>';
    atualizarResumoNotas(__notasCache);
    return;
  }

  visiveis = ordenarDisciplinas(visiveis);

  var grupos = { Semestral: [], Anual: [] };
  visiveis.forEach(function (d) {
    var cfg = obterEtapasDaDisciplina(d);
    grupos[cfg.tipo].push({ disciplina: d, etapas: cfg.etapas });
  });

  ["Semestral", "Anual"].forEach(function (tipo) {
    if (!grupos[tipo].length) return;

    var linhaGrupo = document.createElement("tr");
    linhaGrupo.className = "notas-grupo" + (__gruposColapsados[tipo] ? " colapsado" : "");
    linhaGrupo.dataset.grupo = tipo;
    linhaGrupo.innerHTML = `<th colspan="8">${tipo === "Semestral" ? "Matérias Semestrais" : "Matérias Anuais"}<span class="grupo-contador">${grupos[tipo].length} disciplina(s)</span></th>`;
    linhaGrupo.addEventListener("click", function () {
      __gruposColapsados[tipo] = !__gruposColapsados[tipo];
      linhaGrupo.classList.toggle("colapsado", __gruposColapsados[tipo]);
      document.querySelectorAll(`tr[data-grupo-linha="${tipo}"]`).forEach(function (tr) {
        tr.style.display = __gruposColapsados[tipo] ? "none" : "";
      });
    });
    corpo.appendChild(linhaGrupo);

    grupos[tipo].forEach(function (item) {
      var tr = criarLinhaNota(item.disciplina, item.etapas, tipo, meta);
      corpo.appendChild(tr);
    });
  });

  atualizarResumoNotas(__notasCache);
  alertaDeFaltas(__notasCache);
  bindSimuladores(corpo);
}

/* ---------- Criar uma linha ---------- */
function criarLinhaNota(d, etapas, tipo, meta) {
  var codigo = getCodigoDisc(d);
  var sim = __simulacoes[codigo];
  var faltas = Number(d.numero_faltas) || 0;
  var metaDisc = metaEfetiva(d);

  var calc = calcularMediaSimples(d, etapas, sim);
  var media = calc.media;
  var notasEtapas = etapas.map(function (n) {
    var etapa = d["nota_etapa_" + n];
    return formatarNota(etapa && typeof etapa === "object" ? etapa.nota : etapa);
  });

  var status = classificarStatusNota(media, faltas, metaDisc);
  var proj = calcularProjecaoDisciplina(calc.preenchidasComSim, etapas.length, calc.somaComSim, metaDisc);
  var faltasClasse = faltas > CARGA_HORARIA_PADRAO * LIMITE_FALTAS_PCT ? "critico"
                    : faltas > CARGA_HORARIA_PADRAO * LIMITE_FALTAS_ALERTA ? "alerta" : "";

  var badgeLabel = {
    aprovado: '<i class="fa-solid fa-check"></i> Aprovado',
    recuperacao: '<i class="fa-solid fa-rotate"></i> Recuperação',
    reprovado: '<i class="fa-solid fa-xmark"></i> Reprovado',
  }[status];

  var linhaRisco = (status === "reprovado" || faltasClasse === "critico") ? "linha-risco" : "";
  var linhaSim = calc.simulando ? "simulando" : "";

  var etapasHTML = notasEtapas.map(function (n) {
    return '<span class="etapa-pill">' + textoNota(n) + '</span>';
  }).join("");

  var percentual = media !== null ? Math.min(media, 100) : 0;
  var mediaHTML =
    '<div class="media-cell">' +
      '<span>' + textoNota(media) + '</span>' +
      '<div class="media-bar">' +
        '<div class="media-bar-fill ' + status + '" style="width:' + percentual + '%"></div>' +
      '</div>' +
    '</div>';

  var temEtapaEmAberto = calc.temEtapaAberta;
  var simuladorHTML = temEtapaEmAberto
    ? `<div class="simulador-cell">
         <input type="number" class="simulador-input" data-codigo="${escaparHTML(codigo)}"
                min="0" max="100" step="0.1" placeholder="Nota"
                value="${sim != null ? sim : ''}" />
         ${calc.simulando ? `<span class="simulador-resultado ${status === 'aprovado' ? 'ok' : status === 'recuperacao' ? 'mid' : 'ruim'}">${textoNota(media)}</span>` : ''}
       </div>`
    : '<span style="color:var(--text-muted);font-size:.8rem;">Fechada</span>';

  var metaCustom = __metasDisciplinas[codigo] != null;
  var metaHTML = `<button type="button" class="btn-meta-disciplina ${metaCustom ? 'customizada' : ''}"
                    data-codigo="${escaparHTML(codigo)}"
                    data-nome="${escaparHTML(d.disciplina || codigo)}"
                    title="Meta individual: ${metaDisc}">🎯</button>`;

  var tr = document.createElement("tr");
  tr.className = [linhaRisco, linhaSim].filter(Boolean).join(" ");
  tr.dataset.grupoLinha = tipo;
  tr.dataset.codigo = codigo;

  tr.innerHTML =
    '<td class="td-disciplina"><strong>' + escaparHTML(d.disciplina || d.codigo_diario || "Disciplina sem nome") + '</strong></td>' +
    '<td><div class="etapas-cell">' + (etapasHTML || '<span class="etapa-pill">—</span>') + '</div></td>' +
    '<td class="td-media">' + mediaHTML + '</td>' +
    '<td class="td-faltas"><span class="faltas-cell ' + faltasClasse + '">' + faltas + '</span></td>' +
    '<td class="td-projecao"><span class="projecao-cell ' + proj.classe + '">' + proj.texto + '</span></td>' +
    '<td class="td-status"><span class="badge badge-' + status + '">' + badgeLabel + '</span></td>' +
    '<td class="td-simulador">' + simuladorHTML + '</td>' +
    '<td class="td-meta">' + metaHTML + '</td>';

  return tr;
}

/* ---------- Update cirúrgico ---------- */
function atualizarLinhaNota(tr, d, meta) {
  var codigo = getCodigoDisc(d);
  var sim = __simulacoes[codigo];
  var faltas = Number(d.numero_faltas) || 0;
  var metaDisc = metaEfetiva(d);
  var etapas = obterEtapasDaDisciplina(d).etapas;

  var calc = calcularMediaSimples(d, etapas, sim);
  var media = calc.media;
  var status = classificarStatusNota(media, faltas, metaDisc);
  var proj = calcularProjecaoDisciplina(calc.preenchidasComSim, etapas.length, calc.somaComSim, metaDisc);

  tr.classList.toggle("linha-risco", status === "reprovado" || faltas > CARGA_HORARIA_PADRAO * LIMITE_FALTAS_PCT);
  tr.classList.toggle("simulando", calc.simulando);

  var tdMedia = tr.querySelector(".td-media");
  if (tdMedia) {
    var percentual = media !== null ? Math.min(media, 100) : 0;
    tdMedia.innerHTML =
      '<div class="media-cell">' +
        '<span>' + textoNota(media) + '</span>' +
        '<div class="media-bar">' +
          '<div class="media-bar-fill ' + status + '" style="width:' + percentual + '%"></div>' +
        '</div>' +
      '</div>';
  }

  var tdProj = tr.querySelector(".td-projecao");
  if (tdProj) tdProj.innerHTML = '<span class="projecao-cell ' + proj.classe + '">' + proj.texto + '</span>';

  var tdStatus = tr.querySelector(".td-status");
  if (tdStatus) {
    var badgeLabel = {
      aprovado: '<i class="fa-solid fa-check"></i> Aprovado',
      recuperacao: '<i class="fa-solid fa-rotate"></i> Recuperação',
      reprovado: '<i class="fa-solid fa-xmark"></i> Reprovado',
    }[status];
    tdStatus.innerHTML = '<span class="badge badge-' + status + '">' + badgeLabel + '</span>';
  }

  var tdSim = tr.querySelector(".td-simulador");
  if (tdSim) {
    var resultadoEl = tdSim.querySelector(".simulador-resultado");
    if (calc.simulando) {
      var classeRes = status === 'aprovado' ? 'ok' : status === 'recuperacao' ? 'mid' : 'ruim';
      if (resultadoEl) {
        resultadoEl.className = 'simulador-resultado ' + classeRes;
        resultadoEl.textContent = textoNota(media);
      } else {
        var input = tdSim.querySelector(".simulador-input");
        if (input) {
          var span = document.createElement("span");
          span.className = "simulador-resultado " + classeRes;
          span.textContent = textoNota(media);
          input.insertAdjacentElement("afterend", span);
        }
      }
    } else if (resultadoEl) {
      resultadoEl.remove();
    }
  }
}

/* ---------- Bind inputs ---------- */
function bindSimuladores(corpo) {
  corpo.querySelectorAll(".simulador-input").forEach(function (input) {
    if (input.dataset.bound) return;
    input.dataset.bound = "1";
    input.addEventListener("input", function () {
      var cod = input.dataset.codigo;
      var val = input.value.trim();
      if (val === "") delete __simulacoes[cod];
      else {
        var num = Number(String(val).replace(",", "."));
        if (Number.isFinite(num)) __simulacoes[cod] = Math.max(0, Math.min(100, num));
      }
      var tr = input.closest("tr");
      var d = __notasCache.find(function (x) { return getCodigoDisc(x) === cod; });
      if (tr && d) {
        atualizarLinhaNota(tr, d, __metaAtual);
        atualizarResumoNotas(__notasCache);
      }
    });
  });

  corpo.querySelectorAll(".btn-meta-disciplina").forEach(function (btn) {
    if (btn.dataset.bound) return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", function () {
      abrirModalMetaDisciplina(btn.dataset.codigo, btn.dataset.nome);
    });
  });
}

// ==========================================
// 5.7 MODAL META POR DISCIPLINA
// ==========================================
function abrirModalMetaDisciplina(codigo, nome) {
  var modal = document.getElementById("modal-meta-disciplina");
  if (!modal) return;
  var atual = __metasDisciplinas[codigo] != null ? __metasDisciplinas[codigo] : __metaAtual;
  var rangeInput = modal.querySelector('input[type="range"]');
  var numEl = modal.querySelector(".meta-num");
  var nomeEl = modal.querySelector(".meta-disciplina-nome");
  nomeEl.textContent = nome;
  rangeInput.value = atual;
  numEl.textContent = atual;
  rangeInput.oninput = function () { numEl.textContent = rangeInput.value; };

  var btnReset = modal.querySelector("[data-reset]");
  var btnSalvar = modal.querySelector("[data-salvar]");
  var btnFechar = modal.querySelector("[data-fechar]");

  btnReset.onclick = function () {
    delete __metasDisciplinas[codigo];
    salvarMetasDisciplinas();
    modal.classList.add("is-hidden");
    if (__notasCache.length) renderizarNotas(__notasCache);
    exibirToast("Meta individual removida — usando meta global.", "sucesso");
  };
  btnSalvar.onclick = function () {
    __metasDisciplinas[codigo] = Number(rangeInput.value);
    salvarMetasDisciplinas();
    modal.classList.add("is-hidden");
    if (__notasCache.length) renderizarNotas(__notasCache);
    exibirToast("Meta individual salva (" + rangeInput.value + ").", "sucesso");
  };
  btnFechar.onclick = function () { modal.classList.add("is-hidden"); };
  modal.onclick = function (e) { if (e.target === modal) modal.classList.add("is-hidden"); };

  modal.classList.remove("is-hidden");
}

// ==========================================
// 5.8 EXPORT CSV / PDF
// ==========================================
function exportarCSV() {
  if (!__notasCache.length) { exibirToast("Nada para exportar.", "erro"); return; }
  var linhas = [];
  linhas.push(["Disciplina", "Tipo", "Etapas", "Média", "Meta", "Faltas", "Projeção", "Status"].join(";"));

  __notasCache.forEach(function (d) {
    var cfg = obterEtapasDaDisciplina(d);
    var calc = calcularMediaSimples(d, cfg.etapas, __simulacoes[getCodigoDisc(d)]);
    var faltas = Number(d.numero_faltas) || 0;
    var meta = metaEfetiva(d);
    var st = classificarStatusNota(calc.media, faltas, meta);
    var proj = calcularProjecaoDisciplina(calc.preenchidasComSim, cfg.etapas.length, calc.somaComSim, meta);

    linhas.push([
      (d.disciplina || d.codigo_diario || "").replace(/;/g, ","),
      cfg.tipo,
      cfg.etapas.map(function (n) {
        var e = d["nota_etapa_" + n];
        return textoNota(formatarNota(e && typeof e === "object" ? e.nota : e));
      }).join(" | "),
      textoNota(calc.media),
      meta,
      faltas,
      proj.texto,
      st
    ].join(";"));
  });

  var csv = "\uFEFF" + linhas.join("\n");
  var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  var periodo = (document.getElementById("periodo-notas")?.value || "boletim").replace("/", ".");
  a.href = url;
  a.download = "boletim_" + periodo + ".csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  exibirToast("CSV exportado!", "sucesso");
}

function exportarPDF() {
  if (!__notasCache.length) { exibirToast("Nada para exportar.", "erro"); return; }
  var periodo = document.getElementById("periodo-notas")?.value || "";
  var nome = window.usuarioLogado.nome || "Aluno";
  var mat = window.usuarioLogado.matricula || "";

  var linhasHTML = "";
  ["Semestral", "Anual"].forEach(function (tipo) {
    var doTipo = __notasCache.filter(function (d) { return obterEtapasDaDisciplina(d).tipo === tipo; });
    if (!doTipo.length) return;
    linhasHTML += `<tr class="grupo"><td colspan="6"><strong>${tipo === "Semestral" ? "Matérias Semestrais" : "Matérias Anuais"}</strong></td></tr>`;
    doTipo.forEach(function (d) {
      var cfg = obterEtapasDaDisciplina(d);
      var calc = calcularMediaSimples(d, cfg.etapas, __simulacoes[getCodigoDisc(d)]);
      var faltas = Number(d.numero_faltas) || 0;
      var meta = metaEfetiva(d);
      var st = classificarStatusNota(calc.media, faltas, meta);
      var proj = calcularProjecaoDisciplina(calc.preenchidasComSim, cfg.etapas.length, calc.somaComSim, meta);
      var cor = st === "aprovado" ? "#10b981" : st === "recuperacao" ? "#f59e0b" : "#ff4757";
      linhasHTML += `
        <tr>
          <td>${escaparHTML(d.disciplina || d.codigo_diario || "")}</td>
          <td>${cfg.etapas.map(function (n) {
            var e = d["nota_etapa_" + n];
            return textoNota(formatarNota(e && typeof e === "object" ? e.nota : e));
          }).join(" | ")}</td>
          <td>${textoNota(calc.media)}</td>
          <td>${faltas}</td>
          <td>${proj.texto}</td>
          <td style="color:${cor};font-weight:700">${st}</td>
        </tr>`;
    });
  });

  var w = window.open("", "_blank");
  w.document.write(`
    <!doctype html><html><head><meta charset="utf-8">
    <title>Boletim ${escaparHTML(nome)}</title>
    <style>
      * { font-family: 'Segoe UI', Arial, sans-serif; }
      body { padding: 30px; color: #222; }
      h1 { font-size: 20px; margin: 0 0 4px; }
      .sub { color: #666; font-size: 12px; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
      th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
      th { background: #f3f0fa; }
      tr.grupo td { background: #ece7f8; font-size: 13px; }
      .rodape { margin-top: 24px; font-size: 10px; color: #999; text-align: center; }
      @media print { body { padding: 10px; } }
    </style></head><body>
    <h1>Boletim Acadêmico — ${escaparHTML(nome)}</h1>
    <div class="sub">Matrícula: ${escaparHTML(mat)} • Período: ${escaparHTML(periodo)} • Emitido em ${new Date().toLocaleString("pt-BR")}</div>
    <table>
      <thead><tr><th>Disciplina</th><th>Etapas</th><th>Média</th><th>Faltas</th><th>Projeção</th><th>Status</th></tr></thead>
      <tbody>${linhasHTML}</tbody>
    </table>
    <div class="rodape">Gerado automaticamente pelo Portal InfoWeb 2V — IFRN</div>
    <script>window.onload = () => setTimeout(() => window.print(), 300);<\/script>
    </body></html>
  `);
  w.document.close();
}

// ==========================================
// 5.9 CARREGAR BOLETIM
// ==========================================
function carregarBoletim(ano, periodo) {
  atualizarStatusNotas("Buscando notas no SUAP...", "loading");
  suap.getAuthenticatedResource(
    "/api/ensino/meu-boletim/" + encodeURIComponent(ano) + "/" + encodeURIComponent(periodo) + "/?page=1",
    function (resposta) {
      var disciplinas = resposta.results || [];
      renderizarNotas(disciplinas);
      var label = ano + "." + periodo;
      atualizarHistoricoComDisciplinas(disciplinas, label, ano);
      var total = resposta.count || disciplinas.length;
      atualizarStatusNotas(total + " disciplina(s) carregada(s).", "sucesso");
    },
    function (xhr) {
      renderizarNotas([]);
      atualizarStatusNotas("Não foi possível carregar o boletim (HTTP " + xhr.status + ").", "erro");
    }
  );
}

function carregarPeriodosNotas() {
  suap.getAuthenticatedResource(
    "/api/ensino/meus-periodos-letivos/?page=1",
    function (resposta) {
      var seletor = document.getElementById("periodo-notas");
      if (!seletor) return;
      var periodos = resposta.results || [];
      seletor.innerHTML = "";
      periodos.forEach(function (periodo, indice) {
        var opcao = document.createElement("option");
        opcao.value = periodo.ano_letivo + "/" + periodo.periodo_letivo;
        opcao.textContent = periodo.ano_letivo + "." + periodo.periodo_letivo;
        seletor.appendChild(opcao);
        if (indice === 0) opcao.selected = true;
      });
      seletor.disabled = !periodos.length;
      if (periodos.length) carregarBoletim(periodos[0].ano_letivo, periodos[0].periodo_letivo);
      else atualizarStatusNotas("Nenhum período letivo disponível no SUAP.", "erro");
    },
    function (xhr) {
      atualizarStatusNotas("Não foi possível carregar os períodos (HTTP " + xhr.status + ").", "erro");
    }
  );
}

// ==========================================
// 5.10 LISTENERS
// ==========================================
function initCalculadoraNotas() {
  const elPeriodo = document.getElementById("periodo-notas");
  if (elPeriodo && !elPeriodo.dataset.bound) {
    elPeriodo.dataset.bound = "1";
    elPeriodo.addEventListener("change", function (event) {
      const partes = event.target.value.split("/");
      if (partes.length === 2) carregarBoletim(partes[0], partes[1]);
    });
  }

  const elMeta = document.getElementById("meta-notas");
  const elMetaValor = document.getElementById("meta-valor");
  if (elMeta && !elMeta.dataset.bound) {
    elMeta.dataset.bound = "1";
    elMeta.addEventListener("input", function (e) {
      if (elMetaValor) elMetaValor.textContent = e.target.value;
    });
    elMeta.addEventListener("change", function (e) {
      __metaAtual = Number(e.target.value) || 60;
      if (__notasCache.length) renderizarNotas(__notasCache);
    });
  }

  document.querySelectorAll(".filtro-chip").forEach(function (chip) {
    if (chip.dataset.bound) return;
    chip.dataset.bound = "1";
    chip.addEventListener("click", function () {
      document.querySelectorAll(".filtro-chip").forEach(function (c) { c.classList.remove("ativo"); });
      chip.classList.add("ativo");
      __filtroAtivo = chip.dataset.filtro || "todas";
      if (__notasCache.length) renderizarNotas(__notasCache);
    });
  });

  const elAtualizar = document.getElementById("atualizar-notas");
  if (elAtualizar && !elAtualizar.dataset.bound) {
    elAtualizar.dataset.bound = "1";
    elAtualizar.addEventListener("click", function () {
      const seletor = document.getElementById("periodo-notas");
      if (!seletor) return;
      const periodo = seletor.value.split("/");
      if (periodo.length === 2) carregarBoletim(periodo[0], periodo[1]);
    });
  }

  document.querySelectorAll(".tabela-notas thead th.sortable").forEach(function (th) {
    if (th.dataset.bound) return;
    th.dataset.bound = "1";
    th.addEventListener("click", function () { aplicarSort(th.dataset.sort); });
  });

  document.getElementById("btn-export-csv")?.addEventListener("click", exportarCSV);
  document.getElementById("btn-export-pdf")?.addEventListener("click", exportarPDF);
  document.getElementById("btn-limpar-simulador")?.addEventListener("click", function () {
    __simulacoes = {};
    if (__notasCache.length) renderizarNotas(__notasCache);
    exibirToast("Simulações limpas.", "sucesso");
  });

  document.getElementById("btn-toggle-historico")?.addEventListener("click", function () {
    document.getElementById("historico-panel")?.classList.toggle("colapsado");
  });

  carregarMetasDisciplinas();
}

// ==========================================
// 6. INICIALIZAÇÃO E AUTENTICAÇÃO
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
  filtroRecadoTexto = "";
  filtroPerfilTexto = "";

  inicializarModalEditarPerfil();
  initCalculadoraNotas();

  const btnLogin = document.getElementById("suap-login-button");
  if (btnLogin) btnLogin.setAttribute("href", suap.getLoginURL());

  const btnLogout = document.getElementById("suap-logout-button");
  if (btnLogout) {
    btnLogout.addEventListener("click", function (e) {
      e.preventDefault();
      window.forceLogout();
    });
  }

  const anoEl = document.getElementById("ano");
  if (anoEl) anoEl.textContent = new Date().getFullYear();

  if (suap.isAuthenticated()) {
    if (window.location.hash.includes("access_token")) {
      history.replaceState(null, null, window.location.pathname);
    }

    document.querySelectorAll(".is-authenticated").forEach(function (el) {
      el.classList.remove("is-hidden");
    });

    carregarPeriodosNotas();

    var calendarEl = document.getElementById("calendar");
    if (calendarEl && typeof FullCalendar !== "undefined") {
      var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        locale: "pt-br",
        initialDate: "2026-09-01",
        validRange: { start: "2026-09-01", end: "2026-12-31" },
        googleCalendarApiKey: "AIzaSyB9XFKFwtZNQJrN2Kh7UPZxraPXEwqFytw",
        events: "acb20a08d58749d48304dbda5c87bfb7f0671483ecc4ed942683ad5a1307e78d@group.calendar.google.com",
        eventClick: function (arg) {
          window.open(arg.event.url, "_blank");
          arg.jsEvent.preventDefault();
        },
      });
      calendar.render();
    }

    var scope = suap.getToken().getScope();
    suap.getResource(scope, function (dados_suap) {
      var fotoPath = dados_suap.url_foto_150x200 || dados_suap.url_foto_75x100 || dados_suap.foto || "";
      var fotoUrl = "";
      if (fotoPath) {
        if (fotoPath.startsWith("http://") || fotoPath.startsWith("https://")) fotoUrl = fotoPath;
        else {
          var fotoBaseUrl = "https://suap.ifrn.edu.br";
          fotoUrl = fotoBaseUrl + (fotoPath.startsWith("/") ? "" : "/") + fotoPath;
        }
      } else {
        fotoUrl = "https://ui-avatars.com/api/?name=" + encodeURIComponent(dados_suap.nome_usual || dados_suap.nome) + "&background=random";
      }

      const userFotoEl = document.getElementById("user-foto");
      if (userFotoEl) userFotoEl.src = fotoUrl;

      const nomeSuap = dados_suap.nome_usual || dados_suap.nome;
      const nomeCompletoSuap = dados_suap.nome || nomeSuap;
      const matriculaSuap = dados_suap.matricula || dados_suap.siape || "Matrícula não disponível";

      const userNomeEl = document.getElementById("user-nome");
      if (userNomeEl) userNomeEl.textContent = nomeParaExibicao(nomeSuap);

      const userMatEl = document.getElementById("user-matricula");
      if (userMatEl) userMatEl.textContent = matriculaSuap;

      window.usuarioLogado.nome = nomeParaExibicao(nomeSuap);
      window.usuarioLogado.matricula = matriculaSuap;
      window.usuarioLogado.foto = fotoUrl;
      window.usuarioLogado.fotoOriginal = fotoUrl;

      if (matriculaSuap && matriculaSuap !== "Matrícula não disponível") {
        const perfilAlunoRef = ref(db, "perfis_alunos/" + matriculaSuap);
        get(perfilAlunoRef).then((snap) => {
          const dadosExistentes = snap.val() || {};
          const payload = {
            nomeCompleto: nomeCompletoSuap,
            matricula: matriculaSuap,
            ultimoAcesso: Date.now(),
          };
          if (!dadosExistentes.nome || !String(dadosExistentes.nome).trim()) payload.nome = nomeParaExibicao(nomeSuap);
          if (!dadosExistentes.foto || !String(dadosExistentes.foto).trim()) payload.foto = fotoUrl;
          update(perfilAlunoRef, payload).then(() => { window.carregarPerfilUsuario(matriculaSuap); });
        });

        carregarMetasDisciplinas();
      }

      const inputRecadoNome = document.getElementById("recado-nome");
      if (inputRecadoNome) {
        inputRecadoNome.style.display = "none";
        inputRecadoNome.removeAttribute("required");
      }

      window.renderizarMural();
      window.renderizarPerfis();
    });
  } else {
    document.querySelectorAll(".is-anonymous").forEach(function (el) {
      el.classList.remove("is-hidden");
    });
  }
});
