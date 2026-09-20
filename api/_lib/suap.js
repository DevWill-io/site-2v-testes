// ==========================================
// Validação de token SUAP + cache em memória
// ==========================================
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos
const cache = new Map(); // token -> { matricula, expiraEm }

export async function validarTokenSUAP(token) {
  if (!token || typeof token !== "string") return null;

  // Cache hit?
  const cached = cache.get(token);
  if (cached && cached.expiraEm > Date.now()) {
    return cached.matricula;
  }

  try {
    const res = await fetch("https://suap.ifrn.edu.br/api/rh/meus-dados/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      cache.delete(token);
      return null;
    }
    const dados = await res.json();
    const matricula = dados.matricula || dados.siape || null;
    if (matricula) {
      cache.set(token, {
        matricula: String(matricula),
        expiraEm: Date.now() + CACHE_TTL_MS,
      });
    }
    return matricula ? String(matricula) : null;
  } catch (err) {
    console.warn("[suap] erro ao validar token:", err.message);
    return null;
  }
}