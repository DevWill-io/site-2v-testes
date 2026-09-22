// ==========================================
// 🎨 GCAL — Helper do Google Calendar OAuth
// ==========================================
// Centraliza:
//   - URL do OAuth (pra redirecionar pro Google)
//   - Troca de código por tokens
//   - Refresh de access_token (com refresh_token)
//   - Chamada à API do Google Calendar
//
// Usa PKCE + client_secret (server-side, seguro)
// ==========================================

// ==========================================
// CONSTANTES
// ==========================================
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

// Escopo: só leitura do calendário
export const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
].join(" ");

// ==========================================
// VALIDAÇÃO DE ENV VARS
// ==========================================
function validarEnv() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  const faltando = [];
  if (!clientId) faltando.push("GOOGLE_CLIENT_ID");
  if (!clientSecret) faltando.push("GOOGLE_CLIENT_SECRET");
  if (!redirectUri) faltando.push("GOOGLE_REDIRECT_URI");

  if (faltando.length > 0) {
    throw new Error(`[gcal] Env vars faltando: ${faltando.join(", ")}`);
  }

  return { clientId, clientSecret, redirectUri };
}

// ==========================================
// GERA STATE ALEATÓRIO (anti-CSRF)
// ==========================================
export function gerarState() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// ==========================================
// MONTA URL DE AUTORIZAÇÃO
// ==========================================
export function montarUrlAutorizacao(state) {
  const { clientId, redirectUri } = validarEnv();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",     // 🆕 necessário pra receber refresh_token
    prompt: "consent",           // 🆕 força tela de consentimento (garante refresh_token)
    state: state,
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

// ==========================================
// TROCA CÓDIGO POR TOKENS
// ==========================================
export async function trocarCodigoPorTokens(code) {
  const { clientId, clientSecret, redirectUri } = validarEnv();

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const dados = await res.json();

  if (!res.ok) {
    throw new Error(
      `[gcal] Erro ao trocar código: ${dados.error || res.status} - ${dados.error_description || ""}`
    );
  }

  return {
    access_token: dados.access_token,
    refresh_token: dados.refresh_token,
    expires_in: dados.expires_in,
    scope: dados.scope,
    token_type: dados.token_type,
  };
}

// ==========================================
// RENOVA ACCESS TOKEN (com refresh_token)
// ==========================================
export async function renovarAccessToken(refreshToken) {
  const { clientId, clientSecret } = validarEnv();

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });

  const dados = await res.json();

  if (!res.ok) {
    throw new Error(
      `[gcal] Erro ao renovar token: ${dados.error || res.status} - ${dados.error_description || ""}`
    );
  }

  return {
    access_token: dados.access_token,
    expires_in: dados.expires_in,
  };
}

// ==========================================
// LISTA EVENTOS DE UM CALENDÁRIO
// ==========================================
// Retorna eventos entre `tempoMin` e `tempoMax` (ISO strings)
// Retorna array com { id, summary, start, end, colorId, backgroundColor }
export async function listarEventos(accessToken, calendarId, tempoMin, tempoMax) {
  const params = new URLSearchParams({
    timeMin: tempoMin,
    timeMax: tempoMax,
    singleEvents: "true",     // expande eventos recorrentes
    orderBy: "startTime",
    maxResults: "250",
  });

  const url = `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events?${params}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`[gcal] Erro ao listar eventos: ${res.status} - ${txt.slice(0, 200)}`);
  }

  const dados = await res.json();
  return dados.items || [];
}

// ==========================================
// MAPEAMENTO colorId → hex
// ==========================================
// Google Calendar usa colorId (1-11). Cada um tem um hex fixo.
// Referência: https://developers.google.com/calendar/api/v3/reference/colors
export const CORES_GOOGLE = {
  "1":  "#7986CB", // Lavanda
  "2":  "#33B679", // Sálvia
  "3":  "#8E24AA", // Uva
  "4":  "#E67C73", // Flamingo
  "5":  "#F6BF26", // Banana
  "6":  "#F4511E", // Tangerina
  "7":  "#039BE5", // Pavão
  "8":  "#616161", // Grafite
  "9":  "#3F51B5", // Mirtilo
  "10": "#0B8043", // Manjericão
  "11": "#D50000", // Tomate
};

// 🎨 Cor padrão do Google Calendar (azul "Peacock").
// Se o evento tá com essa cor, é porque o usuário NÃO escolheu nenhuma.
const COR_PADRAO_GOOGLE = "#039be5";

export function corDoEvento(evento) {
  // Caso 1: a API mandou backgroundColor direto
  if (evento.backgroundColor && /^#[0-9a-f]{6}$/i.test(evento.backgroundColor)) {
    // Ignora a cor padrão (usuário não escolheu nada)
    if (evento.backgroundColor.toLowerCase() === COR_PADRAO_GOOGLE) {
      return null;
    }
    return evento.backgroundColor;
  }

  // Caso 2: só tem colorId — mapeia
  if (evento.colorId && CORES_GOOGLE[evento.colorId]) {
    // colorId 7 = azul padrão. Ignora.
    if (evento.colorId === "7") return null;
    return CORES_GOOGLE[evento.colorId];
  }

  return null;
}