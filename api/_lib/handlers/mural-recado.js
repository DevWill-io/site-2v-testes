// api/_lib/handlers/mural-recado.js
import { db } from "../../_lib/firebase.js";
import { autenticar, ehAdmin } from "../../_lib/auth.js";
import { verificarRateLimit } from "../../_lib/rateLimit.js";
import { ok, erro, cors, sanitizar } from "../../_lib/helpers.js";

const RATE_MAX = 10;
const RATE_JANELA = 60_000;
const MSG_MAX = 200;
const LINK_MAX = 500;

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const matricula = await autenticar(req);
  if (!matricula) return erro(res, 401, "Não autenticado");

  const acao = req.body?.acao || (req.method === "POST" ? "criar" : "delete");

  // ============================
  // CRIAR
  // ============================
  if (acao === "criar") {
    const rl = await verificarRateLimit(matricula, "mural", RATE_MAX, RATE_JANELA);
    if (!rl.ok) return erro(res, 429, "Rate limit excedido");

    const mensagem = sanitizar(req.body?.mensagem, MSG_MAX);
    const link = sanitizar(req.body?.link, LINK_MAX);
    const duracaoHoras = Math.max(1, Math.min(360, Number(req.body?.duracaoHoras) || 168));

    if (!mensagem) return erro(res, 400, "Mensagem obrigatória");
    if (link && !/^https?:\/\//i.test(link)) {
      return erro(res, 400, "Link deve começar com http:// ou https://");
    }

    const snapPerfil = await db.ref(`perfis_alunos/${matricula}`).get();
    const perfil = snapPerfil.val() || {};
    const autorNome = perfil.nome || "Aluno";

    const ref = db.ref("mural_recados").push();
    await ref.set({
      autor_matricula: matricula,
      autor_nome: autorNome,
      mensagem,
      link_anexo: link,
      data: new Date().toLocaleDateString("pt-BR"),
      timestamp: Date.now(),
      duracao_horas: duracaoHoras,
      likes: [],
      comentarios: {},
      editado: false,
    });

    return ok(res, { id: ref.key });
  }

  // ============================
  // EXCLUIR
  // ============================
  if (acao === "delete") {
    const id = sanitizar(req.body?.id, 40);
    if (!id) return erro(res, 400, "ID obrigatório");

    const ref = db.ref(`mural_recados/${id}`);
    const snap = await ref.get();
    if (!snap.exists()) return erro(res, 404, "Recado não encontrado");

    const recado = snap.val();
    const ehAutor = recado.autor_matricula === matricula;
    const admin = await ehAdmin(matricula);

    if (!ehAutor && !admin) return erro(res, 403, "Sem permissão");

    await ref.remove();
    return ok(res, { id });
  }

  return erro(res, 400, "Ação inválida");
}