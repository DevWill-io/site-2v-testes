// ==========================================
// Rate limit server-side (Firebase)
// ==========================================
import { db } from "./firebase.js";

/**
 * Verifica se pode executar uma ação, respeitando rate limit.
 * Retorna { ok: true } ou { ok: false, motivo: "rate_limit" }.
 *
 * @param {string} matricula
 * @param {string} tipo   - "xp" | "cliques" | "contadores" | "conquistas" | "mural"
 * @param {number} max    - máximo de ações na janela
 * @param {number} janela - tamanho da janela em ms
 */
export async function verificarRateLimit(matricula, tipo, max, janela) {
  const ref = db.ref(`_rateLimit/${matricula}/${tipo}`);
  const agora = Date.now();

  const resultado = await ref.transaction((dados) => {
    dados = dados || { historico: [] };
    if (!Array.isArray(dados.historico)) dados.historico = [];
    // Remove antigos
    dados.historico = dados.historico.filter((t) => agora - t < janela);
    // Verifica
    if (dados.historico.length >= max) return; // aborta
    // Adiciona
    dados.historico.push(agora);
    dados.ultimaAcao = agora;
    return dados;
  });

  if (!resultado.committed) {
    return { ok: false, motivo: "rate_limit" };
  }
  return { ok: true };
}