import { autenticar, ehAdmin, invalidarCacheAdmins } from "../../_lib/auth.js";
import { db } from "../../_lib/firebase.js";
import { ok, erro, metodoObrigatorio, cors, sanitizar } from "../../_lib/helpers.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!metodoObrigatorio(req, res, "POST")) return;

  const matricula = await autenticar(req);
  if (!matricula) return erro(res, 401, "Não autenticado");
  if (!(await ehAdmin(matricula))) return erro(res, 403, "Só admin");

  const alvoMatricula = sanitizar(req.body?.matricula, 20);
  const acao = sanitizar(req.body?.acao, 20) || "adicionar";

  if (!alvoMatricula) return erro(res, 400, "Matrícula obrigatória");

  // Não pode mexer em si mesmo
  if (alvoMatricula === matricula && acao === "remover") {
    return erro(res, 400, "Não pode remover a si mesmo");
  }

  if (acao === "adicionar") {
    // Verifica se o alvo existe nos perfis
    const snapPerfil = await db.ref(`perfis_alunos/${alvoMatricula}`).get();
    if (!snapPerfil.exists()) {
      return erro(res, 404, "Aluno não encontrado");
    }

    await db.ref(`admins/${alvoMatricula}`).set({
      desde: Date.now(),
      adicionadoPor: matricula,
    });

    await db.ref("logs_adm").push({
      matricula,
      acao: "adicionar_admin",
      alvo: alvoMatricula,
      timestamp: Date.now(),
    });

    invalidarCacheAdmins();
    return ok(res, { matricula: alvoMatricula, acao: "adicionado" });
  }

  if (acao === "remover") {
    await db.ref(`admins/${alvoMatricula}`).remove();

    await db.ref("logs_adm").push({
      matricula,
      acao: "remover_admin",
      alvo: alvoMatricula,
      timestamp: Date.now(),
    });

    invalidarCacheAdmins();
    return ok(res, { matricula: alvoMatricula, acao: "removido" });
  }

  return erro(res, 400, "Ação inválida");
}