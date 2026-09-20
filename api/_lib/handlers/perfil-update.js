import { db } from "../../_lib/firebase.js";
import { autenticar } from "../auth.js";
import { ok, erro, metodoObrigatorio, cors, sanitizar } from "../helpers.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!metodoObrigatorio(req, res, "POST")) return;

  const matricula = await autenticar(req);
  if (!matricula) return erro(res, 401, "Não autenticado");

  const { nome, bio, redes, foto, mascoteAvatar, conquistasVisiveis } = req.body || {};

  const payload = {};
  if (nome) payload.nome = sanitizar(nome, 30);
  if (bio !== undefined) payload.bio = sanitizar(bio, 160);
  if (foto) payload.foto = String(foto).slice(0, 800_000); // base64 máx ~800KB
  if (mascoteAvatar) payload.mascoteAvatar = sanitizar(mascoteAvatar, 30);
  if (conquistasVisiveis !== undefined) payload.conquistasVisiveis = conquistasVisiveis;

  if (redes && typeof redes === "object") {
    payload.redes = {
      tiktok: sanitizar(redes.tiktok, 30),
      instagram: sanitizar(redes.instagram, 30),
      github: sanitizar(redes.github, 30),
      email: sanitizar(redes.email, 80),
      site: sanitizar(redes.site, 120),
    };
  }

  payload.perfilEditadoEm = Date.now();

  await db.ref(`perfis_alunos/${matricula}`).update(payload);

  return ok(res, { matricula });
}