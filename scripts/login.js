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
  console.log("[perfis_alunos] carregados:", bancoDePerfis.length, bancoDePerfis);
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
    if (!mensagemBruta) {
      exibirToast("Escreva uma mensagem antes de enviar!", "erro");
      return;
    }
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
// 4. MÉTODOS GLOBAIS
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
  if (!perfil) {
    exibirToast("Perfil não encontrado.", "erro");
    return;
  }
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
        .map(
          (l) =>
            `<a href="${l.url}" target="_blank" rel="noopener noreferrer" title="${l.titulo}" aria-label="${l.titulo}" class="modal-rede-link"><i class="${l.icone}"></i></a>`
        )
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
  if (!texto) {
    exibirToast("Escreva um comentário antes de enviar.", "erro");
    return;
  }
  const comentariosRef = ref(db, `mural_recados/${recadoId}/comentarios`);
  push(comentariosRef, {
    autor_nome: escaparHTML(window.usuarioLogado.nome),
    autor_matricula: window.usuarioLogado.matricula,
    texto: escaparHTML(texto),
    timestamp: Date.now(),
  })
    .then(() => {
      exibirToast("Comentário adicionado!", "sucesso");
      inputEl.value = "";
    })
    .catch((err) => exibirToast("Erro: " + err.message, "erro"));
};

window.excluirComentario = function (recadoId, comentarioId) {
  const itemRef = ref(db, `mural_recados/${recadoId}/comentarios/${comentarioId}`);
  get(itemRef).then((snapshot) => {
    const com = snapshot.val();
    if (com) {
      const ehAdmin = MATRICULAS_ADMIN.includes(window.usuarioLogado.matricula);
      const ehAutor = com.autor_matricula === window.usuarioLogado.matricula;
      if (!ehAutor && !ehAdmin) {
        exibirToast("Você não tem permissão para excluir este comentário!", "erro");
        return;
      }
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
      if (!ehAutor && !ehAdmin) {
        exibirToast("Você não tem permissão para editar este recado!", "erro");
        return;
      }
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
      if (!ehAutor && !ehAdmin) {
        exibirToast("Você não tem permissão para excluir este recado!", "erro");
        return;
      }
      if (confirm("Tem certeza que deseja excluir este recado?")) {
        remove(itemRef)
          .then(() => exibirToast("Recado excluído com sucesso.", "sucesso"))
          .catch((err) => exibirToast("Erro: " + err.message, "erro"));
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
        if (width > height && width > maxLado) {
          height = Math.round((height * maxLado) / width);
          width = maxLado;
        } else if (height > maxLado) {
          width = Math.round((width * maxLado) / height);
          height = maxLado;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
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
    .catch((err) => {
      console.warn("Falha ao consultar Firebase, usando local:", err);
      return local;
    });
};

window.abrirModalEditarPerfil = function () {
  if (!perfilUsuarioAtual) {
    exibirToast("Perfil ainda não carregado. Aguarde um instante.", "erro");
    return;
  }
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
  if (inputFoto) {
    inputFoto.value = "";
    delete inputFoto.dataset.novaFoto;
    delete inputFoto.dataset.restaurar;
    inputFoto.disabled = false;
  }
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
      if (file.size > 5 * 1024 * 1024) {
        exibirToast("Imagem muito grande (máx 5MB).", "erro");
        return;
      }
      try {
        const dataUrl = await comprimirImagem(file);
        document.getElementById("edit-avatar-preview").src = dataUrl;
        inputFoto.dataset.novaFoto = dataUrl;
        delete inputFoto.dataset.restaurar;
      } catch (err) {
        exibirToast("Erro ao processar imagem: " + err.message, "erro");
      }
    });
  }
  const btnRestaurar = document.getElementById("btn-restaurar-foto");
  if (btnRestaurar) {
    btnRestaurar.addEventListener("click", () => {
      const fotoOriginal = window.usuarioLogado.fotoOriginal || window.usuarioLogado.foto;
      document.getElementById("edit-avatar-preview").src = fotoOriginal;
      if (inputFoto) {
        delete inputFoto.dataset.novaFoto;
        inputFoto.dataset.restaurar = "1";
        inputFoto.value = "";
      }
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

/* =================================================================
   🆕 STATUS V2 (com ícones e variantes visuais)
   ================================================================= */
function atualizarStatusNotas(mensagem, tipo) {
  var status = document.getElementById("notas-status");
  if (!status) return;
  // Compatível com chamadas antigas (segundo argumento booleano = erro)
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

function obterEtapasDaDisciplina(disciplina) {
  var etapas = [1, 2, 3, 4];
  var possuiNotaSegundoSemestre = [3, 4].some(function (numeroEtapa) {
    var etapa = disciplina["nota_etapa_" + numeroEtapa];
    return formatarNota(etapa && typeof etapa === "object" ? etapa.nota : etapa) !== null;
  });
  if (disciplina.segundo_semestre === true || possuiNotaSegundoSemestre) {
    return {
      tipo: disciplina.segundo_semestre === true ? "Semestral" : "Anual",
      etapas: disciplina.segundo_semestre === true ? [3, 4] : etapas,
    };
  }
  return { tipo: "Semestral", etapas: [1, 2] };
}

function adicionarGrupoNotas(corpo, titulo) {
  var linhaGrupo = document.createElement("tr");
  linhaGrupo.className = "notas-grupo";
  var celulaGrupo = document.createElement("th");
  celulaGrupo.colSpan = 6; // 🆕 6 colunas (era 5)
  celulaGrupo.textContent = titulo;
  linhaGrupo.appendChild(celulaGrupo);
  corpo.appendChild(linhaGrupo);
}

/* =================================================================
   🆕 CLASSIFICADOR DE STATUS (aprovado/recuperação/reprovado)
   ================================================================= */
function classificarStatusNota(media, faltas, meta) {
  var LIMITE_FALTAS = 15; // 25% de 60h/aula — ajuste se o SUAP fornecer carga real
  if (faltas > LIMITE_FALTAS) return "reprovado";
  if (media === null) return "recuperacao";
  if (media >= meta) return "aprovado";
  if (media >= meta * 0.6) return "recuperacao";
  return "reprovado";
}

/* =================================================================
   🆕 RESUMO (cards de topo)
   ================================================================= */
function atualizarResumoNotas(disciplinas, meta) {
  var total = disciplinas.length;
  var somaMedias = 0;
  var contMedias = 0;
  var faltasTotais = 0;
  var emRisco = 0;

  disciplinas.forEach(function (d) {
    var config = obterEtapasDaDisciplina(d);
    var notas = config.etapas.map(function (n) {
      var etapa = d["nota_etapa_" + n];
      return formatarNota(etapa && typeof etapa === "object" ? etapa.nota : etapa);
    });
    var preenchidas = notas.filter(function (v) { return v !== null; });
    var soma = preenchidas.reduce(function (a, b) { return a + b; }, 0);
    var mediaApi = formatarNota(d.media_disciplina);
    var media = preenchidas.length ? soma / preenchidas.length : mediaApi;
    var faltas = Number(d.numero_faltas) || 0;

    if (media !== null) { somaMedias += media; contMedias++; }
    faltasTotais += faltas;

    var st = classificarStatusNota(media, faltas, meta);
    if (st !== "aprovado") emRisco++;
  });

  var mediaGeral = contMedias ? somaMedias / contMedias : null;

  var elMedia = document.getElementById("resumo-media");
  var elDisc = document.getElementById("resumo-disciplinas");
  var elRisco = document.getElementById("resumo-risco");
  var elFaltas = document.getElementById("resumo-faltas");

  if (elMedia) elMedia.textContent = mediaGeral !== null ? mediaGeral.toFixed(1) : "—";
  if (elDisc) elDisc.textContent = total || "—";
  if (elRisco) elRisco.textContent = emRisco;
  if (elFaltas) elFaltas.textContent = faltasTotais;
}

/* =================================================================
   🆕 PROJEÇÃO (quanto falta para bater a meta)
   ================================================================= */
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

/* =================================================================
   🆕 ESTADO E FILTROS DA TABELA
   ================================================================= */
var __notasCache = [];
var __metaAtual = 60;
var __filtroAtivo = "todas";

function aplicarFiltroNotas(disciplinas, meta) {
  return disciplinas.filter(function (d) {
    if (__filtroAtivo === "todas") return true;
    var config = obterEtapasDaDisciplina(d);
    var notas = config.etapas.map(function (n) {
      var etapa = d["nota_etapa_" + n];
      return formatarNota(etapa && typeof etapa === "object" ? etapa.nota : etapa);
    });
    var preenchidas = notas.filter(function (v) { return v !== null; });
    var soma = preenchidas.reduce(function (a, b) { return a + b; }, 0);
    var mediaApi = formatarNota(d.media_disciplina);
    var media = preenchidas.length ? soma / preenchidas.length : mediaApi;
    var faltas = Number(d.numero_faltas) || 0;
    var st = classificarStatusNota(media, faltas, meta);
    if (__filtroAtivo === "risco") return st !== "aprovado";
    return st === __filtroAtivo;
  });
}

/* =================================================================
   🆕 RENDERIZAR NOTAS V2
   ================================================================= */
function renderizarNotas(disciplinas) {
  var corpo = document.getElementById("lista-notas");
  if (!corpo) return;

  var metaInput = document.getElementById("meta-notas");
  var meta = metaInput ? (formatarNota(metaInput.value) || 60) : 60;
  __metaAtual = meta;
  __notasCache = disciplinas || [];

  corpo.innerHTML = "";

  if (!__notasCache.length) {
    corpo.innerHTML = '<tr><td colspan="6" class="notas-vazia"><i class="fa-solid fa-inbox"></i>Nenhuma disciplina encontrada neste período.</td></tr>';
    atualizarResumoNotas([], meta);
    return;
  }

  var disciplinasVisiveis = aplicarFiltroNotas(__notasCache, meta);

  if (!disciplinasVisiveis.length) {
    corpo.innerHTML = '<tr><td colspan="6" class="notas-vazia"><i class="fa-solid fa-filter-circle-xmark"></i>Nenhuma disciplina neste filtro.</td></tr>';
    atualizarResumoNotas(__notasCache, meta);
    return;
  }

  var grupos = { Semestral: [], Anual: [] };
  disciplinasVisiveis.forEach(function (disciplina) {
    var configuracao = obterEtapasDaDisciplina(disciplina);
    grupos[configuracao.tipo].push({ disciplina: disciplina, etapas: configuracao.etapas });
  });

  ["Semestral", "Anual"].forEach(function (tipo) {
    if (!grupos[tipo].length) return;
    adicionarGrupoNotas(corpo, tipo === "Semestral" ? "Matérias Semestrais" : "Matérias Anuais");

    grupos[tipo].forEach(function (item) {
      var disciplina = item.disciplina;
      var notasEtapas = item.etapas.map(function (numeroEtapa) {
        var etapa = disciplina["nota_etapa_" + numeroEtapa];
        return formatarNota(etapa && typeof etapa === "object" ? etapa.nota : etapa);
      });
      var notasPreenchidas = notasEtapas.filter(function (nota) { return nota !== null; });
      var soma = notasPreenchidas.reduce(function (total, nota) { return total + nota; }, 0);
      var mediaApi = formatarNota(disciplina.media_disciplina);
      var media = notasPreenchidas.length ? soma / notasPreenchidas.length : mediaApi;
      var totalEtapas = item.etapas.length;
      var faltas = Number(disciplina.numero_faltas) || 0;

      var status = classificarStatusNota(media, faltas, meta);
      var proj = calcularProjecaoDisciplina(notasPreenchidas.length, totalEtapas, soma, meta);

      // Faltas com alerta visual
      var faltasClasse = faltas > 15 ? "critico" : (faltas > 10 ? "alerta" : "");

      // Badge
      var badgeLabel = {
        aprovado: '<i class="fa-solid fa-check"></i> Aprovado',
        recuperacao: '<i class="fa-solid fa-rotate"></i> Recuperação',
        reprovado: '<i class="fa-solid fa-xmark"></i> Reprovado',
      }[status];

      // Linha em risco
      var linhaRisco = (status === "reprovado" || faltasClasse === "critico") ? "linha-risco" : "";

      // Etapas em pills
      var etapasHTML = notasEtapas.map(function (n) {
        return '<span class="etapa-pill">' + textoNota(n) + '</span>';
      }).join("");

      // Média com barra
      var percentual = media !== null ? Math.min(media, 100) : 0;
      var mediaHTML =
        '<div class="media-cell">' +
          '<span>' + textoNota(media) + '</span>' +
          '<div class="media-bar">' +
            '<div class="media-bar-fill ' + status + '" style="width:' + percentual + '%"></div>' +
          '</div>' +
        '</div>';

      var linha = document.createElement("tr");
      if (linhaRisco) linha.className = linhaRisco;

      linha.innerHTML =
        '<td><strong>' + escaparHTML(disciplina.disciplina || disciplina.codigo_diario || "Disciplina sem nome") + '</strong></td>' +
        '<td><div class="etapas-cell">' + (etapasHTML || '<span class="etapa-pill">—</span>') + '</div></td>' +
        '<td>' + mediaHTML + '</td>' +
        '<td><span class="faltas-cell ' + faltasClasse + '">' + faltas + '</span></td>' +
        '<td><span class="projecao-cell ' + proj.classe + '">' + proj.texto + '</span></td>' +
        '<td><span class="badge badge-' + status + '">' + badgeLabel + '</span></td>';

      corpo.appendChild(linha);
    });
  });

  atualizarResumoNotas(__notasCache, meta);
}

function carregarBoletim(ano, periodo) {
  atualizarStatusNotas("Buscando notas no SUAP...", "loading");
  suap.getAuthenticatedResource(
    "/api/ensino/meu-boletim/" + encodeURIComponent(ano) + "/" + encodeURIComponent(periodo) + "/?page=1",
    function (resposta) {
      renderizarNotas(resposta.results || []);
      var total = resposta.count || (resposta.results || []).length;
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
// 5.1 LISTENERS DA CALCULADORA V2
// ==========================================

// Período
const elPeriodo = document.getElementById("periodo-notas");
if (elPeriodo) {
  elPeriodo.addEventListener("change", function (event) {
    var partes = event.target.value.split("/");
    if (partes.length === 2) carregarBoletim(partes[0], partes[1]);
  });
}

// Meta (slider V2)
const elMeta = document.getElementById("meta-notas");
const elMetaValor = document.getElementById("meta-valor");
if (elMeta) {
  elMeta.addEventListener("input", function (e) {
    if (elMetaValor) elMetaValor.textContent = e.target.value;
  });
  elMeta.addEventListener("change", function (e) {
    __metaAtual = Number(e.target.value) || 60;
    if (__notasCache.length) renderizarNotas(__notasCache);
  });
}

// Filtros
document.querySelectorAll(".filtro-chip").forEach(function (chip) {
  chip.addEventListener("click", function () {
    document.querySelectorAll(".filtro-chip").forEach(function (c) { c.classList.remove("ativo"); });
    chip.classList.add("ativo");
    __filtroAtivo = chip.dataset.filtro || "todas";
    if (__notasCache.length) renderizarNotas(__notasCache);
  });
});

// Botão atualizar
const elAtualizar = document.getElementById("atualizar-notas");
if (elAtualizar) {
  elAtualizar.addEventListener("click", function () {
    var seletor = document.getElementById("periodo-notas");
    if (!seletor) return;
    var periodo = seletor.value.split("/");
    if (periodo.length === 2) carregarBoletim(periodo[0], periodo[1]);
  });
}

// ==========================================
// 6. INICIALIZAÇÃO E AUTENTICAÇÃO
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
  filtroRecadoTexto = "";
  filtroPerfilTexto = "";

  inicializarModalEditarPerfil();

  const btnLogin = document.getElementById("suap-login-button");
  if (btnLogin) btnLogin.setAttribute("href", suap.getLoginURL());

  const btnLogout = document.getElementById("suap-logout-button");
  if (btnLogout) {
    btnLogout.addEventListener("click", function (e) {
      e.preventDefault();
      window.forceLogout();
    });
  }

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
