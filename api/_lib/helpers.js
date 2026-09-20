// ==========================================
// Helpers comuns
// ==========================================

/** Resposta de sucesso */
export function ok(res, dados = {}) {
  return res.status(200).json({ sucesso: true, ...dados });
}

/** Resposta de erro */
export function erro(res, status, mensagem) {
  return res.status(status).json({ sucesso: false, erro: mensagem });
}

/** Método HTTP obrigatório */
export function metodoObrigatorio(req, res, metodo) {
  if (req.method !== metodo) {
    erro(res, 405, `Use ${metodo}`);
    return false;
  }
  return true;
}

/** Sanitiza string (remove tags, limita tamanho) */
export function sanitizar(texto, maxLen = 200) {
  if (!texto) return "";
  return String(texto)
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLen);
}

/** Valida se um valor é número finito e positivo */
export function numValido(valor) {
  const n = Number(valor);
  return Number.isFinite(n) && n >= 0;
}

/** CORS básico (mesma origem, mas por garantia) */
export function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}