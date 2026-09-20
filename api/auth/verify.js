import { autenticar } from "../_lib/auth.js";
import { metodoObrigatorio, ok, erro, cors } from "../_lib/helpers.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!metodoObrigatorio(req, res, "POST")) return;

  const matricula = await autenticar(req);
  if (!matricula) return erro(res, 401, "Token SUAP inválido ou expirado");

  return ok(res, { matricula });
}