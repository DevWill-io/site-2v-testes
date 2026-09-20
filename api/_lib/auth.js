// ==========================================
// Middleware de autenticação SUAP + checagem de admin dinâmica
// ==========================================
import { validarTokenSUAP } from "./suap.js";
import { db } from "./firebase.js";

// Cache de admins (evita ler o Firebase toda requisição)
let __cacheAdmins = null;
let __cacheAdminsExpira = 0;
const CACHE_TTL_MS = 30 * 1000; // 30 segundos

/**
 * Lê a lista de admins do Firebase (com cache de 30s).
 */
export async function obterAdmins() {
  const agora = Date.now();
  if (__cacheAdmins && __cacheAdminsExpira > agora) return __cacheAdmins;

  try {
    const snap = await db.ref("admins").get();
    __cacheAdmins = snap.val() || {};
    __cacheAdminsExpira = agora + CACHE_TTL_MS;
    return __cacheAdmins;
  } catch (e) {
    console.warn("[auth] erro ao ler admins:", e.message);
    return __cacheAdmins || {};
  }
}

/**
 * Invalida o cache de admins (chamar depois de add/remove).
 */
export function invalidarCacheAdmins() {
  __cacheAdmins = null;
  __cacheAdminsExpira = 0;
}

export async function autenticar(req) {
  const header = req.headers.authorization || req.headers.Authorization || "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  return validarTokenSUAP(token);
}

// Fallback: se o nó admins estiver vazio, essa matrícula é admin
export const MATRICULA_ADMIN_FALLBACK = "20261101110002";

/**
 * Verifica se uma matrícula é admin.
 * Se o nó `admins` estiver vazio/inexistente, usa o fallback.
 */
export async function ehAdmin(matricula) {
  if (!matricula) return false;
  const admins = await obterAdmins();

  // Se o nó admins estiver vazio, usa fallback
  if (!admins || Object.keys(admins).length === 0) {
    return matricula === MATRICULA_ADMIN_FALLBACK;
  }

  return !!admins[matricula];
}

/**
 * Verifica se uma matrícula é admin (versão síncrona, só pro frontend antigo).
 * ⚠️ Usa cache; pode retornar desatualizado por até 30s.
 */
export function ehAdminSync(matricula) {
  if (!matricula) return false;
  const admins = __cacheAdmins || {};
  if (Object.keys(admins).length === 0) {
    return matricula === MATRICULA_ADMIN_FALLBACK;
  }
  return !!admins[matricula];
}