// ==========================================
// 🔐 Handler: callback do OAuth
// Rota: /api/gcal?tipo=callback
// ==========================================
import { db } from "../firebase.js";
import { trocarCodigoPorTokens } from "../gcal.js";

const URL_SUCESSO = "https://infoweb-2v.vercel.app/login.html?gcal=ok";
const URL_ERRO = "https://infoweb-2v.vercel.app/login.html?gcal=erro";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ erro: "Use GET" });
  }

  const stateQuery = req.query.state;
  const cookieHeader = req.headers.cookie || "";
  const match = cookieHeader.match(/gcal_state=([^;]+)/);
  const stateCookie = match ? match[1] : null;

  if (!stateQuery || !stateCookie || stateQuery !== stateCookie) {
    console.error("[gcal-callback] state inválido");
    res.writeHead(302, { Location: URL_ERRO });
    res.end();
    return;
  }

  res.setHeader(
    "Set-Cookie",
    "gcal_state=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax"
  );

  const code = req.query.code;
  if (!code) {
    const erro = req.query.error || "sem_codigo";
    console.error("[gcal-callback] erro do Google:", erro);
    res.writeHead(302, { Location: `${URL_ERRO}&motivo=${encodeURIComponent(erro)}` });
    res.end();
    return;
  }

  let tokens;
  try {
    tokens = await trocarCodigoPorTokens(code);
  } catch (e) {
    console.error("[gcal-callback] erro ao trocar token:", e.message);
    res.writeHead(302, { Location: `${URL_ERRO}&motivo=token` });
    res.end();
    return;
  }

  if (!tokens.refresh_token) {
    console.error("[gcal-callback] refresh_token ausente");
    res.writeHead(302, { Location: `${URL_ERRO}&motivo=sem_refresh` });
    res.end();
    return;
  }

  try {
    await db.ref("config/gcal").update({
      refresh_token: tokens.refresh_token,
      scope: tokens.scope || "",
      vinculadoEm: Date.now(),
    });
  } catch (e) {
    console.error("[gcal-callback] erro ao salvar no Firebase:", e.message);
    res.writeHead(302, { Location: `${URL_ERRO}&motivo=firebase` });
    res.end();
    return;
  }

  console.log("[gcal-callback] ✅ OAuth concluído.");
  res.writeHead(302, { Location: URL_SUCESSO });
  res.end();
}