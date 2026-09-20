// ==========================================
// CONFIGURAÇÕES DO SUAP
// ==========================================
var CLIENT_ID = "St1KggSNx1eA8FnNe5Bi8jfM7MODYSFZGUaj8cpf";
var REDIRECT_URI = "https://infoweb-2v-devlopers.vercel.app/login.html";
var SUAP_URL = "https://suap.ifrn.edu.br";
var SCOPE = "identificacao email documentos_pessoais";

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

const AVATARES_MASCOTE = [
  { id: "padrao",  nome: "Padrão",  arquivo: "img/MascotePadrao.png",  gratis: true, admin: false },
  { id: "alien",   nome: "Alien",   arquivo: "img/MascoteAlien.png",   gratis: true, admin: false },
  { id: "pirata",  nome: "Pirata",  arquivo: "img/MascotePirata.png",  gratis: true, admin: false },
  { id: "genio",   nome: "Gênio",   arquivo: "img/MascoteGenio.png",   gratis: true, admin: false },
  { id: "simpson", nome: "Simpson", arquivo: "img/MascoteSimpson.png", gratis: false, cliquesNecessarios: 1500, admin: false },
  { id: "mafioso", nome: "Mafioso", arquivo: "img/MascoteMafioso.png", gratis: false, cliquesNecessarios: 3000, admin: false },
  { id: "admin",   nome: "Admin",   arquivo: "img/MascoteAdmin.png",   gratis: false, apenasAdmin: true, admin: true },
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
// FIREBASE
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getDatabase, ref, onValue, push, update, remove, get } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA_wDDRCRJL_WviT6FBorz8dhnHe0-pI8s",
  authDomain: "muralturmanormal.firebaseapp.com",
  projectId: "muralturmanormal",
  storageBucket: "muralturmanormal.firebasestorage.app",
  messagingSenderId: "993749229757",
  appId: "1:993749229757:web:ec87d8ca3b8950d70d57d4",
};

const app = initializeApp(firebaseConfig, "loginApp");
const db = getDatabase(app);
const recadosRef = ref(db, "mural_recados");
const perfisRef = ref(db, "perfis_alunos");

const MATRICULAS_ADMIN = ["20261101110002"];
const ADMIN_MATRICULAS_SALA = MATRICULAS_ADMIN;
let __salaDadosCarregados = false;

window.usuarioLogado = { nome: "", matricula: "", foto: "", fotoOriginal: "" };
let bancoDeRecados = [];
let bancoDePerfis = [];
let filtroRecadoTexto = "";
let filtroPerfilTexto = "";