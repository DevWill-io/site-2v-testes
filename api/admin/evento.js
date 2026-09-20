import { google } from "googleapis";
import { autenticar, ehAdmin } from "../_lib/auth.js";
import { ok, erro, metodoObrigatorio, cors, sanitizar } from "../_lib/helpers.js";

let __auth = null;
function obterAuth() {
  if (__auth) return __auth;
  const credenciais = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
  __auth = new google.auth.GoogleAuth({
    credentials: credenciais,
    scopes: ["https://www.googleapis.com/auth/calendar.events"],
  });
  return __auth;
}

const CORES_GOOGLE = {
  vermelho: "11", laranja: "6", verde: "2",
  roxo: "3", azul: "7", rosa: "4",
};

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!metodoObrigatorio(req, res, "POST")) return;

  const matricula = await autenticar(req);
  if (!matricula) return erro(res, 401, "Não autenticado");
  if (!ehAdmin(matricula)) return erro(res, 403, "Só admin");

  const { titulo, descricao, local, inicio, fim, cor, diaTodo } = req.body || {};

  if (!titulo || !inicio || !fim) return erro(res, 400, "Dados incompletos");

  const dIni = new Date(inicio);
  const dFim = new Date(fim);
  if (isNaN(dIni) || isNaN(dFim) || dFim <= dIni) {
    return erro(res, 400, "Datas inválidas");
  }

  try {
    const auth = obterAuth();
    const calendar = google.calendar({ version: "v3", auth });

    const evento = {
      summary: sanitizar(titulo, 200),
      description: sanitizar(descricao || "", 2000),
      location: sanitizar(local || "", 200),
      colorId: CORES_GOOGLE[cor] || "3",
    };

    if (diaTodo) {
      const pad = (n) => String(n).padStart(2, "0");
      const fmt = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
      evento.start = { date: fmt(dIni) };
      const diaSeg = new Date(dFim);
      diaSeg.setUTCDate(diaSeg.getUTCDate() + 1);
      evento.end = { date: fmt(diaSeg) };
    } else {
      evento.start = { dateTime: dIni.toISOString(), timeZone: "America/Fortaleza" };
      evento.end = { dateTime: dFim.toISOString(), timeZone: "America/Fortaleza" };
    }

    const resposta = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      requestBody: evento,
    });

    return ok(res, {
      id: resposta.data.id,
      link: resposta.data.htmlLink,
    });
  } catch (err) {
    console.error("[admin/evento] erro:", err);
    return erro(res, 500, "Erro ao criar evento");
  }
}