// ==========================================
// 🎯 api/[...path].js — Roteador central (catch-all)
// ==========================================
import handlerXpAdd from "./_lib/handlers/xp-add.js";
import handlerXpContador from "./_lib/handlers/xp-contador.js";
import handlerXpMeus from "./_lib/handlers/xp-meus.js";
import handlerXpAcessoDiario from "./_lib/handlers/xp-acesso-diario.js";
import handlerConquistaUnlock from "./_lib/handlers/conquista-unlock.js";
import handlerMascoteCarinho from "./_lib/handlers/mascote-carinho.js";
import handlerMascoteSkin from "./_lib/handlers/mascote-skin.js";
import handlerMuralRecado from "./_lib/handlers/mural-recado.js";
import handlerMuralCurtir from "./_lib/handlers/mural-curtir.js";
import handlerMuralComentar from "./_lib/handlers/mural-comentar.js";
import handlerPerfilUpdate from "./_lib/handlers/perfil-update.js";
import handlerPerfilPublico from "./_lib/handlers/perfil-publico.js";
import handlerRankingCarinhos from "./_lib/handlers/ranking-carinhos.js";
import handlerRankingXp from "./_lib/handlers/ranking-xp.js";

export default async function handler(req, res) {
  // req.query.path chega como array (ex: ["xp", "add"]) ou string (ex: "xp")
  const pathArray = Array.isArray(req.query.path)
    ? req.query.path
    : [req.query.path];
  const path = pathArray.filter(Boolean).join("/");

  const rotas = {
    "xp/add": handlerXpAdd,
    "xp/contador": handlerXpContador,
    "xp/meus": handlerXpMeus,
    "xp/acesso-diario": handlerXpAcessoDiario,
    "conquista/unlock": handlerConquistaUnlock,
    "mascote/carinho": handlerMascoteCarinho,
    "mascote/skin": handlerMascoteSkin,
    "mural/recado": handlerMuralRecado,
    "mural/curtir": handlerMuralCurtir,
    "mural/comentar": handlerMuralComentar,
    "perfil/update": handlerPerfilUpdate,
    "ranking/carinhos": handlerRankingCarinhos,
    "ranking/xp": handlerRankingXp,
  };

  // Rota especial: /api/perfil/:matricula
  if (path.startsWith("perfil/") && path !== "perfil/update") {
    req.query.matricula = path.replace("perfil/", "");
    return handlerPerfilPublico(req, res);
  }

  const rotaHandler = rotas[path];
  if (rotaHandler) {
    return rotaHandler(req, res);
  }

  return res.status(404).json({
    sucesso: false,
    erro: `Endpoint não encontrado: /api/${path}`,
  });
}