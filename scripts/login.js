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
const AVATARES_MASCOTE = [
  { id: "padrao", emoji: "🐾", nome: "Padrão", gratis: true },
  { id: "alien", emoji: "👽", nome: "Alien", gratis: true },
  { id: "pirata", emoji: "🏴‍☠️", nome: "Pirata", gratis: true },
  { id: "genio", emoji: "🧠", nome: "Gênio", gratis: true },
  { id: "simpson", emoji: "🍩", nome: "Simpson", gratis: false, cliquesNecessarios: 1500 },
  { id: "mafioso", emoji: "🕴️", nome: "Mafioso", gratis: false, cliquesNecessarios: 3000 },
];

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
// 🎖️ CONQUISTAS (com ícones Font Awesome)
// ==========================================
const CONQUISTAS = [
  { id: "primeiro_carinho", icone: "fa-solid fa-hand-pointer", emoji: "🎯", nome: "Primeiro Carinho", desc: "Deu seu primeiro carinho no mascote", raridade: "comum" },
  { id: "estiloso", icone: "fa-solid fa-palette", emoji: "🎨", nome: "Estiloso", desc: "Mudou o avatar do mascote", raridade: "comum" },
  { id: "comunicador", icone: "fa-solid fa-comments", emoji: "💬", nome: "Comunicador", desc: "Postou 10 recados", raridade: "comum" },
  { id: "cientista", icone: "fa-solid fa-flask", emoji: "🧪", nome: "Cientista", desc: "Usou o simulador 10 vezes", raridade: "comum" },
  { id: "carinhoso", icone: "fa-solid fa-heart", emoji: "❤️", nome: "Carinhoso", desc: "Deu 100 carinhos no mascote", raridade: "raro" },
  { id: "nota_100", icone: "fa-solid fa-graduation-cap", emoji: "🎓", nome: "Nota 100", desc: "Tirou 100 em alguma matéria", raridade: "raro" },
  { id: "streak_7", icone: "fa-solid fa-fire", emoji: "🔥", nome: "Streak 7", desc: "Logou 7 dias seguidos", raridade: "raro" },
  { id: "apaixonado", icone: "fa-solid fa-heart-pulse", emoji: "💖", nome: "Apaixonado", desc: "Deu 500 carinhos no mascote", raridade: "epico" },
  { id: "nota_maxima", icone: "fa-solid fa-trophy", emoji: "🏆", nome: "Nota Máxima", desc: "Média geral ≥ 90", raridade: "epico" },
  { id: "simpson_unlocked", icone: "fa-solid fa-cookie-bite", emoji: "🍩", nome: "Simpson Chegou", desc: "Desbloqueou a skin do Simpson (1.500 cliques)", raridade: "epico" },
  { id: "streak_30", icone: "fa-solid fa-star", emoji: "⭐", nome: "Streak 30", desc: "Logou 30 dias seguidos", raridade: "lendario" },
  { id: "mafioso_unlocked", icone: "fa-solid fa-user-tie", emoji: "🕴️", nome: "Mafioso no Pedaço", desc: "Desbloqueou a skin Mafioso (3.000 cliques)", raridade: "lendario" },
];

// Recompensas de XP
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
// 📋 DICIONÁRIO DE TRADUÇÕES
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
    proxima_skin: "Próxima skin:", skin_bloqueada: "Bloqueada",
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
    proxima_skin: "Next skin:", skin_bloqueada: "Locked",
    conquistas_visiveis_titulo: "Achievements on profile",
    conquistas_visiveis_desc: "Choose which achievements others will see on your profile. No selection = shows all.",
    nav_inicio: "Home", nav_inicio_desc: "Homepage", menu: "Menu",
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
    proxima_skin: "Próxima skin:", skin_bloqueada: "Bloqueada",
    conquistas_visiveis_titulo: "Logros en el perfil",
    conquistas_visiveis_desc: "Elige qué logros verán los demás en tu perfil. Sin selección = muestra todos.",
    nav_inicio: "Inicio", nav_inicio_desc: "Página de inicio", menu: "Menú",
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
  try {
    const refXP = ref(db, "usuarios_xp/" + mat);
    const snap = await get(refXP);
    const dados = snap.val() || {};
    const xpAntes = Number(dados.xp) || 0;
    const xpDepois = xpAntes + quantidade;
    const nivelAntes = calcularNivel(xpAntes);
    const nivelDepois = calcularNivel(xpDepois);
    await update(refXP, { xp: xpDepois });
    if (nivelDepois.nivel > nivelAntes.nivel) {
      if (typeof exibirToast === "function") {
        exibirToast(`🎉 SUBIU DE NÍVEL! ${nivelDepois.nome} (Nv ${nivelDepois.nivel})`, "sucesso");
      }
    }
    meuXP = xpDepois;
    renderizarPainelXP();
  } catch (e) {
    console.warn("[XP] Erro:", e);
  }
}

async function desbloquearConquista(idConquista) {
  const mat = window.usuarioLogado.matricula;
  if (!mat || mat === "Matrícula não disponível") return;
  try {
    const refConquista = ref(db, `usuarios_xp/${mat}/conquistas/${idConquista}`);
    const snap = await get(refConquista);
    if (snap.exists()) return;
    await update(refConquista, { desbloqueadaEm: Date.now() });
    const c = CONQUISTAS.find(x => x.id === idConquista);
    if (c && typeof exibirToast === "function") {
      exibirToast(`${c.emoji} CONQUISTA: ${c.nome}!`, "sucesso");
    }
    try {
      const refXP = ref(db, "usuarios_xp/" + mat);
      const snapXP = await get(refXP);
      const dadosXP = snapXP.val() || {};
      const xpAntes = Number(dadosXP.xp) || 0;
      const xpDepois = xpAntes + XP_RECOMPENSAS.conquista;
      await update(refXP, { xp: xpDepois });
      const nivelAntes = calcularNivel(xpAntes);
      const nivelDepois = calcularNivel(xpDepois);
      if (nivelDepois.nivel > nivelAntes.nivel) {
        if (typeof exibirToast === "function") {
          exibirToast(`🎉 SUBIU DE NÍVEL! ${nivelDepois.nome} (Nv ${nivelDepois.nivel})`, "sucesso");
        }
      }
      meuXP = xpDepois;
      renderizarPainelXP();
    } catch (e) {
      console.warn("[conquista XP] erro:", e);
    }
    minhasConquistas[idConquista] = { desbloqueadaEm: Date.now() };
    renderizarConquistas();
  } catch (e) {
    console.warn("[conquista] Erro:", e);
  }
}

async function atualizarStreakLogin() {
  const mat = window.usuarioLogado.matricula;
  if (!mat || mat === "Matrícula não disponível") return;
  try {
    const refXP = ref(db, "usuarios_xp/" + mat);
    const snap = await get(refXP);
    const dados = snap.val() || {};
    const hoje = new Date().toISOString().slice(0, 10);
    const ultimaVisita = dados.ultimaVisita || "";
    let streak = Number(dados.streak) || 0;
    if (ultimaVisita === hoje) return;
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    const ontemStr = ontem.toISOString().slice(0, 10);
    if (ultimaVisita === ontemStr) streak += 1;
    else streak = 1;
    await update(refXP, { streak, ultimaVisita: hoje });
    await adicionarXP(XP_RECOMPENSAS.login_diario, "login_diario");
    if (streak >= 7) desbloquearConquista("streak_7");
    if (streak >= 30) desbloquearConquista("streak_30");
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
// MIGRAÇÃO DE XP LOCAL → FIREBASE
// ==========================================
async function migrarXPLocalParaFirebase(mat) {
  try {
    const xpLocal = parseInt(localStorage.getItem("xp_total") || "0", 10);
    if (xpLocal <= 0) return;
    const refXP = ref(db, "usuarios_xp/" + mat);
    const snap = await get(refXP);
    const dados = snap.val() || {};
    const xpAtual = Number(dados.xp) || 0;
    await update(refXP, { xp: xpAtual + xpLocal });
    localStorage.setItem("xp_total", "0");
  } catch (e) {
    console.warn("[XP migração] erro:", e);
  }
}

// ==========================================
// PAINEL DE XP E CONQUISTAS
// ==========================================
async function carregarPainelXP() {
  const mat = window.usuarioLogado.matricula;
  if (!mat || mat === "Matrícula não disponível") return;
  try {
    await migrarXPLocalParaFirebase(mat);
    const refXP = ref(db, "usuarios_xp/" + mat);
    const snap = await get(refXP);
    const dados = snap.val() || {};
    meuXP = Number(dados.xp) || 0;
    minhaStreak = Number(dados.streak) || 0;
    minhasConquistas = dados.conquistas || {};
    meusCliquesMascote = parseInt(localStorage.getItem("xp_cliques_mascote") || "0", 10);
    renderizarPainelXP();
    renderizarConquistas();
    const avatarSalvo = dados.mascoteAvatar || localStorage.getItem("skin_ativa") || "padrao";
    avatarSelecionado = avatarSalvo;
    if (meusCliquesMascote >= 1500) await desbloquearConquista("simpson_unlocked");
    if (meusCliquesMascote >= 3000) await desbloquearConquista("mafioso_unlocked");
    if (meusCliquesMascote >= 100) await desbloquearConquista("carinhoso");
    if (meusCliquesMascote >= 500) await desbloquearConquista("apaixonado");
    if (meusCliquesMascote >= 1) await desbloquearConquista("primeiro_carinho");
  } catch (e) {
    console.warn("[painelXP] Erro:", e);
    meuXP = parseInt(localStorage.getItem("xp_total") || "0", 10);
    minhaStreak = parseInt(localStorage.getItem("xp_streak") || "0", 10);
    meusCliquesMascote = parseInt(localStorage.getItem("xp_cliques_mascote") || "0", 10);
    renderizarPainelXP();
    renderizarConquistas();
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
      <div
        class="conquista-visivel-item ${estaSelecionada ? "selecionada" : ""} ${raridade} ${!desbloqueada ? "bloqueada" : ""}"
        data-id="${c.id}"
        title="${escaparHTML(c.nome)} — ${escaparHTML(c.desc)}${!desbloqueada ? " (Bloqueada)" : ""}"
      >
        <i class="${c.icone}"></i>
      </div>`;
  }).join("");

  grid.querySelectorAll(".conquista-visivel-item:not(.bloqueada)").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.dataset.id;
      if (conquistasVisiveisSelecionadas === null) {
        conquistasVisiveisSelecionadas = CONQUISTAS
          .filter((c) => !!minhasConquistas[c.id])
          .map((c) => c.id);
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
      .filter((c) => !!minhasConquistas[c.id])
      .map((c) => c.id);
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
const REGRAS_CORES_CALENDARIO = [
  { regex: /prova|avalia|exame|teste/i, cor: "#ff4757", textoKey: "cal_provas" },
  { regex: /trabalho|projeto|entrega|lista|seminario|seminário/i, cor: "#f59e0b", textoKey: "cal_trabalhos" },
  { regex: /feriado|recesso|f[eé]rias|ponto facultativo/i, cor: "#10b981", textoKey: "cal_feriados" },
  { regex: /reuni[aã]o|aula|encontro|palestra/i, cor: "#7c3aed", textoKey: "cal_reunioes" },
  { regex: /jogo|esporte|campeonato|torneio/i, cor: "#06b6d4", textoKey: "cal_esportes" },
  { regex: /festa|evento|apresenta|show/i, cor: "#ec4899", textoKey: "cal_festas" },
];
const COR_PADRAO_CALENDARIO = { cor: "#8b5edd", textoKey: "cal_outros" };

function corDoEvento(titulo) {
  var t2 = String(titulo || "").toLowerCase();
  for (var i = 0; i < REGRAS_CORES_CALENDARIO.length; i++) {
    if (REGRAS_CORES_CALENDARIO[i].regex.test(t2)) return REGRAS_CORES_CALENDARIO[i].cor;
  }
  return COR_PADRAO_CALENDARIO.cor;
}

function renderizarLegendaCalendario() {
  var container = document.getElementById("calendario-legenda");
  if (!container) return;
  var todas = REGRAS_CORES_CALENDARIO.concat([COR_PADRAO_CALENDARIO]);
  container.innerHTML = todas.map(function (item) {
    return `<div class="legenda-item"><span class="legenda-cor" style="background:${item.cor}"></span><span class="legenda-texto">${escaparHTML(t(item.textoKey))}</span></div>`;
  }).join("");
}

// ==========================================
// 0. FIREBASE
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

const app = initializeApp(firebaseConfig);
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
const AVATARES_MASCOTE = [
  { id: "padrao", emoji: "🐾", nome: "Padrão", gratis: true },
  { id: "alien", emoji: "👽", nome: "Alien", gratis: true },
  { id: "pirata", emoji: "🏴‍☠️", nome: "Pirata", gratis: true },
  { id: "genio", emoji: "🧠", nome: "Gênio", gratis: true },
  { id: "simpson", emoji: "🍩", nome: "Simpson", gratis: false, cliquesNecessarios: 1500 },
  { id: "mafioso", emoji: "🕴️", nome: "Mafioso", gratis: false, cliquesNecessarios: 3000 },
];

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
// 🎖️ CONQUISTAS (com ícones Font Awesome)
// ==========================================
const CONQUISTAS = [
  { id: "primeiro_carinho", icone: "fa-solid fa-hand-pointer", emoji: "🎯", nome: "Primeiro Carinho", desc: "Deu seu primeiro carinho no mascote", raridade: "comum" },
  { id: "estiloso", icone: "fa-solid fa-palette", emoji: "🎨", nome: "Estiloso", desc: "Mudou o avatar do mascote", raridade: "comum" },
  { id: "comunicador", icone: "fa-solid fa-comments", emoji: "💬", nome: "Comunicador", desc: "Postou 10 recados", raridade: "comum" },
  { id: "cientista", icone: "fa-solid fa-flask", emoji: "🧪", nome: "Cientista", desc: "Usou o simulador 10 vezes", raridade: "comum" },
  { id: "carinhoso", icone: "fa-solid fa-heart", emoji: "❤️", nome: "Carinhoso", desc: "Deu 100 carinhos no mascote", raridade: "raro" },
  { id: "nota_100", icone: "fa-solid fa-graduation-cap", emoji: "🎓", nome: "Nota 100", desc: "Tirou 100 em alguma matéria", raridade: "raro" },
  { id: "streak_7", icone: "fa-solid fa-fire", emoji: "🔥", nome: "Streak 7", desc: "Logou 7 dias seguidos", raridade: "raro" },
  { id: "apaixonado", icone: "fa-solid fa-heart-pulse", emoji: "💖", nome: "Apaixonado", desc: "Deu 500 carinhos no mascote", raridade: "epico" },
  { id: "nota_maxima", icone: "fa-solid fa-trophy", emoji: "🏆", nome: "Nota Máxima", desc: "Média geral ≥ 90", raridade: "epico" },
  { id: "simpson_unlocked", icone: "fa-solid fa-cookie-bite", emoji: "🍩", nome: "Simpson Chegou", desc: "Desbloqueou a skin do Simpson (1.500 cliques)", raridade: "epico" },
  { id: "streak_30", icone: "fa-solid fa-star", emoji: "⭐", nome: "Streak 30", desc: "Logou 30 dias seguidos", raridade: "lendario" },
  { id: "mafioso_unlocked", icone: "fa-solid fa-user-tie", emoji: "🕴️", nome: "Mafioso no Pedaço", desc: "Desbloqueou a skin Mafioso (3.000 cliques)", raridade: "lendario" },
];

// Recompensas de XP
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
// 📋 DICIONÁRIO DE TRADUÇÕES
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
    proxima_skin: "Próxima skin:", skin_bloqueada: "Bloqueada",
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
    proxima_skin: "Next skin:", skin_bloqueada: "Locked",
    conquistas_visiveis_titulo: "Achievements on profile",
    conquistas_visiveis_desc: "Choose which achievements others will see on your profile. No selection = shows all.",
    nav_inicio: "Home", nav_inicio_desc: "Homepage", menu: "Menu",
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
    proxima_skin: "Próxima skin:", skin_bloqueada: "Bloqueada",
    conquistas_visiveis_titulo: "Logros en el perfil",
    conquistas_visiveis_desc: "Elige qué logros verán los demás en tu perfil. Sin selección = muestra todos.",
    nav_inicio: "Inicio", nav_inicio_desc: "Página de inicio", menu: "Menú",
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
  try {
    const refXP = ref(db, "usuarios_xp/" + mat);
    const snap = await get(refXP);
    const dados = snap.val() || {};
    const xpAntes = Number(dados.xp) || 0;
    const xpDepois = xpAntes + quantidade;
    const nivelAntes = calcularNivel(xpAntes);
    const nivelDepois = calcularNivel(xpDepois);
    await update(refXP, { xp: xpDepois });
    if (nivelDepois.nivel > nivelAntes.nivel) {
      if (typeof exibirToast === "function") {
        exibirToast(`🎉 SUBIU DE NÍVEL! ${nivelDepois.nome} (Nv ${nivelDepois.nivel})`, "sucesso");
      }
    }
    meuXP = xpDepois;
    renderizarPainelXP();
  } catch (e) {
    console.warn("[XP] Erro:", e);
  }
}

async function desbloquearConquista(idConquista) {
  const mat = window.usuarioLogado.matricula;
  if (!mat || mat === "Matrícula não disponível") return;
  try {
    const refConquista = ref(db, `usuarios_xp/${mat}/conquistas/${idConquista}`);
    const snap = await get(refConquista);
    if (snap.exists()) return;
    await update(refConquista, { desbloqueadaEm: Date.now() });
    const c = CONQUISTAS.find(x => x.id === idConquista);
    if (c && typeof exibirToast === "function") {
      exibirToast(`${c.emoji} CONQUISTA: ${c.nome}!`, "sucesso");
    }
    try {
      const refXP = ref(db, "usuarios_xp/" + mat);
      const snapXP = await get(refXP);
      const dadosXP = snapXP.val() || {};
      const xpAntes = Number(dadosXP.xp) || 0;
      const xpDepois = xpAntes + XP_RECOMPENSAS.conquista;
      await update(refXP, { xp: xpDepois });
      const nivelAntes = calcularNivel(xpAntes);
      const nivelDepois = calcularNivel(xpDepois);
      if (nivelDepois.nivel > nivelAntes.nivel) {
        if (typeof exibirToast === "function") {
          exibirToast(`🎉 SUBIU DE NÍVEL! ${nivelDepois.nome} (Nv ${nivelDepois.nivel})`, "sucesso");
        }
      }
      meuXP = xpDepois;
      renderizarPainelXP();
    } catch (e) {
      console.warn("[conquista XP] erro:", e);
    }
    minhasConquistas[idConquista] = { desbloqueadaEm: Date.now() };
    renderizarConquistas();
  } catch (e) {
    console.warn("[conquista] Erro:", e);
  }
}

async function atualizarStreakLogin() {
  const mat = window.usuarioLogado.matricula;
  if (!mat || mat === "Matrícula não disponível") return;
  try {
    const refXP = ref(db, "usuarios_xp/" + mat);
    const snap = await get(refXP);
    const dados = snap.val() || {};
    const hoje = new Date().toISOString().slice(0, 10);
    const ultimaVisita = dados.ultimaVisita || "";
    let streak = Number(dados.streak) || 0;
    if (ultimaVisita === hoje) return;
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    const ontemStr = ontem.toISOString().slice(0, 10);
    if (ultimaVisita === ontemStr) streak += 1;
    else streak = 1;
    await update(refXP, { streak, ultimaVisita: hoje });
    await adicionarXP(XP_RECOMPENSAS.login_diario, "login_diario");
    if (streak >= 7) desbloquearConquista("streak_7");
    if (streak >= 30) desbloquearConquista("streak_30");
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
// MIGRAÇÃO DE XP LOCAL → FIREBASE
// ==========================================
async function migrarXPLocalParaFirebase(mat) {
  try {
    const xpLocal = parseInt(localStorage.getItem("xp_total") || "0", 10);
    if (xpLocal <= 0) return;
    const refXP = ref(db, "usuarios_xp/" + mat);
    const snap = await get(refXP);
    const dados = snap.val() || {};
    const xpAtual = Number(dados.xp) || 0;
    await update(refXP, { xp: xpAtual + xpLocal });
    localStorage.setItem("xp_total", "0");
  } catch (e) {
    console.warn("[XP migração] erro:", e);
  }
}

// ==========================================
// PAINEL DE XP E CONQUISTAS
// ==========================================
async function carregarPainelXP() {
  const mat = window.usuarioLogado.matricula;
  if (!mat || mat === "Matrícula não disponível") return;
  try {
    await migrarXPLocalParaFirebase(mat);
    const refXP = ref(db, "usuarios_xp/" + mat);
    const snap = await get(refXP);
    const dados = snap.val() || {};
    meuXP = Number(dados.xp) || 0;
    minhaStreak = Number(dados.streak) || 0;
    minhasConquistas = dados.conquistas || {};
    meusCliquesMascote = parseInt(localStorage.getItem("xp_cliques_mascote") || "0", 10);
    renderizarPainelXP();
    renderizarConquistas();
    const avatarSalvo = dados.mascoteAvatar || localStorage.getItem("skin_ativa") || "padrao";
    avatarSelecionado = avatarSalvo;
    if (meusCliquesMascote >= 1500) await desbloquearConquista("simpson_unlocked");
    if (meusCliquesMascote >= 3000) await desbloquearConquista("mafioso_unlocked");
    if (meusCliquesMascote >= 100) await desbloquearConquista("carinhoso");
    if (meusCliquesMascote >= 500) await desbloquearConquista("apaixonado");
    if (meusCliquesMascote >= 1) await desbloquearConquista("primeiro_carinho");
  } catch (e) {
    console.warn("[painelXP] Erro:", e);
    meuXP = parseInt(localStorage.getItem("xp_total") || "0", 10);
    minhaStreak = parseInt(localStorage.getItem("xp_streak") || "0", 10);
    meusCliquesMascote = parseInt(localStorage.getItem("xp_cliques_mascote") || "0", 10);
    renderizarPainelXP();
    renderizarConquistas();
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
      <div
        class="conquista-visivel-item ${estaSelecionada ? "selecionada" : ""} ${raridade} ${!desbloqueada ? "bloqueada" : ""}"
        data-id="${c.id}"
        title="${escaparHTML(c.nome)} — ${escaparHTML(c.desc)}${!desbloqueada ? " (Bloqueada)" : ""}"
      >
        <i class="${c.icone}"></i>
      </div>`;
  }).join("");

  grid.querySelectorAll(".conquista-visivel-item:not(.bloqueada)").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.dataset.id;
      if (conquistasVisiveisSelecionadas === null) {
        conquistasVisiveisSelecionadas = CONQUISTAS
          .filter((c) => !!minhasConquistas[c.id])
          .map((c) => c.id);
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
      .filter((c) => !!minhasConquistas[c.id])
      .map((c) => c.id);
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
const REGRAS_CORES_CALENDARIO = [
  { regex: /prova|avalia|exame|teste/i, cor: "#ff4757", textoKey: "cal_provas" },
  { regex: /trabalho|projeto|entrega|lista|seminario|seminário/i, cor: "#f59e0b", textoKey: "cal_trabalhos" },
  { regex: /feriado|recesso|f[eé]rias|ponto facultativo/i, cor: "#10b981", textoKey: "cal_feriados" },
  { regex: /reuni[aã]o|aula|encontro|palestra/i, cor: "#7c3aed", textoKey: "cal_reunioes" },
  { regex: /jogo|esporte|campeonato|torneio/i, cor: "#06b6d4", textoKey: "cal_esportes" },
  { regex: /festa|evento|apresenta|show/i, cor: "#ec4899", textoKey: "cal_festas" },
];
const COR_PADRAO_CALENDARIO = { cor: "#8b5edd", textoKey: "cal_outros" };

function corDoEvento(titulo) {
  var t2 = String(titulo || "").toLowerCase();
  for (var i = 0; i < REGRAS_CORES_CALENDARIO.length; i++) {
    if (REGRAS_CORES_CALENDARIO[i].regex.test(t2)) return REGRAS_CORES_CALENDARIO[i].cor;
  }
  return COR_PADRAO_CALENDARIO.cor;
}

function renderizarLegendaCalendario() {
  var container = document.getElementById("calendario-legenda");
  if (!container) return;
  var todas = REGRAS_CORES_CALENDARIO.concat([COR_PADRAO_CALENDARIO]);
  container.innerHTML = todas.map(function (item) {
    return `<div class="legenda-item"><span class="legenda-cor" style="background:${item.cor}"></span><span class="legenda-texto">${escaparHTML(t(item.textoKey))}</span></div>`;
  }).join("");
}

// ==========================================
// 0. FIREBASE
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

const app = initializeApp(firebaseConfig);
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