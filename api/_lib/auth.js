// ==========================================
// Middleware de autenticação SUAP
// ==========================================
import { validarTokenSUAP } from "./suap.js";

/**
 * Retorna a matrícula do aluno autenticado, ou null se inválido.
 * Uso:
 *   const matricula = await autenticar(req);
 *   if (!matricula) return res.status(401).json({ erro: "Não autenticado" });
 */
export async function autenticar(req) {
  const header = req.headers.authorization || req.headers.Authorization || "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  return validarTokenSUAP(token);
}

export const MATRICULA_ADMIN = "20261101110002";

export function ehAdmin(matricula) {
  return matricula === MATRICULA_ADMIN;
}