// ==========================================
// CONFIGURAÇÕES DO SUAP
// ==========================================
var CLIENT_ID = "St1KggSNx1eA8FnNe5Bi8jfM7MODYSFZGUaj8cpf";
var REDIRECT_URI = "https://infoweb-2v-devlopers.vercel.app/login.html";
var SUAP_URL = "https://suap.ifrn.edu.br";
var SCOPE = "identificacao email documentos_pessoais";

// ==========================================
// 🌐 CHAMADAS À API (helper)
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

// Expõe no window (login.js é módulo ES)
window.chamarAPI = chamarAPI;
window.obterTokenSuap = obterTokenSuap;

// ==========================================
// 🎨 HELPERS DE COR
// ==========================================
function corParaHex(cor, fallback) {
  fallback = fallback || "#8b5edd";
  if (!cor) return fallback;
  cor = String(cor).trim();
  if (/^#[0-9a-f]{6}$/i.test(cor)) return cor;
  if (/^#[0-9a-f]{3}$/i.test(cor)) {
    return "#" + cor[1] + cor[1] + cor[2] + cor[2] + cor[3] + cor[3];
  }
  if (/^#[0-9a-f]{8}$/i.test(cor)) return cor.slice(0, 7);
  var mRgb = cor.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (mRgb) {
    var r = parseInt(mRgb[1], 10), g = parseInt(mRgb[2], 10), b = parseInt(mRgb[3], 10);
    return "#" + [r, g, b].map(function (n) { return n.toString(16).padStart(2, "0"); }).join("");
  }
  var mHsl = cor.match(/^hsla?\(\s*([\d.]+)[\s,]+([\d.]+)%[\s,]+([\d.]+)%/i);
  if (mHsl) {
    var h = parseFloat(mHsl[1]) / 360;
    var s = parseFloat(mHsl[2]) / 100;
    var l = parseFloat(mHsl[3]) / 100;
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    var rr = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
    var gg = Math.round(hue2rgb(p, q, h) * 255);
    var bb = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
    return "#" + [rr, gg, bb].map(function (n) { return n.toString(16).padStart(2, "0"); }).join("");
  }
  return fallback;
}
function corParaCanvas(cor, fallback) { return corParaHex(cor, fallback); }
function addStopSeguro(gradient, posicao, cor, fallback) {
  try { gradient.addColorStop(posicao, corParaCanvas(cor, fallback)); }
  catch (err) {
    console.warn("[gradient] cor inválida:", cor, "→ usando fallback");
    gradient.addColorStop(posicao, fallback || "#8b5edd");
  }
}

// ==========================================
// 🎭 SKINS DO MASCOTE
// ==========================================
const MATRICULA_ADMIN = "20261101110002";
// 👑 Badge exclusiva do admin
function montarBadgeAdmin(matricula) {
  if (String(matricula) !== MATRICULA_ADMIN) return "";
  return `<span class="admin-badge" title="Administrador do site"><i class="fa-solid fa-crown"></i></span>`;
}

// ==========================================
// 🎭 SKINS DO MASCOTE
// tipo: "cliques" → desbloqueia por cliques acumulados
// tipo: "conquista" → desbloqueia ao ganhar uma conquista específica
// ==========================================
const AVATARES_MASCOTE = [
  // Gratuitas
  { id: "padrao",  nome: "Padrão",  arquivo: "img/MascotePadrao.png",  gratis: true, admin: false },
  { id: "alien",   nome: "Alien",   arquivo: "img/MascoteAlien.png",   gratis: true, admin: false },
  { id: "pirata",  nome: "Pirata",  arquivo: "img/MascotePirata.png",  gratis: true, admin: false },
  { id: "genio",   nome: "Gênio",   arquivo: "img/MascoteGenio.png",   gratis: true, admin: false },

  // Desbloqueio por cliques
  { id: "if",       nome: "IF",       arquivo: "img/MascoteIf.png",       gratis: false, tipo: "cliques", cliquesNecessarios: 500,   admin: false },
  { id: "jojo",     nome: "Jojo",     arquivo: "img/MascoteJojo.png",     gratis: false, tipo: "cliques", cliquesNecessarios: 1000,  admin: false },
  { id: "simpson",  nome: "Simpson",  arquivo: "img/MascoteSimpson.png",  gratis: false, tipo: "cliques", cliquesNecessarios: 1500,  admin: false },
  { id: "antigo",   nome: "Antigo",   arquivo: "img/MascoteAntigo.png",   gratis: false, tipo: "cliques", cliquesNecessarios: 2000,  admin: false },
  { id: "mafioso",  nome: "Mafioso",  arquivo: "img/MascoteMafioso.png",  gratis: false, tipo: "cliques", cliquesNecessarios: 2500,  admin: false },
  { id: "retro",    nome: "Retro",    arquivo: "img/MascoteRetro.png",    gratis: false, tipo: "cliques", cliquesNecessarios: 3000,  admin: false },
  { id: "turma1",   nome: "Turma 1",  arquivo: "img/MascoteTurma1.png",   gratis: false, tipo: "cliques", cliquesNecessarios: 4000,  admin: false },
  { id: "turma2",   nome: "Turma 2",  arquivo: "img/MascoteTurma2.png",   gratis: false, tipo: "cliques", cliquesNecessarios: 5000,  admin: false },
  { id: "turma3",   nome: "Turma 3",  arquivo: "img/MascoteTurma3.png",   gratis: false, tipo: "cliques", cliquesNecessarios: 10000, admin: false },

  // Desbloqueio por conquista
  { id: "100",       nome: "100",         arquivo: "img/Mascote100.png",       gratis: false, tipo: "conquista", conquistaNecessaria: "nerd",     admin: false },
  { id: "vestuario", nome: "Vestuário?",  arquivo: "img/MascoteVestuario.png", gratis: false, tipo: "conquista", conquistaNecessaria: "vestuario", admin: false },

  // Exclusiva admin
  { id: "admin",    nome: "Admin",    arquivo: "img/MascoteAdmin.png",    gratis: false, apenasAdmin: true, admin: true },
];

function obterSkinsDisponiveis() {
  const mat = window.usuarioLogado?.matricula;
  const ehAdmin = mat === MATRICULA_ADMIN;
  return AVATARES_MASCOTE.filter((s) => (s.apenasAdmin ? ehAdmin : true));
}

function obterMascotePorId(id) {
  return AVATARES_MASCOTE.find((m) => m.id === id) || AVATARES_MASCOTE[0];
}

// ==========================================
// 🏆 NÍVEIS
// ==========================================
const NIVEIS = [
  { nivel: 1, xp: 0, nome: "Novato" },
  { nivel: 2, xp: 100, nome: "Curioso" },
  { nivel: 3, xp: 300, nome: "Aprendiz" },
  { nivel: 4, xp: 600, nome: "Dev Júnior" },
  { nivel: 5, xp: 1000, nome: "Dev Pleno" },
  { nivel: 6, xp: 1500, nome: "Dev Sênior" },
  { nivel: 7, xp: 2200, nome: "Tech Lead" },
  { nivel: 8, xp: 3000, nome: "Arquiteto" },
  { nivel: 9, xp: 4000, nome: "CTO" },
  { nivel: 10, xp: 5000, nome: "Lenda" },
];

// ==========================================
// 🎖️ CONQUISTAS
// ==========================================
const CONQUISTAS = [
  { id: "primeiro_carinho", icone: "fa-solid fa-hand-pointer", emoji: "🎯", nome: "Primeiro Carinho", desc: "Deu seu primeiro carinho no mascote", raridade: "comum", tipo: "cliques", meta: 1 },
  { id: "cliques_100",     icone: "fa-solid fa-hand",           emoji: "👋", nome: "100 Carinhos",     desc: "Deu 100 carinhos no mascote",   raridade: "comum",  tipo: "cliques", meta: 100 },
  { id: "cliques_250",     icone: "fa-solid fa-hands-clapping", emoji: "👏", nome: "250 Carinhos",     desc: "Deu 250 carinhos no mascote",   raridade: "comum",  tipo: "cliques", meta: 250 },
  { id: "carinhoso",       icone: "fa-solid fa-heart",          emoji: "❤️", nome: "Carinhoso",        desc: "Deu 500 carinhos no mascote",   raridade: "raro",   tipo: "cliques", meta: 500 },
  { id: "cliques_1000",    icone: "fa-solid fa-heart-circle-plus", emoji: "💗", nome: "1000 Carinhos", desc: "Deu 1000 carinhos no mascote", raridade: "raro",   tipo: "cliques", meta: 1000 },
  { id: "simpson_unlocked", icone: "fa-solid fa-cookie-bite",  emoji: "🍩", nome: "Simpson Chegou",   desc: "Desbloqueou a skin do Simpson (1.500 cliques)", raridade: "epico", tipo: "cliques", meta: 1500 },
  { id: "cliques_2500",    icone: "fa-solid fa-fire-flame-curved", emoji: "🔥", nome: "2500 Carinhos", desc: "Deu 2500 carinhos no mascote", raridade: "epico", tipo: "cliques", meta: 2500 },
  { id: "mafioso_unlocked", icone: "fa-solid fa-user-tie",     emoji: "🕴️", nome: "Mafioso no Pedaço", desc: "Desbloqueou a skin Mafioso (3.000 cliques)", raridade: "lendario", tipo: "cliques", meta: 3000 },
  { id: "cliques_5000",    icone: "fa-solid fa-crown",         emoji: "👑", nome: "5000 Carinhos",    desc: "Deu 5000 carinhos no mascote", raridade: "lendario", tipo: "cliques", meta: 5000 },
  { id: "cliques_10000",   icone: "fa-solid fa-gem",           emoji: "💎", nome: "10000 Carinhos",   desc: "Deu 10000 carinhos no mascote", raridade: "lendario", tipo: "cliques", meta: 10000 },
  { id: "nivel_5",         icone: "fa-solid fa-star-half-stroke", emoji: "⭐", nome: "Dev Pleno",     desc: "Alcançou o nível 5",  raridade: "raro",     tipo: "nivel", meta: 5 },
  { id: "nivel_10",        icone: "fa-solid fa-star",          emoji: "🌟", nome: "Lenda Viva",       desc: "Alcançou o nível 10", raridade: "lendario", tipo: "nivel", meta: 10 },
  { id: "streak_7",        icone: "fa-solid fa-fire",          emoji: "🔥", nome: "Streak 7",         desc: "Logou 7 dias seguidos", raridade: "raro",     tipo: "streak", meta: 7 },
  { id: "streak_30",       icone: "fa-solid fa-star",          emoji: "⭐", nome: "Streak 30",        desc: "Logou 30 dias seguidos", raridade: "lendario", tipo: "streak", meta: 30 },
  { id: "nota_100",        icone: "fa-solid fa-graduation-cap", emoji: "🎓", nome: "Nota 100",       desc: "Tirou 100 em alguma matéria", raridade: "raro",  tipo: "manual", meta: 1 },
  { id: "nota_maxima",     icone: "fa-solid fa-trophy",        emoji: "🏆", nome: "Nota Máxima",      desc: "Média geral ≥ 90", raridade: "epico", tipo: "manual", meta: 1 },
  { id: "estiloso",        icone: "fa-solid fa-palette",       emoji: "🎨", nome: "Estiloso",         desc: "Mudou o avatar do mascote", raridade: "comum", tipo: "manual", meta: 1 },
  { id: "comunicador",     icone: "fa-solid fa-comments",      emoji: "💬", nome: "Comunicador",      desc: "Postou 10 recados no mural", raridade: "comum", tipo: "recados", meta: 10 },
  { id: "social",          icone: "fa-solid fa-share-nodes",   emoji: "🔗", nome: "Sociável",         desc: "Curtiu 20 recados", raridade: "comum", tipo: "curtidas", meta: 20 },
  { id: "cientista",       icone: "fa-solid fa-flask",         emoji: "🧪", nome: "Cientista",        desc: "Usou o simulador 10 vezes", raridade: "comum", tipo: "simulador", meta: 10 },
  { id: "metódico",        icone: "fa-solid fa-bullseye",      emoji: "🎯", nome: "Metódico",         desc: "Definiu 5 metas individuais", raridade: "raro", tipo: "metas", meta: 5 },
    { id: "explorador",      icone: "fa-solid fa-compass",       emoji: "🧭", nome: "Explorador",       desc: "Consultou 3 períodos diferentes", raridade: "raro", tipo: "periodos", meta: 3 },

  // ===== Novas conquistas =====
  { id: "nerd",     icone: "fa-solid fa-graduation-cap", emoji: "🎓", nome: "Nerd",        desc: "Tirou nota 100 em alguma matéria",                                       raridade: "epico",    tipo: "manual", meta: 1 },
  { id: "vestuario", icone: "fa-solid fa-shirt",         emoji: "👕", nome: "Vestuário?",  desc: "Desbloqueou as skins IF, Turma 1, Turma 2 e Turma 3 (10.000 cliques)", raridade: "lendario", tipo: "cliques", meta: 10000 },
];

const XP_RECOMPENSAS = {
  recado_postado: 10,
  comentario: 3,
  curtida: 1,
  trocar_avatar: 5,
  simulador: 2,
  ver_boletim: 5,
  definir_meta: 5,
  conquista: 10,
  login_diario: 5,
  clique_mascote: 1,
};

let meuXP = 0;
let minhaStreak = 0;
let meusCliquesMascote = 0;
let minhasConquistas = {};
let contadorSimulador = 0;
let meuCargo = null;          // 🆕 cargo ativo do aluno (id + info)
let meuCargoDesde = null;     // 🆕 quando ganhou
let meusCargosTodos = [];     // 🆕 lista de todos os cargos do aluno

let avatarSelecionado = "padrao";
let filtroConquistasAtivo = "todas";
let conquistasVisiveisSelecionadas = null;

// ==========================================
// 📋 TRADUÇÕES
// ==========================================
const TRADUCOES_LOGIN = {
  "pt-BR": {
    titulo_pagina_login: "Login SUAP | Turma 2V IFRN",
    voltar: "Voltar", portal_suap: "Portal SUAP",
    area_auth: "Área de autenticação acadêmica",
    acesse_credenciais: "Acesse com suas credenciais institucionais do IFRN para integrar e visualizar seus dados acadêmicos.",
    login_suap: "Login com SUAP", login_ok: "Você foi logado com sucesso!",
    sessao_ativa: "Sessão ativa e conectada ao SUAP.", bem_vindo: "Bem-vindo,",
    editar_perfil: "Editar Perfil", editar_perfil_sub: "Personalize como você aparece para a turma.",
    encerrar_sessao: "Encerrar Sessão", idioma: "Idioma", tema: "Tema",
    cor_tema: "Cor do tema", modo: "Modo", cor_roxo: "Roxo", cor_azul: "Azul",
    cor_verde: "Verde", cor_rosa: "Rosa", cor_laranja: "Laranja",
    modo_claro: "Claro", modo_escuro: "Escuro", instalar_app: "Instalar app",
    notificacoes: "Notificações", marcar_todas: "Marcar todas", sem_notif: "Sem notificações.",
    dias: "dias", conquistas_titulo: "Conquistas", todas: "Todas",
    desbloqueadas: "Desbloqueadas", bloqueadas: "Bloqueadas",
    proxima_skin: "Próxima skin:", skin_bloqueada: "Bloqueada", skin_admin: "Admin",
    conquistas_visiveis_titulo: "Conquistas no perfil",
    conquistas_visiveis_desc: "Escolha quais conquistas os outros verão no seu perfil. Sem seleção = mostra todas.",
    menu: "Menu", nav_notas: "Notas", nav_notas_desc: "Sua calculadora",
    nav_horarios: "Horários", nav_horarios_desc: "Rotina semanal",
    nav_mural: "Mural", nav_mural_desc: "Recados da turma",
    nav_membros: "Membros", nav_membros_desc: "Colegas do sistema",
    nav_agenda: "Agenda", nav_agenda_desc: "Eventos do calendário",
    nav_mascote: "Mascote", nav_mascote_desc: "Interaja com ele",
    nav_sala: "Sala dos Professores", nav_sala_desc: "Acesso restrito",
    nav_inicio: "Início", nav_inicio_desc: "Página inicial",
    nav_inicio_desc_login: "Página inicial",
    calc_titulo_1: "Calculadora de", calc_titulo_2: "Notas",
    calc_sub: "Boletim atualizado diretamente pelo SUAP",
    media_geral: "Média Geral", disciplinas: "Disciplinas", em_risco: "Em Risco",
    faltas_totais: "Faltas Totais", periodo: "Período", meta: "Meta", atualizar: "Atualizar",
    export_csv: "Exportar CSV", export_pdf: "Exportar PDF", limpar_simulador: "Limpar simulador",
    filtro_todas: "Todas", filtro_aprovadas: "Aprovadas", filtro_recuperacao: "Recuperação",
    filtro_reprovadas: "Reprovadas", filtro_risco: "Em risco", aguardando_suap: "Aguardando dados do SUAP...",
    th_disciplina: "Disciplina", th_etapas: "Etapas", th_media: "Média", th_faltas: "Faltas",
    th_projecao: "Projeção", th_status: "Status",
    th_simulador: "Simulador: digite uma nota hipotética na próxima etapa",
    th_meta_ind: "Meta individual", notas_vazio: "Faça login para carregar suas notas.",
    leg_aprovado: "Aprovado", leg_recuperacao: "Recuperação", leg_reprovado: "Reprovado",
    leg_extra: "🧪 Simulador • 🎯 Meta individual",
    evolucao_titulo: "Evolução das Médias", evolucao_sub: "Sua média por período letivo",
    historico_titulo: "Histórico de Períodos", historico_vazio: "Carregue pelo menos 2 períodos para comparar.",
    contagem_titulo_1: "Faltam", contagem_titulo_2: "pouco!",
    contagem_sub: "Próximos eventos importantes",
    contagem_vazio: "Nenhum evento próximo nos próximos 30 dias.",
    contagem_dias: "dias", contagem_horas: "horas", contagem_min: "min", contagem_seg: "seg",
    horarios_titulo_1: "Quadro de", horarios_titulo_2: "Horários", horarios_sub: "Nossa rotina semanal",
    th_horario: "Horário", dia_seg: "Segunda", dia_ter: "Terça", dia_qua: "Quarta",
    dia_qui: "Quinta", dia_sex: "Sexta", intervalo_1: "I Intervalo", intervalo_2: "II Intervalo",
    horario_sujeito: "Horário sujeito a alterações. Consulte o", horario_versao: "para a versão oficial.",
    mural_titulo_1: "Mural de", mural_titulo_2: "Recados", mural_sub: "Deixe um recado para a turma",
    busca_recados: "🔍 Buscar recados...", recado_msg: "Sua mensagem...",
    recado_link: "Link/Anexo opcional (https://...)", expirar_em: "Expirar em:",
    dia_1: "1 Dia", dias_7: "7 Dias", dias_15: "15 Dias", publicar: "Publicar",
    membros_titulo_1: "Membros do", membros_titulo_2: "Sistema",
    membros_sub: "Membros integrados ao sistema", busca_perfis: "🔍 Filtrar por nome ou matrícula...",
    agenda_titulo_1: "Agenda da", agenda_titulo_2: "Turma",
    agenda_sub: "Eventos de Setembro a Dezembro de 2026",
    matricula: "Matrícula:", ultimo_acesso: "Último Acesso:", nao_registrado: "Não registrado",
    trocar_foto: "Trocar foto", restaurar_suap: "Voltar para a foto do SUAP",
    foto_hint: "JPG/PNG até 5MB — será otimizada.",
    nome_exibicao: "Nome de exibição", nome_placeholder: "Como quer ser chamado",
    bio: "Bio", bio_placeholder: "Fale um pouco sobre você...",
    redes_sociais: "Redes sociais", cancelar: "Cancelar", salvar: "Salvar",
    meta_individual: "Meta individual", usar_meta_global: "Usar meta global",
    mascote_avatar_titulo: "Seu mascote",
    mascote_avatar_desc: "Personalize o mascote que aparece quando você dá carinho.",
    sala_titulo: "Sala dos Professores", sala_sub: "Visão geral da turma (acesso restrito)",
    sala_tab_alunos: "Alunos", sala_tab_risco: "Em Risco", sala_tab_engajamento: "Engajamento",
    sala_busca: "🔍 Buscar aluno por nome ou matrícula...",
    sala_th_aluno: "Aluno", sala_th_matricula: "Matrícula", sala_th_media: "Média",
    sala_th_faltas: "Faltas", sala_th_carinhos: "Carinhos", sala_th_conquistas: "Conquistas",
    sala_th_status: "Status", sala_carregando: "Carregando dados...",
    sala_risco_carregando: "Carregando...", sala_stat_carinhos: "Carinhos totais",
    sala_stat_recados: "Recados publicados", sala_stat_alunos: "Alunos ativos",
    sala_stat_top: "Top contribuinte",
    cal_provas: "Provas e avaliações", cal_trabalhos: "Trabalhos e listas",
    cal_feriados: "Feriados e recessos", cal_reunioes: "Reuniões e aulas",
    cal_esportes: "Esportes e jogos", cal_festas: "Festas e eventos",
    cal_outros: "Outros eventos", footer_feito: "- Feito pela turma", footer_carinho: "Com Carinho 💜",
  },
  en: {
    titulo_pagina_login: "SUAP Login | Class 2V IFRN",
    voltar: "Back", portal_suap: "SUAP Portal", area_auth: "Academic authentication area",
    acesse_credenciais: "Log in with your IFRN institutional credentials to integrate and view your academic data.",
    login_suap: "Login with SUAP", login_ok: "You logged in successfully!",
    sessao_ativa: "Active session connected to SUAP.", bem_vindo: "Welcome,",
    editar_perfil: "Edit Profile", editar_perfil_sub: "Customize how you appear to the class.",
    encerrar_sessao: "Log Out", idioma: "Language", tema: "Theme",
    cor_tema: "Theme color", modo: "Mode", cor_roxo: "Purple", cor_azul: "Blue",
    cor_verde: "Green", cor_rosa: "Pink", cor_laranja: "Orange",
    modo_claro: "Light", modo_escuro: "Dark", instalar_app: "Install app",
    notificacoes: "Notifications", marcar_todas: "Mark all", sem_notif: "No notifications.",
    dias: "days", conquistas_titulo: "Achievements", todas: "All",
    desbloqueadas: "Unlocked", bloqueadas: "Locked",
    proxima_skin: "Next skin:", skin_bloqueada: "Locked", skin_admin: "Admin",
    conquistas_visiveis_titulo: "Achievements on profile",
    conquistas_visiveis_desc: "Choose which achievements others will see on your profile. No selection = shows all.",
    nav_inicio: "Home", nav_inicio_desc: "Homepage", nav_inicio_desc_login: "Homepage", menu: "Menu",
    nav_notas: "Grades", nav_notas_desc: "Your calculator",
    nav_horarios: "Schedule", nav_horarios_desc: "Weekly routine",
    nav_mural: "Board", nav_mural_desc: "Class messages",
    nav_membros: "Members", nav_membros_desc: "Classmates",
    nav_agenda: "Agenda", nav_agenda_desc: "Calendar events",
    nav_mascote: "Mascot", nav_mascote_desc: "Interact with it",
    nav_sala: "Teachers' Room", nav_sala_desc: "Restricted access",
    calc_titulo_1: "Grade", calc_titulo_2: "Calculator",
    calc_sub: "Report card updated directly from SUAP",
    media_geral: "Overall Average", disciplinas: "Subjects", em_risco: "At Risk",
    faltas_totais: "Total Absences", periodo: "Term", meta: "Target", atualizar: "Refresh",
    export_csv: "Export CSV", export_pdf: "Export PDF", limpar_simulador: "Clear simulator",
    filtro_todas: "All", filtro_aprovadas: "Passed", filtro_recuperacao: "Recovery",
    filtro_reprovadas: "Failed", filtro_risco: "At risk", aguardando_suap: "Waiting for SUAP data...",
    th_disciplina: "Subject", th_etapas: "Grades", th_media: "Average", th_faltas: "Absences",
    th_projecao: "Projection", th_status: "Status",
    th_simulador: "Simulator: enter a hypothetical grade for the next term",
    th_meta_ind: "Individual target", notas_vazio: "Log in to load your grades.",
    leg_aprovado: "Passed", leg_recuperacao: "Recovery", leg_reprovado: "Failed",
    leg_extra: "🧪 Simulator • 🎯 Individual target",
    evolucao_titulo: "Average Evolution", evolucao_sub: "Your average per academic term",
    historico_titulo: "Term History", historico_vazio: "Load at least 2 terms to compare.",
    contagem_titulo_1: "Almost", contagem_titulo_2: "there!",
    contagem_sub: "Upcoming important events",
    contagem_vazio: "No upcoming events in the next 30 days.",
    contagem_dias: "days", contagem_horas: "hours", contagem_min: "min", contagem_seg: "sec",
    horarios_titulo_1: "Weekly", horarios_titulo_2: "Schedule", horarios_sub: "Our weekly routine",
    th_horario: "Time", dia_seg: "Monday", dia_ter: "Tuesday", dia_qua: "Wednesday",
    dia_qui: "Thursday", dia_sex: "Friday", intervalo_1: "Break I", intervalo_2: "Break II",
    horario_sujeito: "Schedule subject to change. Check", horario_versao: "for the official version.",
    mural_titulo_1: "Message", mural_titulo_2: "Board", mural_sub: "Leave a message for the class",
    busca_recados: "🔍 Search messages...", recado_msg: "Your message...",
    recado_link: "Optional link/attachment (https://...)", expirar_em: "Expires in:",
    dia_1: "1 Day", dias_7: "7 Days", dias_15: "15 Days", publicar: "Post",
    membros_titulo_1: "System", membros_titulo_2: "Members",
    membros_sub: "Members integrated into the system", busca_perfis: "🔍 Filter by name or ID...",
    agenda_titulo_1: "Class", agenda_titulo_2: "Agenda",
    agenda_sub: "Events from September to December 2026",
    matricula: "ID:", ultimo_acesso: "Last Access:", nao_registrado: "Not registered",
    trocar_foto: "Change photo", restaurar_suap: "Restore SUAP photo",
    foto_hint: "JPG/PNG up to 5MB — will be optimized.",
    nome_exibicao: "Display name", nome_placeholder: "How you want to be called",
    bio: "Bio", bio_placeholder: "Tell a bit about yourself...",
    redes_sociais: "Social media", cancelar: "Cancel", salvar: "Save",
    meta_individual: "Individual target", usar_meta_global: "Use global target",
    mascote_avatar_titulo: "Your mascot",
    mascote_avatar_desc: "Customize the mascot that appears when you send a hug.",
    sala_titulo: "Teachers' Room", sala_sub: "Class overview (restricted access)",
    sala_tab_alunos: "Students", sala_tab_risco: "At Risk", sala_tab_engajamento: "Engagement",
    sala_busca: "🔍 Search student by name or ID...",
    sala_th_aluno: "Student", sala_th_matricula: "ID", sala_th_media: "Average",
    sala_th_faltas: "Absences", sala_th_carinhos: "Hugs", sala_th_conquistas: "Achievements",
    sala_th_status: "Status", sala_carregando: "Loading data...",
    sala_risco_carregando: "Loading...", sala_stat_carinhos: "Total hugs",
    sala_stat_recados: "Posts published", sala_stat_alunos: "Active students",
    sala_stat_top: "Top contributor",
    cal_provas: "Exams and quizzes", cal_trabalhos: "Assignments and lists",
    cal_feriados: "Holidays and breaks", cal_reunioes: "Meetings and classes",
    cal_esportes: "Sports and games", cal_festas: "Parties and events",
    cal_outros: "Other events", footer_feito: "- Made by class", footer_carinho: "With love 💜",
  },
  es: {
    titulo_pagina_login: "Login SUAP | Clase 2V IFRN",
    voltar: "Volver", portal_suap: "Portal SUAP", area_auth: "Área de autenticación académica",
    acesse_credenciais: "Inicia sesión con tus credenciales institucionales del IFRN para integrar y ver tus datos académicos.",
    login_suap: "Entrar con SUAP", login_ok: "¡Iniciaste sesión correctamente!",
    sessao_ativa: "Sesión activa y conectada al SUAP.", bem_vindo: "Bienvenido,",
    editar_perfil: "Editar Perfil", editar_perfil_sub: "Personaliza cómo apareces ante la clase.",
    encerrar_sessao: "Cerrar Sesión", idioma: "Idioma", tema: "Tema",
    cor_tema: "Color del tema", modo: "Modo", cor_roxo: "Morado", cor_azul: "Azul",
    cor_verde: "Verde", cor_rosa: "Rosa", cor_laranja: "Naranja",
    modo_claro: "Claro", modo_escuro: "Oscuro", instalar_app: "Instalar app",
    notificacoes: "Notificaciones", marcar_todas: "Marcar todas", sem_notif: "Sin notificaciones.",
    dias: "días", conquistas_titulo: "Logros", todas: "Todos",
    desbloqueadas: "Desbloqueados", bloqueadas: "Bloqueados",
    proxima_skin: "Próxima skin:", skin_bloqueada: "Bloqueada", skin_admin: "Admin",
    conquistas_visiveis_titulo: "Logros en el perfil",
    conquistas_visiveis_desc: "Elige qué logros verán los demás en tu perfil. Sin selección = muestra todos.",
    nav_inicio: "Inicio", nav_inicio_desc: "Página de inicio", nav_inicio_desc_login: "Página de inicio", menu: "Menú",
    nav_notas: "Notas", nav_notas_desc: "Tu calculadora",
    nav_horarios: "Horarios", nav_horarios_desc: "Rutina semanal",
    nav_mural: "Mural", nav_mural_desc: "Mensajes de la clase",
    nav_membros: "Miembros", nav_membros_desc: "Compañeros del sistema",
    nav_agenda: "Agenda", nav_agenda_desc: "Eventos del calendario",
    nav_mascote: "Mascota", nav_mascote_desc: "Interactúa con ella",
    nav_sala: "Sala de Profesores", nav_sala_desc: "Acceso restringido",
    calc_titulo_1: "Calculadora de", calc_titulo_2: "Notas",
    calc_sub: "Boletín actualizado directamente desde SUAP",
    media_geral: "Promedio General", disciplinas: "Asignaturas", em_risco: "En Riesgo",
    faltas_totais: "Faltas Totales", periodo: "Período", meta: "Meta", atualizar: "Actualizar",
    export_csv: "Exportar CSV", export_pdf: "Exportar PDF", limpar_simulador: "Limpiar simulador",
    filtro_todas: "Todas", filtro_aprovadas: "Aprobadas", filtro_recuperacao: "Recuperación",
    filtro_reprovadas: "Reprobadas", filtro_risco: "En riesgo", aguardando_suap: "Esperando datos del SUAP...",
    th_disciplina: "Asignatura", th_etapas: "Notas", th_media: "Promedio", th_faltas: "Faltas",
    th_projecao: "Proyección", th_status: "Estado",
    th_simulador: "Simulador: ingresa una nota hipotética para la próxima etapa",
    th_meta_ind: "Meta individual", notas_vazio: "Inicia sesión para cargar tus notas.",
    leg_aprovado: "Aprobado", leg_recuperacao: "Recuperación", leg_reprovado: "Reprobado",
    leg_extra: "🧪 Simulador • 🎯 Meta individual",
    evolucao_titulo: "Evolución de Promedios", evolucao_sub: "Tu promedio por período lectivo",
    historico_titulo: "Historial de Períodos", historico_vazio: "Carga al menos 2 períodos para comparar.",
    contagem_titulo_1: "Falta", contagem_titulo_2: "poco!",
    contagem_sub: "Próximos eventos importantes",
    contagem_vazio: "Ningún evento próximo en los próximos 30 días.",
    contagem_dias: "días", contagem_horas: "horas", contagem_min: "min", contagem_seg: "seg",
    horarios_titulo_1: "Horario", horarios_titulo_2: "Semanal", horarios_sub: "Nuestra rutina semanal",
    th_horario: "Hora", dia_seg: "Lunes", dia_ter: "Martes", dia_qua: "Miércoles",
    dia_qui: "Jueves", dia_sex: "Viernes", intervalo_1: "Recreo I", intervalo_2: "Recreo II",
    horario_sujeito: "Horario sujeto a cambios. Consulta el", horario_versao: "para la versión oficial.",
    mural_titulo_1: "Mural de", mural_titulo_2: "Mensajes", mural_sub: "Deja un mensaje para la clase",
    busca_recados: "🔍 Buscar mensajes...", recado_msg: "Tu mensaje...",
    recado_link: "Enlace/adjunto opcional (https://...)", expirar_em: "Expira en:",
    dia_1: "1 Día", dias_7: "7 Días", dias_15: "15 Días", publicar: "Publicar",
    membros_titulo_1: "Miembros del", membros_titulo_2: "Sistema",
    membros_sub: "Miembros integrados al sistema", busca_perfis: "🔍 Filtrar por nombre o matrícula...",
    agenda_titulo_1: "Agenda de la", agenda_titulo_2: "Clase",
    agenda_sub: "Eventos de Septiembre a Diciembre de 2026",
    matricula: "Matrícula:", ultimo_acesso: "Último Acceso:", nao_registrado: "No registrado",
    trocar_foto: "Cambiar foto", restaurar_suap: "Restaurar foto SUAP",
    foto_hint: "JPG/PNG hasta 5MB — será optimizada.",
    nome_exibicao: "Nombre para mostrar", nome_placeholder: "Cómo quieres ser llamado",
    bio: "Biografía", bio_placeholder: "Cuenta un poco sobre ti...",
    redes_sociais: "Redes sociales", cancelar: "Cancelar", salvar: "Guardar",
    meta_individual: "Meta individual", usar_meta_global: "Usar meta global",
    mascote_avatar_titulo: "Tu mascota",
    mascote_avatar_desc: "Personaliza la mascota que aparece cuando das cariño.",
    sala_titulo: "Sala de Profesores", sala_sub: "Vista general de la clase (acceso restringido)",
    sala_tab_alunos: "Alumnos", sala_tab_risco: "En Riesgo", sala_tab_engajamento: "Compromiso",
    sala_busca: "🔍 Buscar alumno por nombre o matrícula...",
    sala_th_aluno: "Alumno", sala_th_matricula: "Matrícula", sala_th_media: "Promedio",
    sala_th_faltas: "Faltas", sala_th_carinhos: "Cariños", sala_th_conquistas: "Logros",
    sala_th_status: "Estado", sala_carregando: "Cargando datos...",
    sala_risco_carregando: "Cargando...", sala_stat_carinhos: "Cariños totales",
    sala_stat_recados: "Mensajes publicados", sala_stat_alumnos: "Alumnos activos",
    sala_stat_top: "Top contribuyente",
    cal_provas: "Exámenes y evaluaciones", cal_trabalhos: "Trabajos y listas",
    cal_feriados: "Feriados y recesos", cal_reunioes: "Reuniones y clases",
    cal_esportes: "Deportes y juegos", cal_festas: "Fiestas y eventos",
    cal_outros: "Otros eventos", footer_feito: "- Hecho por la clase", footer_carinho: "Con cariño 💜",
  },
};

const IDIOMAS_SUPORTADOS = ["pt-BR", "en", "es"];
const IDIOMA_PADRAO = "pt-BR";

// ==========================================
// 🎉 CELEBRAÇÃO DE CONQUISTA
// ==========================================
let __audioCtxConquista = null;

function __tocarSomConquista(raridade) {
  try {
    if (!__audioCtxConquista) {
      __audioCtxConquista = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = __audioCtxConquista;

    const escalas = {
      comum:    [523.25, 659.25, 783.99],
      raro:     [587.33, 739.99, 880.00, 1174.66],
      epico:    [523.25, 659.25, 783.99, 1046.50],
      lendario: [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98],
    };
    const escala = escalas[raridade] || escalas.comum;
    const duracaoNota = raridade === "lendario" ? 0.1 : 0.12;

    escala.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = raridade === "lendario" ? "triangle" : "sine";
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * duracaoNota;
      gain.gain.setValueAtTime(0.15, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duracaoNota + 0.25);
      osc.start(start);
      osc.stop(start + duracaoNota + 0.25);
    });
  } catch (e) {}
}

function __soltarConfete(qtd) {
  const cores = ["#ff4757", "#ffa502", "#2ed573", "#1e90ff", "#a55eea", "#ffd700"];
  for (let i = 0; i < qtd; i++) {
    setTimeout(() => {
      const c = document.createElement("div");
      c.className = "conquista-confete";
      c.style.left = Math.random() * 100 + "vw";
      c.style.top = "-10px";
      c.style.backgroundColor = cores[Math.floor(Math.random() * cores.length)];
      c.style.transform = `rotate(${Math.random() * 360}deg)`;
      c.style.animationDelay = Math.random() * 0.5 + "s";
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 3500);
    }, i * 30);
  }
}

function celebrarConquista(conquista) {
  if (!conquista) return;

  const raridade = conquista.raridade || "comum";

  __tocarSomConquista(raridade);

  const qtdConfete = {
    comum: 40,
    raro: 70,
    epico: 100,
    lendario: 150,
  }[raridade] || 40;
  __soltarConfete(qtdConfete);

  if (navigator.vibrate) {
    navigator.vibrate(raridade === "lendario" ? [100, 50, 100, 50, 200] : [100]);
  }

  const overlay = document.createElement("div");
  overlay.className = `conquista-celebracao ${raridade}`;
  overlay.innerHTML = `
    <div class="conquista-celebracao-card">
      <div class="conquista-celebracao-glow"></div>
      <div class="conquista-celebracao-titulo">🎉 VOCÊ DESBLOQUEOU!</div>
      <div class="conquista-celebracao-icone">
        <i class="${conquista.icone}"></i>
      </div>
      <div class="conquista-celebracao-nome">${conquista.nome}</div>
      <div class="conquista-celebracao-desc">${conquista.desc}</div>
      <div class="conquista-celebracao-raridade">${raridade.toUpperCase()}</div>
      <button type="button" class="conquista-celebracao-btn">Continuar</button>
    </div>
  `;

  document.body.appendChild(overlay);

  const fechar = () => {
    overlay.classList.add("saindo");
    setTimeout(() => overlay.remove(), 400);
  };
  overlay.querySelector(".conquista-celebracao-btn").addEventListener("click", fechar);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) fechar();
  });

  setTimeout(() => {
    if (document.body.contains(overlay)) fechar();
  }, 6000);
}

// ==========================================
// FIREBASE (só leitura — escritas via API)
// ==========================================
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getDatabase, ref, onValue, get } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA_wDDRCRJL_WviT6FBorz8dhnHe0-pI8s",
  authDomain: "muralturmanormal.firebaseapp.com",
  projectId: "muralturmanormal",
  storageBucket: "muralturmanormal.firebasestorage.app",
  messagingSenderId: "993749229757",
  appId: "1:993749229757:web:ec87d8ca3b8950d70d57d4",
};

const app = getApps().find((a) => a.name === "loginApp")
  || initializeApp(firebaseConfig, "loginApp");
const db = getDatabase(app);
const recadosRef = ref(db, "mural_recados");
const perfisRef = ref(db, "perfis_alunos");

const MATRICULAS_ADMIN = ["20261101110002"];
let __salaDadosCarregados = false;

window.usuarioLogado = { nome: "", matricula: "", foto: "", fotoOriginal: "" };
let bancoDeRecados = [];
// 🎨 Cache de cores dos eventos do Google Calendar
// Formato: { "eventoId": "#hex", ... }
let gcalCoresCache = {};
let bancoDeCargos = {};  // 🆕 cache de cargos por matrícula
let bancoDePerfis = [];
let filtroRecadoTexto = "";
let filtroPerfilTexto = "";

function escaparHTML(texto) {
  if (!texto) return "";
  return String(texto).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
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
    toastContainer.style.cssText = `position:fixed;bottom:20px;right:20px;z-index:10000;display:flex;flex-direction:column;gap:10px;pointer-events:none;`;
    document.body.appendChild(toastContainer);
  }
  const toast = document.createElement("div");
  const corBg = tipo === "erro" ? "#ff4757" : tipo === "sucesso" ? "#2ed573" : "#2f3542";
  toast.style.cssText = `background:${corBg};color:#fff;padding:12px 20px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.3);font-size:0.9em;pointer-events:auto;opacity:0;transform:translateY(20px);transition:all 0.3s ease;font-family:sans-serif;`;
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
  else return `Expira em ${Math.floor(msRestantes / (1000 * 60))} min`;
}

// ==========================================
// ⭐ SISTEMA DE XP
// ==========================================
function calcularNivel(xp) {
  let nivelAtual = NIVEIS[0];
  for (let i = 0; i < NIVEIS.length; i++) {
    if (xp >= NIVEIS[i].xp) nivelAtual = NIVEIS[i];
    else break;
  }
  const proximo = NIVEIS.find(n => n.nivel === nivelAtual.nivel + 1) || null;
  const xpProximo = proximo ? proximo.xp : nivelAtual.xp;
  const xpAtual = nivelAtual.xp;
  const progresso = proximo ? Math.round(((xp - xpAtual) / (xpProximo - xpAtual)) * 100) : 100;
  return { nivel: nivelAtual.nivel, nome: nivelAtual.nome, xpAtual, xpProximo, progresso, proximoNome: proximo ? proximo.nome : null };
}

async function adicionarXP(quantidade, motivo) {
  const mat = window.usuarioLogado.matricula;
  if (!mat || mat === "Matrícula não disponível") return;
  if (window.xpCore?.estaPronto?.()) {
    const nivelAntes = calcularNivel(window.xpCore.obterXP());
    await window.xpCore.incrementarXP(quantidade, motivo);
    meuXP = window.xpCore.obterXP();
    renderizarPainelXP();
    const nivelDepois = calcularNivel(meuXP);
    if (nivelDepois.nivel > nivelAntes.nivel) {
      if (typeof exibirToast === "function") {
        exibirToast(`🎉 SUBIU DE NÍVEL! ${nivelDepois.nome} (Nv ${nivelDepois.nivel})`, "sucesso");
      }
      if (nivelDepois.nivel >= 5) desbloquearConquista("nivel_5");
      if (nivelDepois.nivel >= 10) desbloquearConquista("nivel_10");
    }
  }
}

async function desbloquearConquista(idConquista) {
  const mat = window.usuarioLogado.matricula;
  if (!mat || mat === "Matrícula não disponível") return;
  if (!window.xpCore?.estaPronto?.()) return;
  if (minhasConquistas[idConquista]) return;
  const sucesso = await window.xpCore.desbloquearConquista(idConquista);
  if (!sucesso) return;
  const c = CONQUISTAS.find(x => x.id === idConquista);
  if (c) celebrarConquista(c);
  await adicionarXP(XP_RECOMPENSAS.conquista, "conquista");
  minhasConquistas[idConquista] = { desbloqueadaEm: Date.now() };
  renderizarConquistas();
}

async function atualizarStreakLogin() {
  const mat = window.usuarioLogado.matricula;
  if (!mat || mat === "Matrícula não disponível") return;
  try {
    if (window.xpCore?.estaPronto?.()) {
      await window.xpCore.registrarAcessoDiario();
      setTimeout(() => checarConquistasAutomaticas(), 500);
    }
  } catch (e) {
    console.warn("[streak] Erro:", e);
  }
}

// ==========================================
// HELPERS ROBUSTOS
// ==========================================
function obterDataHoje() { return new Date().toISOString().slice(0, 10); }

function podeGanharXPSimulador() {
  try {
    const raw = localStorage.getItem("xp_simulador_hoje");
    const dados = raw ? JSON.parse(raw) : {};
    if (dados.data !== obterDataHoje()) return true;
    return (dados.count || 0) < 10;
  } catch { return true; }
}
function registrarXPSimulador() {
  const hoje = obterDataHoje();
  let dados = {};
  try {
    const raw = localStorage.getItem("xp_simulador_hoje");
    dados = raw ? JSON.parse(raw) : {};
  } catch {}
  if (dados.data !== hoje) dados = { data: hoje, count: 0 };
  dados.count = (dados.count || 0) + 1;
  localStorage.setItem("xp_simulador_hoje", JSON.stringify(dados));
}

function jaGanhouXPBoletim(periodo) {
  try {
    const raw = localStorage.getItem("xp_boletim_periodos");
    const dados = raw ? JSON.parse(raw) : {};
    return !!dados[periodo];
  } catch { return false; }
}
function marcarXPBoletim(periodo) {
  let dados = {};
  try {
    const raw = localStorage.getItem("xp_boletim_periodos");
    dados = raw ? JSON.parse(raw) : {};
  } catch {}
  dados[periodo] = Date.now();
  localStorage.setItem("xp_boletim_periodos", JSON.stringify(dados));
}

function obterXpDoAluno(xpData, matricula) {
  if (!xpData || !matricula) return null;
  const matStr = String(matricula).trim();
  if (xpData[matStr]) return xpData[matStr];
  const semZeros = matStr.replace(/^0+/, '');
  for (const k of Object.keys(xpData)) {
    const kStr = String(k).trim();
    if (kStr === matStr) return xpData[k];
    if (kStr.replace(/^0+/, '') === semZeros) return xpData[k];
  }
  return null;
}

function contarConquistasDoAluno(xpData, matricula) {
  const xp = obterXpDoAluno(xpData, matricula);
  if (!xp) return 0;
  const conquistas = xp.conquistas;
  if (!conquistas) return 0;
  if (Array.isArray(conquistas)) return conquistas.filter(Boolean).length;
  return Object.keys(conquistas).length;
}

function extrairConquistasVisiveis(cv) {
  if (!cv) return null;
  if (cv.mostraTodas === true) return null;
  if (cv.ativos && typeof cv.ativos === "object") return Object.keys(cv.ativos);
  if (cv.mostraTodas === false) return [];
  if (Array.isArray(cv)) return cv.slice();
  return null;
}

function montarConquistasVisiveisPayload(selecionadas) {
  if (selecionadas === null) return null;
  if (!Array.isArray(selecionadas) || selecionadas.length === 0) {
    return { mostraTodas: false };
  }
  const ativos = {};
  selecionadas.forEach((id) => { ativos[id] = true; });
  return { mostraTodas: false, ativos };
}

// ==========================================
// 🎖️ CHECAGEM AUTOMÁTICA DE CONQUISTAS
// ==========================================
async function checarConquistasAutomaticas() {
  const mat = window.usuarioLogado.matricula;
  if (!mat || mat === "Matrícula não disponível") return;
  if (!window.xpCore?.estaPronto?.()) return;

  meusCliquesMascote = window.xpCore.obterCliquesMascote();
  for (const c of CONQUISTAS) {
    if (c.tipo === "cliques" && meusCliquesMascote >= c.meta) await desbloquearConquista(c.id);
  }

  meuXP = window.xpCore.obterXP();
  const nivelInfo = calcularNivel(meuXP);
  for (const c of CONQUISTAS) {
    if (c.tipo === "nivel" && nivelInfo.nivel >= c.meta) await desbloquearConquista(c.id);
  }

  minhaStreak = window.xpCore.obterStreak();
  for (const c of CONQUISTAS) {
    if (c.tipo === "streak" && minhaStreak >= c.meta) await desbloquearConquista(c.id);
  }

  const usosSim = window.xpCore.obterContador("simulador");
  for (const c of CONQUISTAS) {
    if (c.tipo === "simulador" && usosSim >= c.meta) await desbloquearConquista(c.id);
  }

  const metasCount = Object.keys(__metasDisciplinas || {}).length;
  for (const c of CONQUISTAS) {
    if (c.tipo === "metas" && metasCount >= c.meta) await desbloquearConquista(c.id);
  }

  const periodosCount = window.xpCore.obterContador("periodos");
  for (const c of CONQUISTAS) {
    if (c.tipo === "periodos" && periodosCount >= c.meta) await desbloquearConquista(c.id);
  }

  const recadosCount = window.xpCore.obterContador("recados");
  for (const c of CONQUISTAS) {
    if (c.tipo === "recados" && recadosCount >= c.meta) await desbloquearConquista(c.id);
  }

  const curtidasCount = window.xpCore.obterContador("curtidas");
  for (const c of CONQUISTAS) {
    if (c.tipo === "curtidas" && curtidasCount >= c.meta) await desbloquearConquista(c.id);
  }
}

// ==========================================
// 🎖️ CARGOS — carregamento
// ==========================================
async function carregarCargos() {
  const mat = window.usuarioLogado?.matricula;
  if (!mat || mat === "Matrícula não disponível") return;

  try {
    const token = obterTokenSuap();
    if (!token) return;

    const r = await fetch("/api/cargos?tipo=meus", {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
      },
    });

    if (!r.ok) {
      console.warn("[cargos] erro na API:", r.status);
      return;
    }

    const dados = await r.json();
    if (!dados.sucesso) return;

    meuCargo = dados.ativoInfo || null;
    meuCargoDesde = dados.desde || null;
    meusCargosTodos = dados.todosInfo || [];

    // Renderiza no perfil do card principal (se existir)
    renderizarCargoNoCardPrincipal();
  } catch (e) {
    console.warn("[cargos] erro:", e.message);
  }
}

// ==========================================
// 🎖️ CARGOS — renderização (card do próprio usuário)
// ==========================================
function renderizarCargoNoCardPrincipal() {
  const card = document.querySelector(".user-profile-card");
  if (!card) return;

  // Remove badges antigas, se existirem
  const antigoCargo = card.querySelector(".user-cargo-badge");
  if (antigoCargo) antigoCargo.remove();
  const antigoAdmin = card.querySelector(".user-admin-badge");
  if (antigoAdmin) antigoAdmin.remove();

  // 👑 Badge de admin (independente do cargo)
  const mat = window.usuarioLogado?.matricula;
  if (String(mat) === MATRICULA_ADMIN) {
    const adminBadge = document.createElement("span");
    adminBadge.className = "user-admin-badge";
    adminBadge.innerHTML = montarBadgeAdmin(mat);
    const nomeEl = card.querySelector(".user-name");
    if (nomeEl) nomeEl.insertAdjacentElement("beforebegin", adminBadge);
  }

  if (!meuCargo) return;

  // Monta o badge
  const badge = document.createElement("div");
  badge.className = `user-cargo-badge cargo-badge-${meuCargo.raridade}`;
  badge.title = `${meuCargo.nome} — ${meuCargo.desc}`;
  badge.innerHTML = `
    <i class="fa-solid ${meuCargo.icone}"></i>
    <span>${escaparHTML(meuCargo.nome)}</span>
  `;

  // Insere depois do nome (h4.user-name)
  const nomeEl = card.querySelector(".user-name");
  if (nomeEl) {
    nomeEl.insertAdjacentElement("afterend", badge);
  } else {
    // Fallback: insere no começo do user-details
    const details = card.querySelector(".user-details");
    if (details) details.insertAdjacentElement("afterbegin", badge);
  }
}

// ==========================================
// 🎖️ CARGOS — renderização (modal de perfil público)
// ==========================================
// Chamada quando alguém abre o perfil de outro aluno
// ou o próprio perfil no modal.
async function carregarCargoNoModalPerfil(matricula) {
  const container = document.getElementById("modal-perfil-badges");
  if (!container) return;

  // Remove badges antigas
  const antigoCargo = container.querySelector(".modal-perfil-cargo");
  if (antigoCargo) antigoCargo.remove();
  const antigoAdmin = container.querySelector(".modal-perfil-admin-badge");
  if (antigoAdmin) antigoAdmin.remove();

  if (!matricula) return;

  // 👑 Badge de admin (independente do cargo)
  if (String(matricula) === MATRICULA_ADMIN) {
    const adminBadge = document.createElement("div");
    adminBadge.className = "modal-perfil-admin-badge";
    adminBadge.innerHTML = `<span class="admin-badge" title="Administrador do site"><i class="fa-solid fa-crown"></i></span>`;
    // Insere ANTES do cargo (se existir) ou no final
    const cargoEl = container.querySelector(".modal-perfil-cargo");
    if (cargoEl) cargoEl.insertAdjacentElement("beforebegin", adminBadge);
    else container.appendChild(adminBadge);
  }

  try {
    // Lê do Firebase direto (mais rápido que a API)
    const snap = await get(ref(db, `cargos/${matricula}`));
    const dados = snap.val();
    if (!dados || !dados.ativo) return;

    // Busca info completa do cargo (a API tem)
    const token = obterTokenSuap();
    let infoCargo = null;

    if (token) {
      const r = await fetch("/api/cargos?tipo=top", {
        headers: { "Authorization": "Bearer " + token },
      });
      if (r.ok) {
        const topData = await r.json();
        const entrada = topData.cargos?.[dados.ativo];
        if (entrada) infoCargo = entrada.cargo;
      }
    }

    // Fallback: monta um badge simples se a API não retornou
    if (!infoCargo) {
      infoCargo = {
        id: dados.ativo,
        nome: dados.ativo.charAt(0).toUpperCase() + dados.ativo.slice(1),
        icone: "fa-medal",
        raridade: dados.raridade || "comum",
      };
    }

    const badge = document.createElement("div");
    badge.className = `modal-perfil-cargo cargo-badge-${infoCargo.raridade}`;
    badge.title = `${infoCargo.nome}${infoCargo.desc ? " — " + infoCargo.desc : ""}`;
    badge.innerHTML = `
      <i class="fa-solid ${infoCargo.icone}"></i>
      <span>${escaparHTML(infoCargo.nome)}</span>
    `;

    container.appendChild(badge);
  } catch (e) {
    console.warn("[cargos modal] erro:", e.message);
  }
}

// ==========================================
// PAINEL DE XP
// ==========================================
async function carregarPainelXP() {
  const mat = window.usuarioLogado.matricula;
  if (!mat || mat === "Matrícula não disponível") return;
  try {
    if (window.xpCore?.estaPronto?.()) {
      meuXP = window.xpCore.obterXP();
      minhaStreak = window.xpCore.obterStreak();
      minhasConquistas = window.xpCore.obterConquistas();
      meusCliquesMascote = window.xpCore.obterCliquesMascote();
      renderizarPainelXP();
      renderizarConquistas();
      const skin = window.xpCore.obterSkinAtiva();
      avatarSelecionado = skin || "padrao";
      await checarConquistasAutomaticas();
    }
  } catch (e) {
    console.warn("[painelXP] Erro:", e);
  }
}

function renderizarPainelXP() {
  const nivelInfo = calcularNivel(meuXP);
  const nivelNum = document.getElementById("xp-nivel-num");
  if (nivelNum) nivelNum.textContent = nivelInfo.nivel;
  const nomeNivel = document.getElementById("xp-nome-nivel");
  if (nomeNivel) nomeNivel.textContent = nivelInfo.nome;
  const totalEl = document.getElementById("xp-total");
  if (totalEl) totalEl.textContent = `${meuXP.toLocaleString("pt-BR")} XP`;
  const streakEl = document.getElementById("xp-streak");
  if (streakEl) streakEl.textContent = minhaStreak;
  const barraFill = document.getElementById("xp-barra-fill");
  if (barraFill) barraFill.style.width = `${nivelInfo.progresso}%`;
  const proximoEl = document.getElementById("xp-proximo");
  if (proximoEl) {
    if (nivelInfo.proximoNome) {
      const falta = nivelInfo.xpProximo - meuXP;
      proximoEl.textContent = `Próximo nível: ${nivelInfo.proximoNome} (${falta} XP)`;
    } else {
      proximoEl.textContent = "🎉 Você atingiu o nível máximo!";
    }
  }
}

function renderizarConquistas() {
  const grid = document.getElementById("conquistas-grid");
  const contador = document.getElementById("conquistas-contador");
  if (!grid) return;
  const conquistasFiltradas = CONQUISTAS.filter((c) => {
    const desbloqueada = !!minhasConquistas[c.id];
    if (filtroConquistasAtivo === "desbloqueadas") return desbloqueada;
    if (filtroConquistasAtivo === "bloqueadas") return !desbloqueada;
    return true;
  });
  const totalDesbloqueadas = CONQUISTAS.filter((c) => !!minhasConquistas[c.id]).length;
  if (contador) contador.textContent = `${totalDesbloqueadas}/${CONQUISTAS.length}`;
  if (conquistasFiltradas.length === 0) {
    grid.innerHTML = `<p class="conquistas-vazio">Nenhuma conquista nesta categoria.</p>`;
    return;
  }
  grid.innerHTML = conquistasFiltradas.map((c) => {
    const desbloqueada = !!minhasConquistas[c.id];
    const raridade = c.raridade || "comum";
    return `
      <div class="conquista-card ${desbloqueada ? "desbloqueada" : "bloqueada"} ${raridade}" title="${escaparHTML(c.desc)}">
        <div class="conquista-icone"><i class="${c.icone}"></i></div>
        <div class="conquista-info">
          <span class="conquista-titulo">${escaparHTML(c.nome)}</span>
          <span class="conquista-desc">${escaparHTML(c.desc)}</span>
        </div>
      </div>`;
  }).join("");
}

function inicializarFiltrosConquistas() {
  document.querySelectorAll(".conquista-filtro").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".conquista-filtro").forEach((b) => b.classList.remove("ativo"));
      btn.classList.add("ativo");
      filtroConquistasAtivo = btn.dataset.filtro || "todas";
      renderizarConquistas();
    });
  });
}

// ==========================================
// SELETOR DE CONQUISTAS VISÍVEIS
// ==========================================
function renderizarSeletorConquistasVisiveis() {
  const grid = document.getElementById("conquistas-visiveis-grid");
  if (!grid) return;
  if (CONQUISTAS.length === 0) {
    grid.innerHTML = '<p class="conquistas-visiveis-vazio">Nenhuma conquista disponível.</p>';
    return;
  }
  const selecionadas = conquistasVisiveisSelecionadas;
  const listaEfetiva = selecionadas === null
    ? CONQUISTAS.filter((c) => !!minhasConquistas[c.id]).map((c) => c.id)
    : selecionadas;
  grid.innerHTML = CONQUISTAS.map((c) => {
    const desbloqueada = !!minhasConquistas[c.id];
    const estaSelecionada = listaEfetiva.includes(c.id);
    const raridade = c.raridade || "comum";
    return `
      <div class="conquista-visivel-item ${estaSelecionada ? "selecionada" : ""} ${raridade} ${!desbloqueada ? "bloqueada" : ""}"
           data-id="${c.id}" title="${escaparHTML(c.nome)} — ${escaparHTML(c.desc)}${!desbloqueada ? " (Bloqueada)" : ""}">
        <i class="${c.icone}"></i>
      </div>`;
  }).join("");
  grid.querySelectorAll(".conquista-visivel-item:not(.bloqueada)").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.dataset.id;
      if (conquistasVisiveisSelecionadas === null) {
        conquistasVisiveisSelecionadas = CONQUISTAS
          .filter((c) => !!minhasConquistas[c.id]).map((c) => c.id);
      }
      const idx = conquistasVisiveisSelecionadas.indexOf(id);
      if (idx >= 0) conquistasVisiveisSelecionadas.splice(idx, 1);
      else conquistasVisiveisSelecionadas.push(id);
      el.classList.toggle("selecionada", conquistasVisiveisSelecionadas.includes(id));
    });
  });
}

function inicializarBotoesConquistasVisiveis() {
  document.getElementById("btn-conquistas-todas")?.addEventListener("click", () => {
    conquistasVisiveisSelecionadas = CONQUISTAS
      .filter((c) => !!minhasConquistas[c.id]).map((c) => c.id);
    renderizarSeletorConquistasVisiveis();
  });
  document.getElementById("btn-conquistas-nenhuma")?.addEventListener("click", () => {
    conquistasVisiveisSelecionadas = [];
    renderizarSeletorConquistasVisiveis();
  });
}

function obterIdiomaAtual() {
  var lang = localStorage.getItem("idioma");
  if (lang && IDIOMAS_SUPORTADOS.includes(lang)) return lang;
  var nav = (navigator.language || "pt-BR").toLowerCase();
  if (nav.startsWith("en")) return "en";
  if (nav.startsWith("es")) return "es";
  return IDIOMA_PADRAO;
}

function t(chave) {
  var lang = obterIdiomaAtual();
  return (TRADUCOES_LOGIN[lang] && TRADUCOES_LOGIN[lang][chave]) ||
    TRADUCOES_LOGIN[IDIOMA_PADRAO][chave] || chave;
}

function aplicarTraducoes() {
  var lang = obterIdiomaAtual();
  document.documentElement.setAttribute("lang", lang);
  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    var chave = el.getAttribute("data-i18n");
    var texto = t(chave);
    if (texto) el.textContent = texto;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
    var chave = el.getAttribute("data-i18n-placeholder");
    var texto = t(chave);
    if (texto) el.setAttribute("placeholder", texto);
  });
  document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
    var chave = el.getAttribute("data-i18n-title");
    var texto = t(chave);
    if (texto) el.setAttribute("title", texto);
  });
  document.querySelectorAll("#menu-idioma .dropdown-item").forEach(function (btn) {
    btn.classList.toggle("ativo", btn.dataset.idioma === lang);
  });
  document.title = t("titulo_pagina_login");
}

function trocarIdioma(novoIdioma) {
  if (!IDIOMAS_SUPORTADOS.includes(novoIdioma)) return;
  localStorage.setItem("idioma", novoIdioma);
  aplicarTraducoes();
  if (typeof window.renderizarMural === "function") window.renderizarMural();
  if (typeof window.renderizarPerfis === "function") window.renderizarPerfis();
  if (typeof renderizarConquistas === "function") renderizarConquistas();
}

// ==========================================
// 🎨 TEMAS
// ==========================================
const TEMAS_DISPONIVEIS = ["roxo", "azul", "verde", "rosa", "laranja"];
const TEMA_PADRAO = "roxo";

function obterTemaAtual() {
  var tema = localStorage.getItem("tema-cor");
  return TEMAS_DISPONIVEIS.includes(tema) ? tema : TEMA_PADRAO;
}

function aplicarTema(novoTema) {
  if (!TEMAS_DISPONIVEIS.includes(novoTema)) novoTema = TEMA_PADRAO;
  TEMAS_DISPONIVEIS.forEach(function (t) { document.body.classList.remove("tema-" + t); });
  document.body.classList.add("tema-" + novoTema);
  localStorage.setItem("tema-cor", novoTema);
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    var cores = { roxo: "#8b5edd", azul: "#3b82f6", verde: "#10b981", rosa: "#ec4899", laranja: "#f97316" };
    meta.setAttribute("content", cores[novoTema] || "#8b5edd");
  }
  document.querySelectorAll("#menu-tema .dropdown-item").forEach(function (btn) {
    btn.classList.toggle("ativo", btn.dataset.tema === novoTema);
  });
  if (typeof desenharGraficoEvolucao === "function") setTimeout(desenharGraficoEvolucao, 60);
}

// ==========================================
// 📱 PWA
// ==========================================
var __deferredPrompt = null;
window.addEventListener("beforeinstallprompt", function (e) {
  e.preventDefault();
  __deferredPrompt = e;
  var btn = document.getElementById("btn-instalar-app");
  if (btn) btn.classList.remove("is-hidden");
});
window.addEventListener("appinstalled", function () {
  __deferredPrompt = null;
  var btn = document.getElementById("btn-instalar-app");
  if (btn) btn.classList.add("is-hidden");
  if (typeof exibirToast === "function") exibirToast("App instalado! 🎉", "sucesso");
});
function instalarPWA() {
  if (!__deferredPrompt) {
    if (typeof exibirToast === "function") exibirToast("Para instalar, use o menu do navegador > 'Adicionar à tela inicial'.", "info");
    return;
  }
  __deferredPrompt.prompt();
  __deferredPrompt.userChoice.then(function (choice) {
    if (choice.outcome === "accepted" && typeof exibirToast === "function") exibirToast("Instalando app...", "sucesso");
    __deferredPrompt = null;
  });
}
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/sw.js")
      .then(function (reg) { console.log("[PWA] SW registrado:", reg.scope); })
      .catch(function (err) { console.warn("[PWA] Falha ao registrar SW:", err); });
  });
}

// ==========================================
// 🎨 REGRAS DE CORES DO CALENDÁRIO
// ==========================================
// 🎨 Cor neutra única pra eventos sem cor escolhida no Google Calendar
const COR_PADRAO_CALENDARIO = "#8b5edd";

// 🎨 Categorias de matéria (cores oficiais do Google Calendar)
// Pra mudar, edita aqui + atualiza no Google Calendar
const MATERIAS = [
  { nome: "Matemática",  cor: "#D50000" }, // Tomate
  { nome: "Geografia",   cor: "#F6BF26" }, // Banana (era Manga)
  { nome: "Química",     cor: "#0B8043" }, // Manjericão (era Pistache)
  { nome: "Português",   cor: "#3F51B5" }, // Mirtilo
  { nome: "Autoria",     cor: "#8E24AA" }, // Uva
  { nome: "Sociologia",  cor: "#E67C73" }, // Flamingo
];

// ==========================================
// 🎨 GCAL — Carrega cores dos eventos do Google Calendar
// ==========================================
// Chama /api/gcal/cores uma vez. O backend tem cache de 5 min.
async function carregarCoresGoogle() {
  try {
    const r = await fetch("/api/gcal?tipo=cores");
    if (!r.ok) {
      console.warn("[gcal] erro ao buscar cores:", r.status);
      return;
    }
    const dados = await r.json();
    if (dados.sucesso && dados.cores) {
      gcalCoresCache = dados.cores;
      console.log("[gcal] cores carregadas:", Object.keys(dados.cores).length, "eventos");
      // 🆕 Re-renderiza a legenda com as cores carregadas
      if (typeof renderizarLegendaCalendario === "function") {
        renderizarLegendaCalendario();
      }
    }
  } catch (e) {
    console.warn("[gcal] erro:", e.message);
  }
}

// ==========================================
// 🎨 Pinta um elemento de evento do calendário
// ==========================================
function pintarElementoEvento(el, titulo, eventoId) {
  var cor = corDoEvento(titulo, eventoId);
  el.style.setProperty("background-color", cor, "important");
  el.style.setProperty("border-color", cor, "important");
  el.style.setProperty("color", "#ffffff", "important");
}

// 🎨 Cor da Química (fallback por título — Sálvia não é exposta pela API)
const COR_QUIMICA = "#0B8043";

// 🎨 Só usa a cor do Google. Sem cor → tenta pelo título. Sem título → neutra.
function corDoEvento(titulo, eventoId) {
  // 1️⃣ Cor do Google Calendar (prioridade)
  if (eventoId && gcalCoresCache[eventoId]) {
    return gcalCoresCache[eventoId];
  }

  // 2️⃣ Fallback específico: Química (e derivados)
  var t2 = String(titulo || "").toLowerCase();
  if (/\bqu[ií]mica?\b/.test(t2)) {
    return COR_QUIMICA;
  }

  // 3️⃣ Cor neutra
  return COR_PADRAO_CALENDARIO;
}

// 🎨 Legenda das categorias de matéria (cores fixas do Google Calendar)
function renderizarLegendaCalendario() {
  const container = document.getElementById("calendario-legenda");
  if (!container) return;
  container.innerHTML = MATERIAS.map(function (m) {
    return `<div class="legenda-item">
      <span class="legenda-cor" style="background:${m.cor}"></span>
      <span class="legenda-texto">${escaparHTML(m.nome)}</span>
    </div>`;
  }).join("");
}

// ==========================================
// TEMA CLARO/ESCURO
// ==========================================
const themeToggle = document.getElementById("theme-toggle");
if (themeToggle) {
  const themeIcon = themeToggle.querySelector("i");
  let currentTheme = localStorage.getItem("theme");
  if (!currentTheme) currentTheme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  if (currentTheme === "light") {
    document.body.classList.add("light-theme");
    if (themeIcon) themeIcon.classList.replace("fa-moon", "fa-sun");
  }
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    let theme = document.body.classList.contains("light-theme") ? "light" : "dark";
    if (themeIcon) {
      if (theme === "light") themeIcon.classList.replace("fa-moon", "fa-sun");
      else themeIcon.classList.replace("fa-sun", "fa-moon");
    }
    localStorage.setItem("theme", theme);
    if (window.__graficoEvolucao && typeof desenharGraficoEvolucao === "function") desenharGraficoEvolucao();
  });
}

// ==========================================
// FIREBASE LISTENERS
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
      chamarAPI("/api/mural?tipo=recado", { id, acao: "delete" }).catch(() => {});
    } else {
      bancoDeRecados.push({ id, ...recado, timestampCriacao, duracaoHoras });
    }
  });
  window.renderizarMural();
  if (typeof gerarNotificacoesRecados === "function") gerarNotificacoesRecados();
});

onValue(perfisRef, (snapshot) => {
  bancoDePerfis = [];
  snapshot.forEach((childSnapshot) => {
    const dados = childSnapshot.val() || {};
    bancoDePerfis.push({ id: childSnapshot.key, ...dados });
  });
  window.renderizarPerfis();
  if (window.usuarioLogado.matricula) {
    const meuPerfil = bancoDePerfis.find((p) =>
      String(p.matricula) === String(window.usuarioLogado.matricula) ||
      String(p.id) === String(window.usuarioLogado.matricula));
    if (meuPerfil && typeof window.aplicarPerfilNoCard === "function") window.aplicarPerfilNoCard(meuPerfil);
  }
});
// 🆕 Escuta cargos (para mostrar badge no mural/membros)
onValue(ref(db, "cargos"), (snapshot) => {
  bancoDeCargos = snapshot.val() || {};
  // Re-renderiza mural e perfis pra atualizar badges
  window.renderizarMural();
  window.renderizarPerfis();
});

// ==========================================
// ENVIO DE RECADOS (via API)
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
    const linkAnexo = linkInput ? linkInput.value.trim() : "";
    const valorInputDuracao = selectDuracao ? selectDuracao.value : "7d";
    const duracaoTotalHoras = parseDuracaoParaHoras(valorInputDuracao);

    chamarAPI("/api/mural?tipo=recado", {
      mensagem: mensagemBruta,
      link: linkAnexo,
      duracaoHoras: duracaoTotalHoras,
    })
      .then(async () => {
        exibirToast("Recado publicado! +10 XP", "sucesso");
        adicionarXP(XP_RECOMPENSAS.recado_postado, "recado_postado");
        if (window.xpCore?.estaPronto?.()) {
          const total = await window.xpCore.incrementarContador("recados", 1);
          if (total >= 10) desbloquearConquista("comunicador");
        }
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
// MURAL — BUSCAS
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

// ==========================================
// CONQUISTAS NO MODAL DE PERFIL
// ==========================================
async function carregarConquistasNoModalPerfil(matricula) {
  const secao = document.getElementById("modal-perfil-conquistas");
  const grid = document.getElementById("modal-perfil-conquistas-grid");
  const contador = document.getElementById("modal-perfil-conquistas-contador");
  if (!secao || !grid) return;
  secao.classList.remove("is-hidden");
  grid.innerHTML = '<p class="modal-perfil-conquistas-vazio"><i class="fa-solid fa-spinner fa-spin"></i></p>';
  if (contador) contador.textContent = "—";
  if (!matricula) {
    grid.innerHTML = '<p class="modal-perfil-conquistas-vazio">Matrícula indisponível.</p>';
    return;
  }
  try {
    const [snapConquistas, snapPerfil] = await Promise.all([
      get(ref(db, "usuarios_xp/" + matricula + "/conquistas")),
      get(ref(db, "perfis_alunos/" + matricula)),
    ]);
    const conquistas = snapConquistas.val() || {};
    const perfil = snapPerfil.val() || {};
    const conquistasVisiveis = extrairConquistasVisiveis(perfil.conquistasVisiveis);
    const desbloqueadas = CONQUISTAS.filter((c) => !!conquistas[c.id]);
    let conquistasParaMostrar;
    if (conquistasVisiveis !== null) {
      conquistasParaMostrar = CONQUISTAS.filter(
        (c) => conquistasVisiveis.includes(c.id) && !!conquistas[c.id]
      );
      if (conquistasParaMostrar.length === 0) {
        if (contador) contador.textContent = `0/${CONQUISTAS.length}`;
        grid.innerHTML = '<p class="modal-perfil-conquistas-vazio">Este aluno não exibe conquistas publicamente.</p>';
        return;
      }
    } else {
      conquistasParaMostrar = desbloqueadas;
    }
    if (contador) contador.textContent = `${conquistasParaMostrar.length}/${CONQUISTAS.length}`;
    grid.innerHTML = conquistasParaMostrar.map((c) => {
      const raridade = c.raridade || "comum";
      return `
        <div class="modal-conquista-badge desbloqueada ${raridade}"
             title="${escaparHTML(c.nome)} — ${escaparHTML(c.desc)}">
          <i class="${c.icone}"></i>
        </div>`;
    }).join("");
  } catch (err) {
    console.warn("[conquistas perfil] erro:", err);
    grid.innerHTML = '<p class="modal-perfil-conquistas-vazio">Erro ao carregar conquistas.</p>';
    if (contador) contador.textContent = "—";
  }
}

// ==========================================
// MODAL DE PERFIL PÚBLICO
// ==========================================
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

  const mascoteBox = document.getElementById("modal-perfil-mascote");
  const mascoteEmoji = document.getElementById("modal-perfil-mascote-emoji");
  const mascoteNome = document.getElementById("modal-perfil-mascote-nome");
  if (mascoteBox && mascoteEmoji && mascoteNome) {
    const mascoteId = perfil.mascoteAvatar || "padrao";
    const mascote = obterMascotePorId(mascoteId);
    mascoteEmoji.innerHTML = `<img src="${mascote.arquivo}" alt="${escaparHTML(mascote.nome)}" onerror="this.style.display='none';this.parentNode.textContent='🐾'">`;
    mascoteNome.textContent = mascote.nome;
    mascoteBox.classList.remove("is-hidden");
    mascoteBox.classList.toggle("admin", mascoteId === "admin");
  }

  (async function carregarNivelDoPerfil() {
    const nivelBox = document.getElementById("modal-perfil-nivel");
    const badgeEl = document.getElementById("modal-perfil-nivel-badge");
    const nomeNivelEl = document.getElementById("modal-perfil-nivel-nome");
    const xpEl = document.getElementById("modal-perfil-nivel-xp");
    if (!nivelBox) return;
    try {
      const mat = perfil.matricula || perfil.id;
      const snap = await get(ref(db, "usuarios_xp/" + mat));
      const dados = snap.val() || {};
      const xp = Number(dados.xp) || 0;
      const nivelInfo = calcularNivel(xp);
      if (badgeEl) badgeEl.textContent = nivelInfo.nivel;
      if (nomeNivelEl) nomeNivelEl.textContent = nivelInfo.nome;
      if (xpEl) xpEl.textContent = `${xp.toLocaleString("pt-BR")} XP`;
      nivelBox.classList.remove("is-hidden");
    } catch (err) {
      console.warn("[nível perfil] erro:", err);
      nivelBox.classList.add("is-hidden");
    }
  })();

  if (acessoEl) acessoEl.textContent = perfil.ultimoAcesso ? new Date(perfil.ultimoAcesso).toLocaleString("pt-BR") : t("nao_registrado");
  if (bioEl) {
    if (perfil.bio && String(perfil.bio).trim()) { bioEl.textContent = perfil.bio; bioEl.classList.remove("is-hidden"); }
    else { bioEl.textContent = ""; bioEl.classList.add("is-hidden"); }
  }
  if (redesEl) {
    const links = montarLinksRedes(perfil.redes);
    if (links.length > 0) {
      redesEl.innerHTML = links.map((l) => `<a href="${l.url}" target="_blank" rel="noopener noreferrer" title="${l.titulo}" aria-label="${l.titulo}" class="modal-rede-link"><i class="${l.icone}"></i></a>`).join("");
      redesEl.classList.remove("is-hidden");
    } else { redesEl.innerHTML = ""; redesEl.classList.add("is-hidden"); }
  }

  carregarConquistasNoModalPerfil(perfil.matricula || perfil.id);
  carregarCargoNoModalPerfil(perfil.matricula || perfil.id);  // 🆕
  modal.classList.remove("is-hidden");
};

window.fecharModalPerfil = function () {
  const modal = document.getElementById("modal-perfil");
  if (modal) modal.classList.add("is-hidden");
};

// ==========================================
// MURAL — RENDER
// ==========================================
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
    lista.innerHTML = '<p class="sem-recados" style="text-align:center;opacity:0.7;padding:15px;">Nenhum recado encontrado.</p>';
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
    const btnExcluir = ehAutor || ehAdmin ? `<button type="button" class="btn-like" style="color: #ff4757;" onclick="excluirRecado('${recado.id}')"><i class="fa-solid fa-trash"></i></button>` : "";
    const btnEditar = ehAutor || ehAdmin ? `<button type="button" class="btn-like" style="color: #eccc68;" onclick="editarRecado('${recado.id}')"><i class="fa-solid fa-pen"></i></button>` : "";
    const mensagemComLinks = converterLinks(escaparHTML(recado.mensagem));
    const nomeSeguro = escaparHTML(nomeParaExibicao(recado.autor_nome));
    const adminBadgeMural = montarBadgeAdmin(recado.autor_matricula);
    // Cargo do autor (busca do cache, sem chamada extra)
    const cargoAutor = bancoDeCargos[recado.autor_matricula] || null;
    const cargoBadgeMural = cargoAutor
      ? `<span class="recado-cargo-badge cargo-badge-${cargoAutor.raridade}" title="${escaparHTML(cargoAutor.nome)}${cargoAutor.desc ? " — " + escaparHTML(cargoAutor.desc) : ""}">
           <i class="fa-solid ${cargoAutor.icone}"></i>
         </span>`
      : "";
    const tagEditado = recado.editado ? ' <small style="opacity:0.6;font-style:italic;">(editado)</small>' : "";
    const anexoHTML = recado.link_anexo ? `<div class="recado-anexo" style="margin-top:8px;"><a href="${recado.link_anexo}" target="_blank" rel="noopener noreferrer" style="font-size:0.85em;color:#70a1ff;text-decoration:underline;"><i class="fa-solid fa-paperclip"></i> Ver anexo</a></div>` : "";
    const comentariosObj = recado.comentarios || {};
    const listaComentarios = Object.keys(comentariosObj).map((cId) => ({ cId, ...comentariosObj[cId] }));
    const totalComentarios = listaComentarios.length;
    let htmlComentarios = "";
    listaComentarios.forEach((com) => {
      const ehAutorCom = com.autor_matricula === window.usuarioLogado.matricula;
      const btnDelCom = ehAutorCom || ehAdmin ? `<button type="button" style="background:none;border:none;color:#ff4757;cursor:pointer;font-size:0.8em;" onclick="excluirComentario('${recado.id}','${com.cId}')"><i class="fa-solid fa-xmark"></i></button>` : "";
      htmlComentarios += `<div class="comentario-item" style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.05);padding:6px 10px;border-radius:6px;margin-top:5px;font-size:0.85em;"><div style="flex:1;"><strong>${escaparHTML(com.autor_nome)}:</strong> ${converterLinks(escaparHTML(com.texto))}</div>${btnDelCom}</div>`;
    });
    const div = document.createElement("div");
    div.className = "recado-item";
    div.innerHTML = `
      <div class="recado-header">
        <span class="recado-nome">${adminBadgeMural}${nomeSeguro}${cargoBadgeMural}</span>
        <span class="recado-data" title="${textoExpiracao}">...</span>
      </div>
      <p class="recado-mensagem">${mensagemComLinks}</p>
      ${anexoHTML}
      <div class="recado-acoes" style="margin-top:10px;display:flex;gap:8px;align-items:center;">
        ${btnEditar}${btnExcluir}
        <button type="button" class="btn-like" style="${corCoracao}" onclick="curtirRecado('${recado.id}')"><i class="${iconeCoracao}"></i> ${totalLikes}</button>
        <button type="button" class="btn-like" onclick="alternarComentarios('${recado.id}')" title="Comentários"><i class="fa-regular fa-comment"></i> ${totalComentarios}</button>
      </div>
      <div id="box-comentarios-${recado.id}" class="box-comentarios" style="display:none;margin-top:12px;border-top:1px solid rgba(255,255,255,0.1);padding-top:8px;">
        <div id="lista-comentarios-${recado.id}">${htmlComentarios}</div>
        <div style="display:flex;gap:5px;margin-top:8px;">
          <input type="text" id="input-comentario-${recado.id}" placeholder="Escreva um comentário..." style="flex:1;padding:6px 10px;border-radius:4px;border:1px solid rgba(255,255,255,0.2);background:transparent;color:inherit;font-size:0.85em;" />
          <button type="button" onclick="adicionarComentario('${recado.id}')" style="padding:6px 12px;border-radius:4px;border:none;background:#70a1ff;color:white;cursor:pointer;font-size:0.85em;">Enviar</button>
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
  chamarAPI("/api/mural?tipo=comentar", { recadoId, texto })
    .then(() => {
      exibirToast("Comentário adicionado! +3 XP", "sucesso");
      adicionarXP(XP_RECOMPENSAS.comentario, "comentario");
      inputEl.value = "";
    })
    .catch((err) => exibirToast("Erro: " + err.message, "erro"));
};

window.excluirComentario = function (recadoId, comentarioId) {
  if (!confirm("Excluir este comentário?")) return;
  chamarAPI("/api/mural?tipo=excluir-comentario", { recadoId, comentarioId })
    .then(() => exibirToast("Comentário removido.", "sucesso"))
    .catch((err) => exibirToast("Erro: " + err.message, "erro"));
};

// ==========================================
// PERFIS — RENDER
// ==========================================
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
    container.innerHTML = `<p class="sem-perfis" style="text-align:center;opacity:0.7;padding:20px;grid-column:1/-1;">${bancoDePerfis.length === 0 ? "Nenhum membro cadastrado ainda." : "Nenhum perfil corresponde ao filtro."}</p>`;
    return;
  }
  perfisFiltrados.forEach((perfil) => {
    const card = document.createElement("div");
    card.className = "perfil-card";
    const identificador = perfil.matricula || perfil.id;
    card.setAttribute("onclick", `abrirModalPerfil('${identificador}')`);
    card.style.cursor = "pointer";
    const nomeExibir = perfil.nomeCompleto || perfil.nome || "Usuário sem nome";
    const adminBadgeMembro = montarBadgeAdmin(identificador);
    const fotoFinal = perfil.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(nomeExibir)}&background=random`;
    const mascoteId = perfil.mascoteAvatar || "padrao";
    const mascote = obterMascotePorId(mascoteId);
    const ehAdminSkin = mascoteId === "admin";
    const cargoDoPerfil = bancoDeCargos[identificador] || null;
    const cargoBadgeMembro = cargoDoPerfil?.ativo
      ? `<span class="perfil-cargo-badge cargo-badge-${cargoDoPerfil.raridade}" title="${escaparHTML(cargoDoPerfil.nome || cargoDoPerfil.ativo)}">
           <i class="fa-solid ${cargoDoPerfil.icone || 'fa-medal'}"></i>
         </span>`
      : "";
    card.innerHTML = `
      <div class="perfil-card-mascote ${ehAdminSkin ? "admin" : ""}" title="Mascote: ${escaparHTML(mascote.nome)}">
        <img src="${mascote.arquivo}" alt="${escaparHTML(mascote.nome)}" onerror="this.style.display='none'">
      </div>
      <div class="perfil-avatar">
        <img src="${escaparHTML(fotoFinal)}" alt="${escaparHTML(nomeExibir)}" onerror="this.onerror=null;this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(nomeExibir)}&background=random'">
      </div>
      <div class="perfil-info">
        <h4 class="perfil-nome">${adminBadgeMembro}${escaparHTML(nomeExibir)}${cargoBadgeMembro}</h4>
        <span class="perfil-matricula">${escaparHTML(matriculaParaExibicao(perfil.matricula || perfil.id))}</span>
      </div>
    `;
    container.appendChild(card);
  });
};

// ==========================================
// RECADOS — EDIÇÃO (via API)
// ==========================================
window.editarRecado = function (id) {
  get(ref(db, "mural_recados/" + id)).then((snapshot) => {
    const recado = snapshot.val();
    if (!recado) return;
    const ehAdmin = MATRICULAS_ADMIN.includes(window.usuarioLogado.matricula);
    const ehAutor = recado.autor_matricula === window.usuarioLogado.matricula;
    if (!ehAutor && !ehAdmin) { exibirToast("Sem permissão.", "erro"); return; }
    const textoAtual = recado.mensagem.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#039;/g, "'");
    const novaMensagem = prompt("1/2 - Edite a sua mensagem:", textoAtual);
    if (novaMensagem !== null && novaMensagem.trim() !== "") {
      const horasAtuais = recado.duracao_horas || (recado.duracao_dias ? recado.duracao_dias * 24 : 168);
      const tempoAtualStr = horasAtuais % 24 === 0 ? horasAtuais / 24 + "d" : horasAtuais + "h";
      const novosDiasInput = prompt("2/2 - Duração (ex: 5h, 12h, 2d, 15d)", tempoAtualStr);
      let novasHoras = horasAtuais;
      if (novosDiasInput !== null && novosDiasInput.trim() !== "") novasHoras = parseDuracaoParaHoras(novosDiasInput);
      chamarAPI("/api/mural?tipo=editar", { id, mensagem: novaMensagem.trim(), duracaoHoras: novasHoras })
        .then(() => exibirToast("Recado atualizado!", "sucesso"))
        .catch((err) => exibirToast("Erro: " + err.message, "erro"));
    }
  });
};

// ==========================================
// CURTIR RECADO (via API)
// ==========================================
window.curtirRecado = function (id) {
  chamarAPI("/api/mural?tipo=curtir", { id })
    .then((r) => {
      if (r.curtiu) {
        adicionarXP(XP_RECOMPENSAS.curtida, "curtida");
        if (window.xpCore?.estaPronto?.()) {
          window.xpCore.incrementarContador("curtidas", 1).then((total) => {
            if (total >= 20) desbloquearConquista("social");
          });
        }
      }
    })
    .catch((err) => exibirToast("Erro: " + err.message, "erro"));
};

window.excluirRecado = function (id) {
  if (!confirm("Excluir este recado?")) return;
  chamarAPI("/api/mural?tipo=recado", { id, acao: "delete" })
    .then(() => exibirToast("Recado excluído.", "sucesso"))
    .catch((err) => exibirToast("Erro: " + err.message, "erro"));
};

window.forceLogout = function () {
  if (typeof suap !== "undefined") suap.logout();
  document.cookie = "suapToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "suapToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/login;";
  document.cookie = "suapToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=" + window.location.hostname + "; path=/;";
  localStorage.removeItem("suapToken");
  localStorage.removeItem("matricula_suap");
  document.cookie = "matricula=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  sessionStorage.clear();
  window.location.replace(window.location.origin + "/login.html");
};

// ==========================================
// EDIÇÃO DE PERFIL
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
    redesEl.innerHTML = links.map((l) => `<a href="${l.url}" target="_blank" rel="noopener noreferrer" title="${l.titulo}" aria-label="${l.titulo}"><i class="${l.icone}"></i></a>`).join("");
  }
  if (perfil.foto) window.usuarioLogado.foto = perfil.foto;
  if (perfil.nome) window.usuarioLogado.nome = perfil.nome;
  if (perfil.mascoteAvatar) {
    try { localStorage.setItem("mascote_avatar", perfil.mascoteAvatar); } catch (e) {}
  }
  const btn = document.getElementById("btn-editar-perfil");
  const label = document.getElementById("btn-editar-perfil-label");
  if (btn && label) {
    btn.disabled = false;
    label.textContent = t("editar_perfil");
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
        mascoteAvatar: dados.mascoteAvatar || (local && local.mascoteAvatar) || "padrao",
        conquistasVisiveis: dados.conquistasVisiveis !== undefined
          ? dados.conquistasVisiveis
          : (local ? local.conquistasVisiveis : null),
      };
      window.aplicarPerfilNoCard(perfilFinal);
      salvarPerfilLocal(matricula, perfilFinal);
      return perfilFinal;
    })
    .catch((err) => { console.warn("Firebase off, usando local:", err); return local; });
};

// ==========================================
// 🎭 SELETOR DE AVATAR DO MASCOTE
// Bloqueia skins por cliques OU por conquista não desbloqueada.
// ==========================================
function renderizarSeletorAvatar() {
  const grid = document.getElementById("avatar-mascote-grid");
  if (!grid) return;

  const cliques = meusCliquesMascote;
  const skins = obterSkinsDisponiveis();

  grid.innerHTML = skins.map((av) => {
    const ativo = av.id === avatarSelecionado;
    const ehAdminSkin = av.id === "admin";

    // ---- Calcula bloqueio e motivo ----
    let bloqueada = false;
    let motivoBloqueio = "";

    if (!av.gratis && !av.apenasAdmin) {
      if (av.tipo === "conquista") {
        // Skin liberada só se a conquista já foi desbloqueada
        const temConquista = !!minhasConquistas[av.conquistaNecessaria];
        if (!temConquista) {
          bloqueada = true;
          const nomeConquista = av.conquistaNecessaria === "nerd" ? "Nerd" : "Vestuário?";
          motivoBloqueio = `Conquista "${nomeConquista}" não desbloqueada`;
        }
      } else {
        // tipo "cliques" (padrão) — comportamento original
        const necessarios = av.cliquesNecessarios || 0;
        if (cliques < necessarios) {
          bloqueada = true;
          const faltam = necessarios - cliques;
          motivoBloqueio = `Faltam ${faltam.toLocaleString("pt-BR")} cliques`;
        }
      }
    }

    // ---- Monta o HTML do lock ----
    let lockHTML = "";
    if (bloqueada) {
      if (av.tipo === "conquista") {
        // Mostra um cadeado + ícone de conquista (não tem "faltam X")
        lockHTML = `
          <span class="avatar-lock"><i class="fa-solid fa-lock"></i></span>
          <span class="avatar-faltam">Conquista</span>
        `;
      } else {
        // Cliques: mostra o número que falta
        const faltam = (av.cliquesNecessarios || 0) - cliques;
        lockHTML = `
          <span class="avatar-lock"><i class="fa-solid fa-lock"></i></span>
          <span class="avatar-faltam">Faltam ${faltam.toLocaleString("pt-BR")}</span>
        `;
      }
    }

    // ---- Título (tooltip) ----
    let titulo = av.nome;
    if (bloqueada) titulo += " — " + motivoBloqueio;
    if (ehAdminSkin) titulo += " (exclusiva admin)";

    return `
      <button type="button" class="avatar-mascote-opcao ${ativo ? "ativo" : ""} ${bloqueada ? "bloqueado" : ""} ${ehAdminSkin ? "admin" : ""}"
              data-avatar="${av.id}" ${bloqueada ? 'disabled aria-disabled="true"' : ""}
              title="${escaparHTML(titulo)}">
        <img src="${av.arquivo}" alt="${escaparHTML(av.nome)}" onerror="this.style.display='none';this.parentNode.textContent='🐾'">
        ${lockHTML}
      </button>`;
  }).join("");

  grid.querySelectorAll(".avatar-mascote-opcao:not(.bloqueado)").forEach((btn) => {
    btn.addEventListener("click", () => {
      const anterior = avatarSelecionado;
      avatarSelecionado = btn.dataset.avatar;
      grid.querySelectorAll(".avatar-mascote-opcao").forEach((b) => {
        b.classList.toggle("ativo", b.dataset.avatar === avatarSelecionado);
      });
      if (anterior !== avatarSelecionado && window.usuarioLogado.matricula) {
        adicionarXP(XP_RECOMPENSAS.trocar_avatar, "trocar_avatar");
        desbloquearConquista("estiloso");
      }
    });
  });
}

// ==========================================
// MODAL EDITAR PERFIL
// ==========================================
window.abrirModalEditarPerfil = function () {
  if (!perfilUsuarioAtual) { exibirToast("Perfil ainda não carregado.", "erro"); return; }
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
  avatarSelecionado = perfilUsuarioAtual.mascoteAvatar || "padrao";
  renderizarSeletorAvatar();
  const cv = perfilUsuarioAtual.conquistasVisiveis;
  const listaExtraida = extrairConquistasVisiveis(cv);
  conquistasVisiveisSelecionadas = listaExtraida;
  renderizarSeletorConquistasVisiveis();
  document.getElementById("modal-editar-perfil")?.classList.remove("is-hidden");
};

window.fecharModalEditarPerfil = function () {
  document.getElementById("modal-editar-perfil")?.classList.add("is-hidden");
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
      } catch (err) { exibirToast("Erro: " + err.message, "erro"); }
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
  if (!nome) { exibirToast("Informe um nome.", "erro"); return; }
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
  const btnSalvar = document.getElementById("btn-salvar-perfil");
  const textoOriginal = btnSalvar.innerHTML;
  btnSalvar.disabled = true;
  btnSalvar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
  try {
    const perfilAtualizado = {
      nome, foto: fotoFinal, bio, redes,
      mascoteAvatar: avatarSelecionado,
      conquistasVisiveis: montarConquistasVisiveisPayload(conquistasVisiveisSelecionadas),
    };
    await chamarAPI("/api/perfil?tipo=update", perfilAtualizado);
    if (window.xpCore?.estaPronto?.()) {
      await window.xpCore.definirSkinAtiva(avatarSelecionado);
    }
    salvarPerfilLocal(matricula, perfilAtualizado);
    window.aplicarPerfilNoCard(perfilAtualizado);
    exibirToast("Perfil atualizado!", "sucesso");
    window.fecharModalEditarPerfil();
  } catch (err) { exibirToast("Erro: " + err.message, "erro"); }
  finally {
    btnSalvar.disabled = false;
    btnSalvar.innerHTML = textoOriginal;
  }
}

// ==========================================
// SUAP E BOLETIM
// ==========================================
var suap = new SuapClient(SUAP_URL, CLIENT_ID, REDIRECT_URI, SCOPE);
suap.init();

function formatarNota(valor) {
  if (valor === null || valor === undefined || valor === "") return null;
  var nota = Number(String(valor).replace(",", "."));
  return Number.isFinite(nota) ? nota : null;
}
function textoNota(valor) { return valor === null ? "-" : valor.toFixed(1); }

function atualizarStatusNotas(mensagem, tipo) {
  var status = document.getElementById("notas-status");
  if (!status) return;
  var variante = tipo === true ? "erro" : typeof tipo === "string" ? tipo : "info";
  var icones = { info: "fa-circle-info", loading: "fa-spinner", sucesso: "fa-circle-check", erro: "fa-circle-exclamation" };
  status.className = "notas-status" + (variante === "loading" ? " loading" : variante === "info" ? "" : " " + variante);
  status.innerHTML = `<i class="fa-solid ${icones[variante] || icones.info}"></i> <span>${escaparHTML(mensagem)}</span>`;
}

function obterEtapasDaDisciplina(disciplina) {
  if (disciplina.segundo_semestre === true) return { tipo: "Semestral", etapas: [3, 4] };
  if (disciplina.segundo_semestre === false) return { tipo: "Semestral", etapas: [1, 2] };
  var tem12 = [1, 2].some(function (n) {
    var e = disciplina["nota_etapa_" + n];
    return formatarNota(e && typeof e === "object" ? e.nota : e) !== null;
  });
  var tem34 = [3, 4].some(function (n) {
    var e = disciplina["nota_etapa_" + n];
    return formatarNota(e && typeof e === "object" ? e.nota : e) !== null;
  });
  if (tem34 && !tem12) return { tipo: "Semestral", etapas: [3, 4] };
  if (tem12 && tem34) return { tipo: "Anual", etapas: [1, 2, 3, 4] };
  if (tem12) {
    var temCampo34 = "nota_etapa_3" in disciplina || "nota_etapa_4" in disciplina;
    if (temCampo34) return { tipo: "Anual", etapas: [1, 2, 3, 4] };
    return { tipo: "Semestral", etapas: [1, 2] };
  }
  if ("nota_etapa_3" in disciplina || "nota_etapa_4" in disciplina) return { tipo: "Anual", etapas: [1, 2, 3, 4] };
  return { tipo: "Semestral", etapas: [1, 2] };
}

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
const LIMITE_FALTAS_ALERTA = 0.2;
const CARGA_HORARIA_PADRAO = 60;

function getCodigoDisc(d) { return String(d.codigo_diario || d.disciplina || d.id || "disc").trim(); }
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
  var usarSimulacao = simulacao != null && temEtapaAberta;
  if (usarSimulacao) {
    var comSim = preenchidasReais.concat([simulacao]);
    var somaSim = comSim.reduce(function (a, b) { return a + b; }, 0);
    return { media: somaSim / comSim.length, preenchidasReais: preenchidasReais.length, preenchidasComSim: comSim.length, somaReal, somaComSim: somaSim, temEtapaAberta, simulando: true };
  }
  var mediaApi = formatarNota(d.media_disciplina);
  return { media: preenchidasReais.length ? somaReal / preenchidasReais.length : mediaApi, preenchidasReais: preenchidasReais.length, preenchidasComSim: preenchidasReais.length, somaReal, somaComSim: somaReal, temEtapaAberta, simulando: false };
}

function calcularProjecaoDisciplina(notasPreenchidas, totalEtapas, soma, meta) {
  var faltantes = totalEtapas - notasPreenchidas;
  if (faltantes <= 0) {
    var mediaFinal = notasPreenchidas ? soma / notasPreenchidas : null;
    if (mediaFinal === null) return { texto: "Sem notas", classe: "projecao-alerta" };
    return mediaFinal >= meta ? { texto: "Meta atingida", classe: "projecao-ok" } : { texto: "Abaixo da meta", classe: "projecao-ruim" };
  }
  var necessaria = (meta * totalEtapas - soma) / faltantes;
  if (necessaria <= 0) return { texto: "Meta garantida", classe: "projecao-ok" };
  if (necessaria > 100) return { texto: "Meta inviável", classe: "projecao-ruim" };
  return { texto: "Precisa " + necessaria.toFixed(1), classe: "projecao-alerta" };
}

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
    .catch(function (err) { console.warn("[metas] firebase:", err); });
}

function salvarMetasDisciplinas() {
  var mat = window.usuarioLogado.matricula;
  if (!mat) return Promise.resolve();
  try { localStorage.setItem(MATRICULA_STORAGE_KEY(), JSON.stringify(__metasDisciplinas)); } catch (e) {}
  return chamarAPI("/api/meta", { metas: __metasDisciplinas }).catch(function (err) { console.warn("[metas] api:", err); });
}

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
      va = va === null ? -1 : va;
      vb = vb === null ? -1 : vb;
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

function atualizarResumoNotas(disciplinas) {
  var elMedia = document.getElementById("resumo-media");
  var elDisc = document.getElementById("resumo-disciplinas");
  var elRisco = document.getElementById("resumo-risco");
  var elFaltas = document.getElementById("resumo-faltas");
  if (!elMedia && !elDisc && !elRisco && !elFaltas) return;
  var total = disciplinas.length, somaMedias = 0, contMedias = 0, faltasTotais = 0, emRisco = 0;
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
      discCritica = { nome: d.disciplina || d.codigo_diario, faltas, nivel: "danger" };
    } else if (faltas >= limiteAlerta && (!discCritica || discCritica.nivel !== "danger")) {
      if (faltas > alertaMax) {
        alertaMax = faltas;
        discCritica = { nome: d.disciplina || d.codigo_diario, faltas, nivel: "warn" };
      }
    }
  });
  if (!discCritica) return;
  var panel = document.querySelector(".notas-panel");
  if (!panel) return;
  var banner = document.createElement("div");
  banner.className = "alerta-faltas " + discCritica.nivel;
  banner.innerHTML = discCritica.nivel === "danger"
    ? `<i class="fa-solid fa-triangle-exclamation"></i><span><strong>Atenção!</strong> ${discCritica.faltas} faltas em <em>${escaparHTML(discCritica.nome)}</em> — próximo do limite (${limiteReprov}).</span>`
    : `<i class="fa-solid fa-circle-exclamation"></i><span><strong>Cuidado:</strong> ${discCritica.faltas} faltas em <em>${escaparHTML(discCritica.nome)}</em>.</span>`;
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
  var entry = { periodo: periodoLabel, media, disciplinas: disciplinas.length, ano };
  if (idx >= 0) __historicoPeriodos[idx] = entry;
  else __historicoPeriodos.push(entry);
  __historicoPeriodos.sort(function (a, b) { return b.periodo.localeCompare(a.periodo); });
  renderizarHistorico();
  var panel = document.getElementById("historico-panel");
  if (panel) panel.classList.remove("is-hidden");
  desenharGraficoEvolucao();
}

function renderizarHistorico() {
  var container = document.getElementById("historico-content");
  if (!container) return;
  if (__historicoPeriodos.length < 1) {
    container.innerHTML = `<p class="historico-vazio">${escaparHTML(t("historico_vazio"))}</p>`;
    return;
  }
  var cronologico = __historicoPeriodos.slice().sort(function (a, b) { return a.periodo.localeCompare(b.periodo); });
  var mapa = {};
  cronologico.forEach(function (h, i) {
    mapa[h.periodo] = i > 0
      ? (h.media !== null && cronologico[i - 1].media !== null ? h.media - cronologico[i - 1].media : null)
      : null;
  });
  container.innerHTML = __historicoPeriodos.map(function (h) {
    var diff = mapa[h.periodo];
    var trendHTML = "";
    if (diff !== null && diff !== undefined) {
      if (diff > 0.3) trendHTML = `<span class="periodo-trend up"><i class="fa-solid fa-arrow-up"></i> +${diff.toFixed(1)}</span>`;
      else if (diff < -0.3) trendHTML = `<span class="periodo-trend down"><i class="fa-solid fa-arrow-down"></i> ${diff.toFixed(1)}</span>`;
      else trendHTML = `<span class="periodo-trend eq"><i class="fa-solid fa-minus"></i> estável</span>`;
    }
    return `<div class="historico-card"><span class="periodo-label">${escaparHTML(h.periodo)}</span><span class="periodo-media">${h.media !== null ? h.media.toFixed(1) : "—"}</span><span class="periodo-info">${h.disciplinas} disciplina(s)</span>${trendHTML}</div>`;
  }).join("");
}

window.__graficoEvolucao = null;
function desenharGraficoEvolucao() {
  var canvas = document.getElementById("grafico-evolucao");
  var panel = document.getElementById("evolucao-panel");
  if (!canvas || !panel) return;
  if (typeof Chart === "undefined") { panel.classList.add("is-hidden"); return; }
  var comMedia = (__historicoPeriodos || []).filter(function (h) { return h && h.media !== null && h.media !== undefined; });
  if (comMedia.length === 0) { panel.classList.add("is-hidden"); return; }
  panel.classList.remove("is-hidden");
  var ordenado = __historicoPeriodos.slice().sort(function (a, b) { return a.periodo.localeCompare(b.periodo); });
  var labels = ordenado.map(function (h) { return h.periodo; });
  var dados = ordenado.map(function (h) { return h.media !== null ? h.media : 0; });
  if (window.__graficoEvolucao) { try { window.__graficoEvolucao.destroy(); } catch (e) {} window.__graficoEvolucao = null; }
  var estilo = getComputedStyle(document.body);
  var corAccent = corParaHex(estilo.getPropertyValue("--accent-strong").trim(), "#8b5edd");
  var corAccent2 = corParaHex(estilo.getPropertyValue("--accent").trim(), "#cebdec");
  var corTexto = corParaHex(estilo.getPropertyValue("--text-muted").trim(), "#b8a8d9");
  var corGrade = estilo.getPropertyValue("--border-color").trim() || "rgba(206,189,236,0.18)";
  var corMeta = corParaHex(estilo.getPropertyValue("--warning").trim(), "#f59e0b");
  var ctx = canvas.getContext("2d");
  var gradient = ctx.createLinearGradient(0, 0, 0, 260);
  addStopSeguro(gradient, 0, corAccent + "cc", "rgba(139,94,221,0.8)");
  addStopSeguro(gradient, 1, corAccent + "08", "rgba(139,94,221,0.03)");
  try {
    window.__graficoEvolucao = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          { label: "Média", data: dados, borderColor: corAccent, backgroundColor: gradient, borderWidth: 3, pointBackgroundColor: corAccent2, pointBorderColor: corAccent, pointBorderWidth: 2, pointRadius: 6, pointHoverRadius: 9, tension: 0.35, fill: true },
          { label: "Meta", data: labels.map(function () { return __metaAtual; }), borderColor: corMeta, borderWidth: 2, borderDash: [6, 6], pointRadius: 0, fill: false },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { labels: { color: corTexto, font: { family: "Inter", size: 12, weight: "600" }, usePointStyle: true } },
          tooltip: { backgroundColor: "rgba(0,0,0,0.85)", titleFont: { family: "Inter", size: 13 }, bodyFont: { family: "Inter", size: 12 }, padding: 10, cornerRadius: 8, callbacks: { label: function (context) { return context.dataset.label + ": " + context.parsed.y.toFixed(1); } } },
        },
        scales: {
          y: { beginAtZero: true, max: 100, ticks: { color: corTexto, font: { family: "Inter", size: 11 }, stepSize: 20 }, grid: { color: corGrade, drawBorder: false } },
          x: { ticks: { color: corTexto, font: { family: "Inter", size: 11, weight: "600" } }, grid: { display: false } },
        },
      },
    });
  } catch (err) { console.error("[evolução] Erro ao criar gráfico:", err); panel.classList.add("is-hidden"); }
}

// ==========================================
// RENDERIZAR NOTAS (mantém igual)
// ==========================================
function renderizarNotas(disciplinas, apenasLinhaCodigo) {
  var corpo = document.getElementById("lista-notas");
  if (!corpo) return;
  var metaInput = document.getElementById("meta-notas");
  var meta = metaInput ? formatarNota(metaInput.value) || 60 : 60;
  __metaAtual = meta;
  if (apenasLinhaCodigo && __notasCache.length) {
    var tr = corpo.querySelector(`tr[data-codigo="${CSS.escape(apenasLinhaCodigo)}"]`);
    if (tr) {
      var d = __notasCache.find(function (x) { return getCodigoDisc(x) === apenasLinhaCodigo; });
      if (d) { atualizarLinhaNota(tr, d, meta); atualizarResumoNotas(__notasCache); return; }
    }
  }
  __notasCache = disciplinas || [];
  corpo.innerHTML = "";
  if (!__notasCache.length) {
    corpo.innerHTML = '<tr><td colspan="8" class="notas-vazia"><i class="fa-solid fa-inbox"></i><span>Nenhuma disciplina neste período.</span></td></tr>';
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
    corpo.innerHTML = '<tr><td colspan="8" class="notas-vazia"><i class="fa-solid fa-filter-circle-xmark"></i><span>Nenhuma disciplina neste filtro.</span></td></tr>';
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
      corpo.appendChild(criarLinhaNota(item.disciplina, item.etapas, tipo, meta));
    });
  });
  atualizarResumoNotas(__notasCache);
  alertaDeFaltas(__notasCache);
  bindSimuladores(corpo);
}

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
  var faltasClasse = faltas > CARGA_HORARIA_PADRAO * LIMITE_FALTAS_PCT ? "critico" : faltas > CARGA_HORARIA_PADRAO * LIMITE_FALTAS_ALERTA ? "alerta" : "";
  var badgeLabel = { aprovado: '<i class="fa-solid fa-check"></i> ' + t("leg_aprovado"), recuperacao: '<i class="fa-solid fa-rotate"></i> ' + t("leg_recuperacao"), reprovado: '<i class="fa-solid fa-xmark"></i> ' + t("leg_reprovado") }[status];
  var linhaRisco = status === "reprovado" || faltasClasse === "critico" ? "linha-risco" : "";
  var linhaSim = calc.simulando ? "simulando" : "";
  var etapasHTML = notasEtapas.map(function (n) { return '<span class="etapa-pill">' + textoNota(n) + "</span>"; }).join("");
  var percentual = media !== null ? Math.min(media, 100) : 0;
  var mediaHTML = '<div class="media-cell"><span>' + textoNota(media) + '</span><div class="media-bar"><div class="media-bar-fill ' + status + '" style="width:' + percentual + '%"></div></div></div>';
  var temEtapaEmAberto = calc.temEtapaAberta;
  var simuladorHTML = temEtapaEmAberto
    ? `<div class="simulador-cell"><input type="number" class="simulador-input" data-codigo="${escaparHTML(codigo)}" min="0" max="100" step="0.1" placeholder="Nota" value="${sim != null ? sim : ""}" />${calc.simulando ? `<span class="simulador-resultado ${status === "aprovado" ? "ok" : status === "recuperacao" ? "mid" : "ruim"}">${textoNota(media)}</span>` : ""}</div>`
    : '<span style="color:var(--text-muted);font-size:.8rem;">Fechada</span>';
  var metaCustom = __metasDisciplinas[codigo] != null;
  var metaHTML = `<button type="button" class="btn-meta-disciplina ${metaCustom ? "customizada" : ""}" data-codigo="${escaparHTML(codigo)}" data-nome="${escaparHTML(d.disciplina || codigo)}" title="Meta: ${metaDisc}">🎯</button>`;
  var tr = document.createElement("tr");
  tr.className = [linhaRisco, linhaSim].filter(Boolean).join(" ");
  tr.dataset.grupoLinha = tipo;
  tr.dataset.codigo = codigo;
  tr.innerHTML = '<td class="td-disciplina"><strong>' + escaparHTML(d.disciplina || d.codigo_diario || "Disciplina") + "</strong></td>" +
    '<td><div class="etapas-cell">' + (etapasHTML || '<span class="etapa-pill">—</span>') + "</div></td>" +
    '<td class="td-media">' + mediaHTML + "</td>" +
    '<td class="td-faltas"><span class="faltas-cell ' + faltasClasse + '">' + faltas + "</span></td>" +
    '<td class="td-projecao"><span class="projecao-cell ' + proj.classe + '">' + proj.texto + "</span></td>" +
    '<td class="td-status"><span class="badge badge-' + status + '">' + badgeLabel + "</span></td>" +
    '<td class="td-simulador">' + simuladorHTML + "</td>" +
    '<td class="td-meta">' + metaHTML + "</td>";
  return tr;
}

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
    tdMedia.innerHTML = '<div class="media-cell"><span>' + textoNota(media) + '</span><div class="media-bar"><div class="media-bar-fill ' + status + '" style="width:' + percentual + '%"></div></div></div>';
  }
  var tdProj = tr.querySelector(".td-projecao");
  if (tdProj) tdProj.innerHTML = '<span class="projecao-cell ' + proj.classe + '">' + proj.texto + "</span>";
  var tdStatus = tr.querySelector(".td-status");
  if (tdStatus) {
    var badgeLabel = { aprovado: '<i class="fa-solid fa-check"></i> ' + t("leg_aprovado"), recuperacao: '<i class="fa-solid fa-rotate"></i> ' + t("leg_recuperacao"), reprovado: '<i class="fa-solid fa-xmark"></i> ' + t("leg_reprovado") }[status];
    tdStatus.innerHTML = '<span class="badge badge-' + status + '">' + badgeLabel + "</span>";
  }
  var tdSim = tr.querySelector(".td-simulador");
  if (tdSim) {
    var resultadoEl = tdSim.querySelector(".simulador-resultado");
    if (calc.simulando) {
      var classeRes = status === "aprovado" ? "ok" : status === "recuperacao" ? "mid" : "ruim";
      if (resultadoEl) { resultadoEl.className = "simulador-resultado " + classeRes; resultadoEl.textContent = textoNota(media); }
      else {
        var input = tdSim.querySelector(".simulador-input");
        if (input) {
          var span = document.createElement("span");
          span.className = "simulador-resultado " + classeRes;
          span.textContent = textoNota(media);
          input.insertAdjacentElement("afterend", span);
        }
      }
    } else if (resultadoEl) resultadoEl.remove();
  }
}

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
      if (val !== "" && podeGanharXPSimulador()) {
        registrarXPSimulador();
        adicionarXP(XP_RECOMPENSAS.simulador, "simulador");
        if (window.xpCore?.estaPronto?.()) {
          window.xpCore.incrementarContador("simulador", 1).then((total) => {
            if (total >= 10) desbloquearConquista("cientista");
          });
        }
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
    exibirToast("Meta removida.", "sucesso");
  };
  btnSalvar.onclick = function () {
    const valorAnterior = __metasDisciplinas[codigo];
    __metasDisciplinas[codigo] = Number(rangeInput.value);
    salvarMetasDisciplinas();
    modal.classList.add("is-hidden");
    if (__notasCache.length) renderizarNotas(__notasCache);
    if (valorAnterior !== __metasDisciplinas[codigo]) {
      adicionarXP(XP_RECOMPENSAS.definir_meta, "definir_meta");
      setTimeout(() => {
        const metasCount = Object.keys(__metasDisciplinas || {}).length;
        if (metasCount >= 5) desbloquearConquista("metódico");
      }, 100);
    }
    exibirToast("Meta salva (" + rangeInput.value + ").", "sucesso");
  };
  btnFechar.onclick = function () { modal.classList.add("is-hidden"); };
  modal.onclick = function (e) { if (e.target === modal) modal.classList.add("is-hidden"); };
  modal.classList.remove("is-hidden");
}

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
    linhas.push([(d.disciplina || d.codigo_diario || "").replace(/;/g, ","), cfg.tipo, cfg.etapas.map(function (n) { var e = d["nota_etapa_" + n]; return textoNota(formatarNota(e && typeof e === "object" ? e.nota : e)); }).join(" | "), textoNota(calc.media), meta, faltas, proj.texto, st].join(";"));
  });
  var csv = "\uFEFF" + linhas.join("\n");
  var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  var periodo = (document.getElementById("periodo-notas")?.value || "boletim").replace("/", ".");
  a.href = url; a.download = "boletim_" + periodo + ".csv";
  document.body.appendChild(a); a.click(); a.remove();
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
      linhasHTML += `<tr><td>${escaparHTML(d.disciplina || d.codigo_diario || "")}</td><td>${cfg.etapas.map(function (n) { var e = d["nota_etapa_" + n]; return textoNota(formatarNota(e && typeof e === "object" ? e.nota : e)); }).join(" | ")}</td><td>${textoNota(calc.media)}</td><td>${faltas}</td><td>${proj.texto}</td><td style="color:${cor};font-weight:700">${st}</td></tr>`;
    });
  });
  var w = window.open("", "_blank");
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Boletim ${escaparHTML(nome)}</title><style>*{font-family:'Segoe UI',Arial,sans-serif;}body{padding:30px;color:#222;}h1{font-size:20px;margin:0 0 4px;}.sub{color:#666;font-size:12px;margin-bottom:20px;}table{width:100%;border-collapse:collapse;margin-top:10px;font-size:12px;}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left;}th{background:#f3f0fa;}tr.grupo td{background:#ece7f8;font-size:13px;}.rodape{margin-top:24px;font-size:10px;color:#999;text-align:center;}@media print{body{padding:10px;}}</style></head><body><h1>Boletim Acadêmico — ${escaparHTML(nome)}</h1><div class="sub">Matrícula: ${escaparHTML(mat)} • Período: ${escaparHTML(periodo)} • Emitido em ${new Date().toLocaleString("pt-BR")}</div><table><thead><tr><th>Disciplina</th><th>Etapas</th><th>Média</th><th>Faltas</th><th>Projeção</th><th>Status</th></tr></thead><tbody>${linhasHTML}</tbody></table><div class="rodape">Gerado pelo Portal InfoWeb 2V — IFRN</div><script>window.onload=()=>setTimeout(()=>window.print(),300);<\/script></body></html>`);
  w.document.close();
}

function salvarResumoBoletimFirebase(ano, periodo, disciplinas) {
  var mat = window.usuarioLogado.matricula;
  if (!mat || mat === "Matrícula não disponível") return;
  if (!disciplinas || !disciplinas.length) return;
  try {
    var somaMedias = 0, contMedias = 0, faltasTotais = 0;
    var temNota100 = false; // 🆕 flag: detecta nota 100 em qualquer matéria/etapa
    disciplinas.forEach(function (d) {
      var etapas = obterEtapasDaDisciplina(d).etapas;
      var notas = etapas.map(function (n) {
        var e = d["nota_etapa_" + n];
        return formatarNota(e && typeof e === "object" ? e.nota : e);
      });
      var preenchidas = notas.filter(function (v) { return v !== null; });
      var soma = preenchidas.reduce(function (a, b) { return a + b; }, 0);
      var mediaApi = formatarNota(d.media_disciplina);
      var media = preenchidas.length ? soma / preenchidas.length : mediaApi;
      if (media !== null) { somaMedias += media; contMedias++; }
      faltasTotais += Number(d.numero_faltas) || 0;

      // 🆕 Conquista antiga: média da disciplina = 100
      if (media !== null && media >= 100) desbloquearConquista("nota_100");

      // 🆕 Conquista nova: QUALQUER etapa com nota 100 (não só a média)
      if (preenchidas.some(function (v) { return v >= 100; })) {
        temNota100 = true;
      }
    });

    var mediaGeral = contMedias ? somaMedias / contMedias : null;
    if (mediaGeral !== null && mediaGeral >= 90) desbloquearConquista("nota_maxima");

    // 🆕 Desbloqueia "nerd" se tirou 100 em QUALQUER etapa de QUALQUER disciplina
    if (temNota100) desbloquearConquista("nerd");

    chamarAPI("/api/boletim", {
      mediaGeral,
      faltasTotais,
      disciplinasCount: disciplinas.length,
      periodo: ano + "." + periodo,
    }).catch(function (err) { console.warn("[resumo boletim] erro:", err); });
  } catch (e) { console.warn("[resumo boletim] exceção:", e); }
}

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
      salvarResumoBoletimFirebase(ano, periodo, disciplinas);
      if (!jaGanhouXPBoletim(label)) {
        marcarXPBoletim(label);
        adicionarXP(XP_RECOMPENSAS.ver_boletim, "ver_boletim");
        if (window.xpCore?.estaPronto?.()) {
          window.xpCore.registrarPeriodoVisto(label).then((novo) => {
            if (novo) {
              const total = window.xpCore.obterContador("periodos");
              if (total >= 3) desbloquearConquista("explorador");
            }
          });
        }
      }
    },
    function (xhr) {
      renderizarNotas([]);
      atualizarStatusNotas("Erro ao carregar boletim (HTTP " + xhr.status + ").", "erro");
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
      else atualizarStatusNotas("Nenhum período disponível.", "erro");
    },
    function (xhr) { atualizarStatusNotas("Erro nos períodos (HTTP " + xhr.status + ").", "erro"); }
  );
}

// ==========================================
// NOTIFICAÇÕES
// ==========================================
const CHAVE_NOTIF_LIDAS = () => "notif_lidas_" + (window.usuarioLogado.matricula || "anon");
let __notificacoes = [];

function gerarNotificacoesRecados() {
  var mat = window.usuarioLogado.matricula;
  if (!mat) return;
  var lidas = {};
  try {
    var raw = localStorage.getItem(CHAVE_NOTIF_LIDAS());
    lidas = raw ? JSON.parse(raw) : {};
  } catch (e) { lidas = {}; }
  __notificacoes = [];
  bancoDeRecados.forEach(function (r) {
    if (r.autor_matricula === mat) return;
    var idade = Date.now() - (r.timestampCriacao || 0);
    if (idade > 30 * 24 * 60 * 60 * 1000) return;
    __notificacoes.push({
      id: r.id, tipo: "recado", icone: "fa-regular fa-comment-dots",
      titulo: "Novo recado de " + nomeParaExibicao(r.autor_nome),
      descricao: (r.mensagem || "").slice(0, 80) + ((r.mensagem || "").length > 80 ? "..." : ""),
      data: r.timestampCriacao, lida: !!lidas[r.id],
    });
  });
  __notificacoes.sort(function (a, b) { return b.data - a.data; });
  atualizarBadgeNotificacoes();
}

function atualizarBadgeNotificacoes() {
  var btn = document.getElementById("btn-notificacoes");
  var badge = document.getElementById("badge-notificacoes");
  var naoLidas = __notificacoes.filter(function (n) { return !n.lida; }).length;
  if (btn) btn.classList.remove("is-hidden");
  if (badge) {
    if (naoLidas > 0) { badge.textContent = naoLidas > 9 ? "9+" : naoLidas; badge.classList.remove("is-hidden"); }
    else badge.classList.add("is-hidden");
  }
}

function renderizarPainelNotificacoes() {
  var lista = document.getElementById("lista-notificacoes");
  if (!lista) return;
  if (__notificacoes.length === 0) { lista.innerHTML = `<p class="notif-vazio">${escaparHTML(t("sem_notif"))}</p>`; return; }
  lista.innerHTML = __notificacoes.map(function (n) {
    var dataStr = new Date(n.data).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    return `<div class="notif-item ${n.lida ? "" : "nao-lida"}" data-id="${n.id}"><div class="notif-icone"><i class="${n.icone}"></i></div><div class="notif-corpo"><div class="notif-titulo">${escaparHTML(n.titulo)}</div><div class="notif-descricao">${escaparHTML(n.descricao)}</div><div class="notif-data">${dataStr}</div></div></div>`;
  }).join("");
  lista.querySelectorAll(".notif-item").forEach(function (el) {
    el.addEventListener("click", function () {
      var id = el.dataset.id;
      marcarNotificacaoLida(id);
      document.getElementById("mural")?.scrollIntoView({ behavior: "smooth" });
      document.getElementById("painel-notificacoes")?.classList.add("is-hidden");
    });
  });
}

function marcarNotificacaoLida(id) {
  var lidas = {};
  try {
    var raw = localStorage.getItem(CHAVE_NOTIF_LIDAS());
    lidas = raw ? JSON.parse(raw) : {};
  } catch (e) { lidas = {}; }
  lidas[id] = true;
  localStorage.setItem(CHAVE_NOTIF_LIDAS(), JSON.stringify(lidas));
  __notificacoes.forEach(function (n) { if (n.id === id) n.lida = true; });
  atualizarBadgeNotificacoes();
  renderizarPainelNotificacoes();
}

function marcarTodasLidas() {
  var lidas = {};
  __notificacoes.forEach(function (n) { lidas[n.id] = true; n.lida = true; });
  localStorage.setItem(CHAVE_NOTIF_LIDAS(), JSON.stringify(lidas));
  atualizarBadgeNotificacoes();
  renderizarPainelNotificacoes();
}

// ==========================================
// PRÓXIMOS EVENTOS + CONTAGEM
// ==========================================
let __contagemInterval = null;

function renderizarProximosEventos(eventos) {
  atualizarContagemRegressiva(eventos);
}

function atualizarContagemRegressiva(eventos) {
  const grid = document.getElementById("contagem-grid");
  if (!grid) return;
  const agora = Date.now();
  const em30dias = agora + 30 * 24 * 60 * 60 * 1000;

  const proximos = (eventos || []).map((ev) => {
    const dataStr = ev.startStr || (ev.start instanceof Date ? ev.start.toISOString() : ev.start);
    let inicio;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) {
      inicio = new Date(dataStr + "T12:00:00-03:00");
    } else {
      inicio = ev.start instanceof Date ? ev.start : new Date(ev.start);
    }
    return { titulo: ev.title || "Evento", data: inicio, dataStr };
  }).filter((e) => e.data.getTime() >= agora - 12 * 60 * 60 * 1000 && e.data.getTime() <= em30dias)
    .sort((a, b) => a.data - b.data).slice(0, 4);

  if (proximos.length === 0) {
    grid.innerHTML = `<div class="contagem-vazio"><i class="fa-regular fa-calendar"></i><p data-i18n="contagem_vazio">Nenhum evento próximo nos próximos 30 dias.</p></div>`;
    if (__contagemInterval) clearInterval(__contagemInterval);
    return;
  }

  grid.innerHTML = proximos.map((ev, i) => {
    const diffMs = ev.data.getTime() - agora;
    const diffHoras = diffMs / (1000 * 60 * 60);
    let classe = "";
    if (diffHoras < 24) classe = "urgente";
    else if (diffHoras < 72) classe = "proximo";
    // 🆕 Só o bloco de "dias" (evento all-day não precisa de horas/min/seg)
    return `<div class="contagem-card ${classe}" data-index="${i}" data-data="${ev.dataStr}">
      <div class="contagem-titulo">${escaparHTML(ev.titulo)}</div>
      <div class="contagem-timer" id="timer-${i}">
        <div class="contagem-bloco">
          <span class="contagem-num" data-tipo="dias">0</span>
          <span class="contagem-label" data-tipo="dias">dias</span>
        </div>
      </div>
      <div class="contagem-data"><i class="fa-regular fa-calendar-check"></i>${formatarDataPtBR(ev.dataStr)}</div>
    </div>`;
  }).join("");

  if (typeof aplicarTraducoes === "function") aplicarTraducoes();
  if (__contagemInterval) clearInterval(__contagemInterval);
  atualizarTimersContagem();
  __contagemInterval = setInterval(atualizarTimersContagem, 60000);
}

// 🆕 Formata data em pt-BR no fuso de Fortaleza
// Aceita "YYYY-MM-DD" (all-day) ou ISO com hora
function formatarDataPtBR(dataStr) {
  if (!dataStr) return "";
  // All-day: "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) {
    const [ano, mes, dia] = dataStr.split("-");
    const meses = ["janeiro","fevereiro","março","abril","maio","junho",
                   "julho","agosto","setembro","outubro","novembro","dezembro"];
    return `${dia} de ${meses[parseInt(mes, 10) - 1]} de ${ano}`;
  }
  // Com hora: ISO
  return new Date(dataStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Fortaleza",
  });
}

function calcularDiasCalendario(dataEventoISO) {
  if (!dataEventoISO) return 0;
  const hojeStr = new Date().toLocaleDateString("en-CA", { timeZone: "America/Fortaleza" });
  let eventoStr;
  // 🆕 Aceita tanto "YYYY-MM-DD" quanto ISO completo
  if (/^\d{4}-\d{2}-\d{2}$/.test(dataEventoISO)) {
    eventoStr = dataEventoISO;
  } else {
    eventoStr = new Date(dataEventoISO).toLocaleDateString("en-CA", { timeZone: "America/Fortaleza" });
  }
  const hoje = new Date(hojeStr + "T12:00:00Z");
  const evento = new Date(eventoStr + "T12:00:00Z");
  return Math.round((evento - hoje) / (1000 * 60 * 60 * 24));
}

function atualizarTimersContagem() {
  const cards = document.querySelectorAll(".contagem-card[data-data]");
  cards.forEach((card) => {
    const dataISO = card.dataset.data;
    const dias = Math.max(0, calcularDiasCalendario(dataISO));
    const elDias = card.querySelector('[data-tipo="dias"]');
    const elLabel = card.querySelector('.contagem-label[data-tipo="dias"]') 
                 || card.querySelector(".contagem-label");
    if (!elDias) return;

    if (dias === 0) {
      elDias.textContent = "HOJE";
      if (elLabel) elLabel.textContent = "";
    } else if (dias === 1) {
      elDias.textContent = "1";
      if (elLabel) elLabel.textContent = "dia";
    } else {
      elDias.textContent = dias;
      if (elLabel) elLabel.textContent = "dias";
    }
  });
}

// ==========================================
// 🎖️ RECALCULAR CARGOS (admin)
// ==========================================
window.recalcularCargos = async function () {
  const btn = document.getElementById("btn-recalcular-cargos");
  const status = document.getElementById("sala-cargos-status");
  if (!btn || btn.disabled) return;

  const token = obterTokenSuap();
  if (!token) {
    exibirToast("Token expirado. Faça login de novo.", "erro");
    return;
  }

  btn.disabled = true;
  const htmlOriginal = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Recalculando...</span>';
  if (status) status.textContent = "";

  try {
    const r = await fetch("/api/cargos?tipo=recalcular", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
      },
      body: "{}",
    });

    const dados = await r.json();

    if (!r.ok || !dados.sucesso) {
      throw new Error(dados.erro || "Erro desconhecido");
    }

    // Mostra resumo
    const totalCargos = dados.totalCargos || 0;
    const totalAlunos = dados.totalAlunos || 0;
    exibirToast(
      `✅ Cargos recalculados: ${totalCargos} cargos em ${totalAlunos} alunos`,
      "sucesso"
    );
    if (status) {
      status.textContent = `✓ ${totalCargos} cargos recalculados`;
      status.className = "sala-cargos-status sucesso";
    }

    // Recarrega a sala pra atualizar a coluna "Cargo"
    __salaDadosCarregados = false;
    await carregarSalaProfessores();
  } catch (e) {
    console.error("[cargos] erro:", e);
    exibirToast("Erro ao recalcular: " + e.message, "erro");
    if (status) {
      status.textContent = "✗ " + e.message;
      status.className = "sala-cargos-status erro";
    }
  } finally {
    btn.disabled = false;
    btn.innerHTML = htmlOriginal;
  }
};

// ==========================================
// SALA DOS PROFESSORES
// ==========================================
async function carregarSalaProfessores() {
  if (__salaDadosCarregados) return;
  __salaDadosCarregados = true;
  const tbody = document.getElementById("sala-lista-alunos");
  if (!tbody) return;
  console.log("[sala] Iniciando carregamento...");
    const resultados = await Promise.allSettled([
    get(perfisRef),
    get(ref(db, "mascote/por_aluno")),
    get(ref(db, "resumo_boletim")),
    get(ref(db, "mural_recados")),
    get(ref(db, "usuarios_xp")),
    get(ref(db, "cargos")),  // 🆕
  ]);
  const [perfisRes, carinhosRes, resumosRes, recadosRes, xpRes, cargosRes] = resultados;
  const perfisSnap = perfisRes.status === "fulfilled" ? perfisRes.value : { val: () => ({}) };
  const carinhosSnap = carinhosRes.status === "fulfilled" ? carinhosRes.value : { val: () => ({}) };
  const resumosSnap = resumosRes.status === "fulfilled" ? resumosRes.value : { val: () => ({}) };
  const recadosSnap = recadosRes.status === "fulfilled" ? recadosRes.value : { exists: () => false, val: () => ({}) };
  const xpSnap = xpRes.status === "fulfilled" ? xpRes.value : { val: () => ({}) };
  const cargosSnap = cargosRes.status === "fulfilled" ? cargosRes.value : { val: () => ({}) };
  const perfis = perfisSnap.val() || {};
  const carinhos = carinhosSnap.val() || {};
  const resumos = resumosSnap.val() || {};
  const xpData = xpSnap.val() || {};
  const cargosData = cargosSnap.val() || {};
  const totalRecados = recadosSnap.exists() ? Object.keys(recadosSnap.val() || {}).length : 0;
  console.log("[sala] Perfis:", Object.keys(perfis).length, "| XP keys:", Object.keys(xpData).length);
  const alunos = Object.keys(perfis)
    .filter((mat) => !String(mat).startsWith("anon_"))
    .map((mat) => {
      const p = perfis[mat] || {};
      const r = resumos[mat] || {};
      const numConquistas = contarConquistasDoAluno(xpData, mat);
      const xpAluno = obterXpDoAluno(xpData, mat) || {};
      const xpTotal = Number(xpAluno.xp) || 0;
      const cargoData = cargosData[mat];
      const cargo = cargoData?.ativo
        ? {
            id: cargoData.ativo,
            raridade: cargoData.raridade || "comum",
            nome: cargoData.nome || cargoData.ativo,
            icone: cargoData.icone || "fa-medal",
            desc: cargoData.desc || "",
          }
        : null;
      return {
        matricula: mat,
        nome: p.nome || p.nomeCompleto || "Aluno " + mat.slice(-4),
        nomeCompleto: p.nomeCompleto || p.nome || "",
        foto: p.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nome || mat)}&background=random`,
        carinhos: Number(carinhos[mat]) || 0,
        ultimoAcesso: p.ultimoAcesso || 0,
        mediaGeral: typeof r.mediaGeral === "number" ? r.mediaGeral : null,
        faltasTotais: typeof r.faltasTotais === "number" ? r.faltasTotais : null,
        periodo: r.periodo || "—",
        numConquistas,
        xpTotal,
        cargo,  // 🆕
      };
    });
  alunos.sort((a, b) => a.nome.localeCompare(b.nome));
  if (alunos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="sala-vazio"><i class="fa-regular fa-folder-open"></i> Nenhum aluno cadastrado.</td></tr>`;
  } else {
    tbody.innerHTML = alunos.map((a) => {
      const diasSemAcesso = a.ultimoAcesso ? Math.floor((Date.now() - a.ultimoAcesso) / (1000 * 60 * 60 * 24)) : null;
      let statusClasse = "ok", statusLabel = "Ativo";
      if (diasSemAcesso !== null && diasSemAcesso > 14) { statusClasse = "danger"; statusLabel = `${diasSemAcesso}d sem acesso`; }
      else if (diasSemAcesso !== null && diasSemAcesso > 7) { statusClasse = "warn"; statusLabel = `${diasSemAcesso}d sem acesso`; }
      let mediaHTML;
      if (a.mediaGeral !== null) {
        const cor = a.mediaGeral >= 60 ? "var(--success)" : a.mediaGeral >= 40 ? "var(--warning)" : "var(--danger)";
        mediaHTML = `<strong style="color:${cor}">${a.mediaGeral.toFixed(1)}</strong>`;
      } else mediaHTML = `<span class="sala-sem-dados" title="Aluno ainda não abriu o site"><i class="fa-solid fa-clock"></i> Pendente</span>`;
      let faltasHTML;
      if (a.faltasTotais !== null) {
        const cor = a.faltasTotais > 15 ? "var(--danger)" : a.faltasTotais > 10 ? "var(--warning)" : "var(--text-main)";
        faltasHTML = `<span style="color:${cor};font-weight:600">${a.faltasTotais}</span>`;
      } else faltasHTML = `<span class="sala-sem-dados"><i class="fa-solid fa-clock"></i> Pendente</span>`;
            const cargoBadge = a.cargo
        ? `<span class="sala-cargo-badge cargo-badge-${a.cargo.raridade}" title="${escaparHTML(a.cargo.nome)} — ${escaparHTML(a.cargo.desc || "")}">
             <i class="fa-solid ${a.cargo.icone}"></i>
             <span>${escaparHTML(a.cargo.nome)}</span>
           </span>`
        : `<span class="sala-sem-dados" title="Sem cargo no momento"><i class="fa-solid fa-minus"></i></span>`;
      return `<tr data-nome="${a.nome.toLowerCase()}" data-mat="${a.matricula}">
        <td><div class="td-aluno"><img src="${a.foto}" alt="${a.nome}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(a.nome)}&background=random'"><span>${escaparHTML(a.nome)}</span></div></td>
        <td>${a.matricula}</td>
        <td>${mediaHTML}</td>
        <td>${faltasHTML}</td>
        <td><i class="fa-solid fa-heart" style="color:#ff6b6b;font-size:0.8rem;"></i> ${a.carinhos.toLocaleString("pt-BR")}</td>
        <td><span title="${a.numConquistas} de ${CONQUISTAS.length} conquistas • ${a.xpTotal} XP" style="font-weight:700;color:${a.numConquistas >= 9 ? 'var(--success)' : a.numConquistas >= 5 ? 'var(--warning)' : 'var(--text-main)'};">🎖️ ${a.numConquistas}/${CONQUISTAS.length}</span></td>
        <td>${cargoBadge}</td>
        <td><span class="sala-badge ${statusClasse}">${statusLabel}</span></td>
      </tr>`;
    }).join("");
  }
  try {
    const totalCarinhos = Object.values(carinhos).reduce((a, b) => a + (Number(b) || 0), 0);
    const elCar = document.getElementById("sala-stat-total-carinhos");
    const elRec = document.getElementById("sala-stat-total-recados");
    const elAlu = document.getElementById("sala-stat-total-alunos");
    const elTop = document.getElementById("sala-stat-top-carinhos");
    if (elCar) elCar.textContent = totalCarinhos.toLocaleString("pt-BR");
    if (elRec) elRec.textContent = totalRecados;
    if (elAlu) elAlu.textContent = alunos.length;
    const top = alunos.reduce((max, a) => (a.carinhos > (max?.carinhos || 0) ? a : max), null);
    if (elTop) elTop.textContent = top ? `${top.nome} (${top.carinhos})` : "—";
  } catch (e) { console.warn("[sala] erro nos stats:", e); }
  const riscoContainer = document.getElementById("sala-lista-risco");
  if (riscoContainer) {
    const emRisco = alunos.filter((a) => {
      const mediaBaixa = a.mediaGeral !== null && a.mediaGeral < 60;
      const muitasFaltas = a.faltasTotais !== null && a.faltasTotais > 10;
      const semDados = a.mediaGeral === null && a.faltasTotais === null;
      return mediaBaixa || muitasFaltas || semDados;
    });
    if (emRisco.length === 0) {
      riscoContainer.innerHTML = '<p class="sala-vazio-msg">🎉 Nenhum aluno em risco no momento!</p>';
    } else {
      riscoContainer.innerHTML = emRisco.map((a) => {
        const motivos = [];
        if (a.mediaGeral === null && a.faltasTotais === null) motivos.push("Sem dados de boletim");
        else {
          if (a.mediaGeral !== null && a.mediaGeral < 60) motivos.push(`Média ${a.mediaGeral.toFixed(1)} (abaixo de 60)`);
          if (a.faltasTotais !== null && a.faltasTotais > 15) motivos.push(`${a.faltasTotais} faltas (crítico)`);
          else if (a.faltasTotais !== null && a.faltasTotais > 10) motivos.push(`${a.faltasTotais} faltas (atenção)`);
        }
        const nivelRisco = (a.mediaGeral !== null && a.mediaGeral < 40) || (a.faltasTotais !== null && a.faltasTotais > 15) ? "danger" : "";
        return `
          <div class="sala-alerta-card ${nivelRisco}">
            <img src="${a.foto}" alt="${a.nome}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(a.nome)}&background=random'">
            <div class="sala-alerta-info">
              <span class="sala-alerta-nome">${escaparHTML(a.nome)}</span>
              <span class="sala-alerta-motivo"><i class="fa-solid fa-triangle-exclamation"></i> ${motivos.join(" • ")}</span>
            </div>
          </div>`;
      }).join("");
    }
  }
  const engajamentoLista = document.getElementById("sala-engajamento-lista");
  if (engajamentoLista) {
    try {
      const ordenados = [...alunos].sort((a, b) => b.carinhos - a.carinhos).slice(0, 10);
      engajamentoLista.innerHTML = ordenados.filter((a) => a.carinhos > 0).map((a, i) => `
        <div class="sala-engajamento-item">
          <span style="font-weight:800;color:var(--accent);min-width:26px;">${i + 1}º</span>
          <img src="${a.foto}" alt="${a.nome}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(a.nome)}&background=random'">
          <div class="sala-engajamento-info"><div class="sala-engajamento-nome">${escaparHTML(a.nome)}</div>
          <div class="sala-engajamento-metricas"><span><i class="fa-solid fa-heart" style="color:#ff6b6b;"></i> ${a.carinhos.toLocaleString("pt-BR")} carinhos</span></div></div>
        </div>`).join("") || '<p class="sala-vazio-msg">Sem dados de engajamento ainda.</p>';
    } catch (e) { console.warn("[sala] erro engajamento:", e); }
  }
  const buscaInput = document.getElementById("sala-busca-aluno");
  if (buscaInput && !buscaInput.dataset.bound) {
    buscaInput.dataset.bound = "1";
    buscaInput.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase().trim();
      document.querySelectorAll("#sala-lista-alunos tr[data-nome]").forEach((tr) => {
        const nome = tr.dataset.nome || "";
        const mat = tr.dataset.mat || "";
        tr.style.display = !q || nome.includes(q) || mat.includes(q) ? "" : "none";
      });
    });
  }

  // 🆕 Botão "Recalcular Cargos"
  const btnRecalcular = document.getElementById("btn-recalcular-cargos");
  if (btnRecalcular && !btnRecalcular.dataset.bound) {
    btnRecalcular.dataset.bound = "1";
    btnRecalcular.addEventListener("click", window.recalcularCargos);
  }

    document.querySelectorAll(".sala-tab").forEach((tab) => {
    if (tab.dataset.bound) return;
    tab.dataset.bound = "1";
    tab.addEventListener("click", () => {
      const alvo = tab.dataset.tab;
      document.querySelectorAll(".sala-tab").forEach((t) => t.classList.remove("ativo"));
      document.querySelectorAll(".sala-tab-content").forEach((c) => c.classList.remove("ativo"));
      tab.classList.add("ativo");
      document.getElementById("sala-tab-" + alvo)?.classList.add("ativo");
    });
  });
}
// ==========================================
// CALCULADORA
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
    elMeta.addEventListener("input", function (e) { if (elMetaValor) elMetaValor.textContent = e.target.value; });
    elMeta.addEventListener("change", function (e) {
      __metaAtual = Number(e.target.value) || 60;
      if (__notasCache.length) renderizarNotas(__notasCache);
      desenharGraficoEvolucao();
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
  const btnNotif = document.getElementById("btn-notificacoes");
  const painelNotif = document.getElementById("painel-notificacoes");
  if (btnNotif && !btnNotif.dataset.bound) {
    btnNotif.dataset.bound = "1";
    btnNotif.addEventListener("click", function (e) {
      e.stopPropagation();
      renderizarPainelNotificacoes();
      painelNotif?.classList.toggle("is-hidden");
    });
  }
  document.getElementById("btn-marcar-lidas")?.addEventListener("click", marcarTodasLidas);
  document.addEventListener("click", function (e) {
    if (!painelNotif || painelNotif.classList.contains("is-hidden")) return;
    if (!e.target.closest("#painel-notificacoes") && !e.target.closest("#btn-notificacoes")) painelNotif.classList.add("is-hidden");
  });
  carregarMetasDisciplinas();
}

// ==========================================
// MENU LATERAL
// ==========================================
function initMenuLateral() {
  const btnMenuLateral = document.getElementById("btn-menu");
  const menuLateral = document.getElementById("menu-lateral");
  const menuLateralOverlay = document.getElementById("menu-lateral-overlay");
  const btnFecharMenu = document.getElementById("btn-fechar-menu");
  function abrirMenuLateral() {
    menuLateral?.classList.add("aberto");
    menuLateralOverlay?.classList.add("aberto");
    menuLateral?.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-aberto");
    btnMenuLateral?.blur();
    setTimeout(() => btnFecharMenu?.focus(), 100);
  }
  function fecharMenuLateral() {
    menuLateral?.classList.remove("aberto");
    menuLateralOverlay?.classList.remove("aberto");
    menuLateral?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-aberto");
    document.getElementById("submenu-idioma")?.classList.remove("aberto");
    document.getElementById("submenu-tema")?.classList.remove("aberto");
    document.getElementById("menu-btn-idioma")?.setAttribute("aria-expanded", "false");
    document.getElementById("menu-btn-tema")?.setAttribute("aria-expanded", "false");
    const btnMenuEl = document.getElementById("btn-menu");
    if (btnMenuEl) btnMenuEl.blur();
  }
  btnMenuLateral?.addEventListener("click", abrirMenuLateral);
  btnFecharMenu?.addEventListener("click", fecharMenuLateral);
  menuLateralOverlay?.addEventListener("click", fecharMenuLateral);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menuLateral?.classList.contains("aberto")) fecharMenuLateral();
  });
  document.querySelectorAll(".menu-lateral-nav .menu-item").forEach((item) => {
    item.addEventListener("click", () => { fecharMenuLateral(); });
  });
  const btnSubmenuIdioma = document.getElementById("menu-btn-idioma");
  const submenuIdioma = document.getElementById("submenu-idioma");
  const btnSubmenuTema = document.getElementById("menu-btn-tema");
  const submenuTema = document.getElementById("submenu-tema");
  btnSubmenuIdioma?.addEventListener("click", (e) => {
    e.stopPropagation();
    const aberto = submenuIdioma?.classList.toggle("aberto");
    btnSubmenuIdioma.setAttribute("aria-expanded", aberto ? "true" : "false");
    submenuTema?.classList.remove("aberto");
    btnSubmenuTema?.setAttribute("aria-expanded", "false");
  });
  btnSubmenuTema?.addEventListener("click", (e) => {
    e.stopPropagation();
    const aberto = submenuTema?.classList.toggle("aberto");
    btnSubmenuTema.setAttribute("aria-expanded", aberto ? "true" : "false");
    submenuIdioma?.classList.remove("aberto");
    btnSubmenuIdioma?.setAttribute("aria-expanded", "false");
    const modoAtual = document.body.classList.contains("light-theme") ? "claro" : "escuro";
    document.querySelectorAll(".submenu-modo").forEach((b) => { b.classList.toggle("ativo", b.dataset.tema === modoAtual); });
  });
  document.querySelectorAll("#submenu-idioma .menu-submenu-item").forEach((btn) => {
    btn.addEventListener("click", () => { trocarIdioma(btn.dataset.idioma); marcarAtivosMenuLateral(); });
  });
  document.querySelectorAll("#submenu-tema .submenu-cor").forEach((btn) => {
    btn.addEventListener("click", () => { aplicarTema(btn.dataset.tema); marcarAtivosMenuLateral(); });
  });
  document.querySelectorAll("#submenu-tema .submenu-modo").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modo = btn.dataset.tema;
      const themeToggleBtnRef = document.getElementById("theme-toggle");
      const themeIconRef = themeToggleBtnRef?.querySelector("i");
      if (modo === "claro") {
        document.body.classList.add("light-theme");
        localStorage.setItem("theme", "light");
        if (themeIconRef) themeIconRef.classList.replace("fa-moon", "fa-sun");
      } else {
        document.body.classList.remove("light-theme");
        localStorage.setItem("theme", "dark");
        if (themeIconRef) themeIconRef.classList.replace("fa-sun", "fa-moon");
      }
      marcarAtivosMenuLateral();
    });
  });
  function marcarAtivosMenuLateral() {
    const idiomaAtual = obterIdiomaAtual();
    document.querySelectorAll("#submenu-idioma .menu-submenu-item").forEach((b) => {
      b.classList.toggle("ativo", b.dataset.idioma === idiomaAtual);
    });
    const temaAtual = obterTemaAtual();
    document.querySelectorAll("#submenu-tema .submenu-cor").forEach((b) => {
      b.classList.toggle("ativo", b.dataset.tema === temaAtual);
    });
    const modoAtual = document.body.classList.contains("light-theme") ? "claro" : "escuro";
    document.querySelectorAll("#submenu-tema .submenu-modo").forEach((b) => {
      b.classList.toggle("ativo", b.dataset.tema === modoAtual);
    });
  }
  marcarAtivosMenuLateral();
  const sections = document.querySelectorAll("section[id]");
  const menuItems = document.querySelectorAll(".menu-lateral-nav .menu-item");
  if (menuItems.length > 0) {
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        let current = "";
        sections.forEach((section) => {
          const sectionTop = section.offsetTop;
          if (pageYOffset >= sectionTop - 250) current = section.getAttribute("id");
        });
        menuItems.forEach((item) => {
          item.classList.remove("active");
          const href = item.getAttribute("href") || "";
          if (href.startsWith("#") && href.substring(1) === current) item.classList.add("active");
        });
        ticking = false;
      });
    }, { passive: true });
  }
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
  aplicarTema(obterTemaAtual());
  aplicarTraducoes();
  filtroRecadoTexto = "";
  filtroPerfilTexto = "";
  inicializarModalEditarPerfil();
  initCalculadoraNotas();
  renderizarLegendaCalendario();
  initMenuLateral();
  inicializarFiltrosConquistas();
  inicializarBotoesConquistasVisiveis();

  window.addEventListener("mascote:cliques", () => {
    meusCliquesMascote = window.xpCore?.estaPronto?.()
      ? window.xpCore.obterCliquesMascote()
      : parseInt(localStorage.getItem("xp_cliques_mascote") || "0", 10);
    checarConquistasAutomaticas();
  });

  window.addEventListener("xpCore:pronto", (e) => {
    if (!e.detail || e.detail.anonimo) return;
    console.log("[login] xpCore pronto, sincronizando UI...");
    if (window.usuarioLogado?.matricula) {
      meuXP = window.xpCore.obterXP();
      minhaStreak = window.xpCore.obterStreak();
      meusCliquesMascote = window.xpCore.obterCliquesMascote();
      minhasConquistas = window.xpCore.obterConquistas();
      if (typeof renderizarPainelXP === "function") renderizarPainelXP();
      if (typeof renderizarConquistas === "function") renderizarConquistas();
      if (typeof checarConquistasAutomaticas === "function") checarConquistasAutomaticas();
    }
  }, { once: true });

  document.querySelectorAll("#menu-idioma .dropdown-item").forEach(function (btn) {
    btn.addEventListener("click", function () { trocarIdioma(btn.dataset.idioma); });
  });
  document.querySelectorAll("#menu-tema .dropdown-item").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var tema = btn.dataset.tema;
      var themeToggleBtnRef = document.getElementById("theme-toggle");
      var themeIconRef = themeToggleBtnRef?.querySelector("i");
      if (tema === "claro") {
        document.body.classList.add("light-theme");
        localStorage.setItem("theme", "light");
        if (themeIconRef) themeIconRef.classList.replace("fa-moon", "fa-sun");
        return;
      }
      if (tema === "escuro") {
        document.body.classList.remove("light-theme");
        localStorage.setItem("theme", "dark");
        if (themeIconRef) themeIconRef.classList.replace("fa-sun", "fa-moon");
        return;
      }
      aplicarTema(tema);
    });
  });
  document.getElementById("btn-instalar-app")?.addEventListener("click", instalarPWA);
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
    document.querySelectorAll(".is-authenticated").forEach(function (el) { el.classList.remove("is-hidden"); });
    carregarPeriodosNotas();
    carregarCoresGoogle();  // 🆕 carrega as cores do Google Calendar
        var calendarEl = document.getElementById("calendar");
    if (calendarEl && typeof FullCalendar !== "undefined") {
      // 🆕 Espera as cores carregarem ANTES de renderizar o calendário
      carregarCoresGoogle().then(function () {
        var calendar = new FullCalendar.Calendar(calendarEl, {
          initialView: "dayGridMonth",
          locale: obterIdiomaAtual(),
          initialDate: "2026-09-01",
          validRange: { start: "2026-09-01", end: "2026-12-31" },
          timeZone: "America/Fortaleza",
          googleCalendarApiKey: "AIzaSyB9XFKFwtZNQJrN2Kh7UPZxraPXEwqFytw",
          events: "acb20a08d58749d48304dbda5c87bfb7f0671483ecc4ed942683ad5a1307e78d@group.calendar.google.com",
          eventDidMount: function (info) {
            pintarElementoEvento(info.el, info.event.title, info.event.id);
          },
          eventsSet: function (eventos) {
            renderizarProximosEventos(eventos);
            setTimeout(function () {
              document.querySelectorAll(".fc-event").forEach(function (el) {
                var texto = el.innerText || "";
                var ev = eventos.find(function (e) { return (e.title || "") === texto; });
                var id = ev ? ev.id : null;
                pintarElementoEvento(el, texto, id);
              });
            }, 50);
          },
          eventClick: function (arg) {
            if (arg.event.url) {
              window.open(arg.event.url, "_blank");
              arg.jsEvent.preventDefault();
            }
          },
        });
        calendar.render();

        var observer = new MutationObserver(function () {
          var eventos = calendar.getEvents();
          document.querySelectorAll(".fc-event").forEach(function (el) {
            var texto = el.innerText || "";
            var ev = eventos.find(function (e) { return (e.title || "") === texto; });
            var id = ev ? ev.id : null;
            var cor = corDoEvento(texto, id);
            if (el.style.getPropertyValue("background-color") !== cor) {
              pintarElementoEvento(el, texto, id);
            }
          });
        });
        observer.observe(calendarEl, { childList: true, subtree: true, attributes: true, attributeFilter: ["style"] });

        // 🆕 Guarda o calendar numa variável global (se quiser usar em outro lugar)
        window.__calendar = calendar;
      });
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
      try {
        localStorage.setItem("matricula_suap", matriculaSuap);
        document.cookie = `matricula=${matriculaSuap}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
      } catch (e) {}

      if (matriculaSuap && matriculaSuap !== "Matrícula não disponível") {
        const perfilAlunoRef = ref(db, "perfis_alunos/" + matriculaSuap);
        get(perfilAlunoRef).then((snap) => {
          const dadosExistentes = snap.val() || {};
          const payload = { nomeCompleto: nomeCompletoSuap, matricula: matriculaSuap, ultimoAcesso: Date.now() };
          if (!dadosExistentes.nome || !String(dadosExistentes.nome).trim()) payload.nome = nomeParaExibicao(nomeSuap);
          if (!dadosExistentes.foto || !String(dadosExistentes.foto).trim()) payload.foto = fotoUrl;
          chamarAPI("/api/perfil?tipo=update", {
            nome: payload.nome,
            nomeCompleto: payload.nomeCompleto,
            foto: payload.foto,
          }).then(() => { window.carregarPerfilUsuario(matriculaSuap); }).catch((e) => {
            console.warn("[perfil] erro na API, aplicando local:", e);
            window.carregarPerfilUsuario(matriculaSuap);
          });
        });
        carregarMetasDisciplinas();
        gerarNotificacoesRecados();
        carregarPainelXP();
        atualizarStreakLogin();
        carregarCargos();  // 🆕 carrega o cargo do aluno
        if (MATRICULAS_ADMIN.includes(matriculaSuap)) {
          setTimeout(() => {
            const secaoSala = document.getElementById("sala-professores");
            if (secaoSala) secaoSala.classList.remove("is-admin-hidden");
            const menuItemSala = document.getElementById("menu-item-sala");
            if (menuItemSala) menuItemSala.classList.remove("is-hidden");
            carregarSalaProfessores();
          }, 1000);
        }
      }
      const inputRecadoNome = document.getElementById("recado-nome");
      if (inputRecadoNome) { inputRecadoNome.style.display = "none"; inputRecadoNome.removeAttribute("required"); }
      window.renderizarMural();
      window.renderizarPerfis();
    });
  } else {
    document.querySelectorAll(".is-anonymous").forEach(function (el) { el.classList.remove("is-hidden"); });
  }
});
