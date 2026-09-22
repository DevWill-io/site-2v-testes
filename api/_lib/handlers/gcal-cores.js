// ==========================================
// 🎨 Handler: cores dos eventos do Google Calendar
// Rota: /api/gcal?tipo=cores
// Acesso: público
// ==========================================
import { db } from "../firebase.js";
import { renovarAccessToken, listarEventos, corDoEvento } from "../gcal.js";

const CALENDAR_ID = "acb20a08d58749d48304dbda5c87bfb7f0671483ecc4ed942683ad5a1307e78d@group.calendar.google.com";

const CACHE_TTL = 5 * 60 * 1000;
let __cache = null;
let __cacheExpira = 0;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") {
    return res.status(405).json({ erro: "Use GET" });
  }

  const agora = Date.now();
  if (__cache && __cacheExpira > agora) {
    res.setHeader("X-Cache", "HIT");
    return res.status(200).json({ sucesso: true, cores: __cache, cache: true });
  }

  try {
    const snap = await db.ref("config/gcal/refresh_token").get();
    const refreshToken = snap.val();

    if (!refreshToken) {
      return res.status(200).json({
        sucesso: true,
        cores: {},
        motivo: "sem_oauth",
        mensagem: "Nenhum refresh_token salvo. Admin precisa autorizar via /api/gcal?tipo=auth",
      });
    }

    const { access_token } = await renovarAccessToken(refreshToken);

    const agoraISO = new Date().toISOString();
    const em60dias = new Date(agora + 60 * 24 * 60 * 60 * 1000).toISOString();
    const ha7dias = new Date(agora - 7 * 24 * 60 * 60 * 1000).toISOString();

    const eventos = await listarEventos(access_token, CALENDAR_ID, ha7dias, em60dias);

    const cores = {};
    eventos.forEach((ev) => {
      const cor = corDoEvento(ev);
      if (cor && ev.id) {
        cores[ev.id] = cor;
      }
    });

    __cache = cores;
    __cacheExpira = agora + CACHE_TTL;

    res.setHeader("X-Cache", "MISS");
    return res.status(200).json({
      sucesso: true,
      cores,
      total: Object.keys(cores).length,
      totalEventos: eventos.length,
      cache: false,
    });
  } catch (e) {
    console.error("[gcal-cores] erro:", e.message);
    return res.status(200).json({
      sucesso: false,
      cores: {},
      erro: "Erro ao buscar cores",
    });
  }
}