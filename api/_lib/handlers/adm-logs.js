import { autenticar, ehAdmin } from "../../_lib/auth.js";
import { db } from "../../_lib/firebase.js";
import { ok, erro, metodoObrigatorio, cors } from "../../_lib/helpers.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!metodoObrigatorio(req, res, "POST")) return;

  const matricula = await autenticar(req);
  if (!matricula) return erro(res, 401, "Não autenticado");
  if (!(await ehAdmin(matricula))) return erro(res, 403, "Só admin");

  const snap = await db.ref("logs_adm").orderByChild("timestamp").limitToLast(100).get();
  const logs = [];
  snap.forEach((child) => {
    logs.push({ id: child.key, ...child.val() });
  });
  logs.reverse();

  return ok(res, { logs, total: logs.length });
}