# 🎯 Migração: XP e Contadores → Firebase (v2)

## 📋 Resumo

**Antes:** XP, cliques no mascote e contadores de interação ficavam **só no localStorage**.
**Agora:** tudo sincroniza no **Firebase**, entre dispositivos.

**Bug corrigido:** aluno postava 5 recados no PC → chegava em casa → `xp_recados_total` voltava a 0 → postava mais 6 → não desbloqueava "Comunicador".

---

## 🏗️ Arquitetura

### Fonte de verdade

```
Firebase (usuarios_xp/{matricula})
  ├── xp: number
  ├── streak: number
  ├── ultimaVisita: "YYYY-MM-DD"
  ├── cliquesMascote: number         ← NOVO
  ├── conquistas/{id}: { desbloqueadaEm }
  ├── contadores/                    ← NOVO
  │   ├── recados: number
  │   ├── curtidas: number
  │   ├── simulador: number
  │   └── periodos: number
  └── migracaoLocal/                 ← NOVO (flag)
      └── concluidaEm: timestamp
```

### Cache local (rápido)

- `window.xpCore._cache` — em memória (leitura instantânea)
- `localStorage` — espelho pra compatibilidade com código antigo

### Fluxo de leitura

```
UI pede → xpCore.obterXP()
  ├── se logado → cache em memória (já sincronizado com Firebase)
  └── se anônimo → cache do localStorage
```

### Fluxo de escrita

```
Ação (clique, recado, curtida)
  → xpCore.incrementarXP(qtd)
    ├── atualiza cache em memória
    ├── atualiza localStorage (espelho)
    ├── dispara evento (xp:update)
    └── se logado → runTransaction no Firebase
      └── se falhar → enfileira em filaOffline
```

---

## 🔄 Migração automática

**Roda 1x por matrícula**, na primeira vez que o aluno logar depois do deploy.

### Passo a passo

1. **Verifica flag** `usuarios_xp/{mat}/migracaoLocal/concluidaEm`
   - Se existir → **pula** migração
2. **Lê do localStorage:**
   - `xp_total`
   - `xp_cliques_mascote`
   - `xp_recados_total`, `xp_curtidas_total`, `xp_simulador_total`, `xp_periodos_total`
3. **Lê do Firebase:**
   - `xp`, `streak`, `cliquesMascote`, `contadores/*`
4. **Soma máxima** (nunca diminui):
   - `xp_final = max(local, firebase)`
   - `cliques_final = max(local, firebase)`
   - `contadores.* = max(local, firebase)`
5. **Escreve tudo atomicamente** com `update()` no Firebase
6. **Marca flag** `migracaoLocal/concluidaEm = Date.now()`
7. **Limpa** os valores do localStorage (já migrados)

### Log esperado

```
[xp-core] 🔄 Iniciando migração local → Firebase...
[xp-core] ✅ Migração concluída: { xp: 834, cliques: 842, recados: 5, curtidas: 12, simulador: 3, periodos: 2 }
```

---

## 📁 Arquivos alterados

| Arquivo | Mudança |
|---|---|
| `scripts/xp-core.js` | ✨ **NOVO** — núcleo unificado |
| `index.html` | ➕ adiciona `<script type="module" src="scripts/xp-core.js">` |
| `login.html` | ➕ mesmo + remove firebase-compat (código morto) |
| `scripts/script.js` | 🔧 funções `adicionarXP` etc. delegam pro `xpCore` |
| `scripts/mascote.js` | 🔧 `darCarinho` usa `xpCore` |
| `scripts/login.js` | 🔧 `adicionarXP`, `checarConquistasAutomaticas` usam `xpCore` |
| `sw.js` | 🔧 cache `v2` + `xp-core.js` na lista |

---

## 🚀 Deploy

### 1. Antes de subir

- [ ] Fez backup do `login.js`? (`cp login.js login.js.bak`)
- [ ] Aplicou **todos os 7 patches**?
- [ ] `xp-core.js` está em `scripts/`?

### 2. Subir pra produção

```bash
git add .
git commit -m "feat: migra XP e contadores para Firebase (v2)"
git push
```

Vercel faz deploy automático.

### 3. Verificar deploy

Abre o site em **aba anônima** e vai no console (F12):

```js
> typeof window.xpCore
"object"

> window.xpCore.obterXP()
0  // (ou valor real, se logado)
```

Se retornar `undefined`, o `xp-core.js` não carregou → verifica CSP, caminho do arquivo e cache.

---

## ✅ Testes de aceitação

### Teste 1 — Anônimo (comportamento preservado)

1. Abre `index.html` **sem login**
2. Console: `[xp-core] pronto. { anonimo: true }`
3. Clica no mascote 3x
4. `window.xpCore.obterCliquesMascote()` → **3**
5. **Nada é escrito no Firebase** ✅

### Teste 2 — Logado, mesmo device

1. Abre `login.html`, faz login SUAP
2. Console: `[xp-core] pronto. { anonimo: false, matricula: "..." }`
3. Clica no mascote 5x
4. `window.xpCore.obterXP()` → **subiu 5**
5. Firebase Console → `usuarios_xp/{mat}/xp` → **subiu 5** ✅

### Teste 3 — 🎯 O bug original

1. **PC:** loga, posta 5 recados
2. `window.xpCore.obterContador("recados")` → **5**
3. **Logout**
4. **Celular:** loga mesma conta
5. `window.xpCore.obterContador("recados")` → **5** (antes era 0) ✅
6. Posta mais 6 recados → **11**
7. Conquista "Comunicador" desbloqueia ✅

### Teste 4 — Conquistas de clique

1. Logado, roda:
   ```js
   for (let i = 0; i < 500; i++) await window.xpCore.incrementarCliquesMascote(1)
   ```
2. Deve desbloquear: `primeiro_carinho`, `cliques_100`, `cliques_250`, `carinhoso`
3. Firebase → `usuarios_xp/{mat}/conquistas/` → as 4 presentes ✅

### Teste 5 — Migração

1. **Antes do deploy:** limpa dados do aluno no Firebase (só pra testar):
   - `usuarios_xp/{mat}` → deleta
2. **Aluno loga** num device com localStorage cheio
3. Console: `[xp-core] 🔄 Iniciando migração...` e `✅ Migração concluída`
4. Firebase → `usuarios_xp/{mat}` → tem os valores ✅
5. `migracaoLocal/concluidaEm` → timestamp presente ✅
6. **Recarrega a página** → console: nada de migração (flag já existe) ✅

---

## 🐛 Troubleshooting

### `xpCore` não aparece no console

- **Causa:** CSP bloqueou `gstatic.com` ou `xp-core.js` não existe
- **Fix:** verifica se o arquivo existe em `scripts/xp-core.js` e se o CSP do `index.html`/`login.html` permite `gstatic.com`

### XP sobe local mas não no Firebase

- **Causa:** usuário não está logado (`cookie matricula` ausente) ou `xpCore.estaPronto()` retorna `false`
- **Fix:** checa `document.cookie` no console. Se vazio, refaz login.

### Service Worker servindo JS antigo

- **Causa:** `CACHE_NAME` não foi bumpado
- **Fix:** confirma que está `infoweb-2v-v2`. Depois: DevTools → Application → Service Workers → **Unregister**, depois hard refresh (`Ctrl+Shift+R`).

### Migração rodou 2x (valores duplicados)

- **Causa:** flag `migracaoLocal/concluidaEm` não foi escrita (rede caiu no meio)
- **Fix:** apaga manualmente `usuarios_xp/{mat}/migracaoLocal` no Firebase e limpa localStorage daquele aluno. Rodará de novo.

### Race condition (XP some em 2 abas)

- **Causa:** improvável agora (usamos `runTransaction`)
- **Fix:** se acontecer, é bug — abre issue. Workaround: recarregar a página.

---

## 📊 Monitoramento

### Firebase Console

Depois de 1-2 dias de uso, verifica:

```
usuarios_xp/{mat}/
  ├── xp: ...          ← bate com o que a UI mostra?
  ├── cliquesMascote: ... ← bate com a barra de skins?
  ├── contadores/      ← algum aluno tem > 0?
  └── migracaoLocal/   ← tem concluidaEm?
```

### Console do navegador (alunos)

Filtra logs por `[xp-core]` pra ver o que tá acontecendo.

---

## 🔙 Rollback

Se algo der muito errado:

```bash
cp scripts/login.js.bak scripts/login.js
git checkout HEAD~1 -- index.html login.html scripts/script.js scripts/mascote.js sw.js
git commit -m "rollback: desfaz migração XP"
git push
```

O `xp-core.js` pode ficar (é inofensivo se ninguém importar).

**Obs:** o Firebase vai ter dados extras (`cliquesMascote`, `contadores`, `migracaoLocal`) — pode ignorar ou apagar depois.

---

## 📝 Notas

- **Nível do XP** continua sendo calculado no cliente (não mudou)
- **Preferências visuais** (tema, idioma, som do mascote) continuam **só no localStorage** — de propósito
- **`mascote/por_aluno/{mat}`** (carinhos globais) **não mudou** — continua usando `runTransaction`
- **`usuarios_uid/`** no Firebase é código morto (de testes antigos) — pode apagar

---

## 🎓 Referência rápida da API

```js
// Leitura (síncrona)
window.xpCore.obterXP()                     // number
window.xpCore.obterCliquesMascote()         // number
window.xpCore.obterStreak()                 // number
window.xpCore.obterSkinAtiva()              // string
window.xpCore.obterContador("recados")      // number
window.xpCore.obterConquistas()             // { id: {desbloqueadaEm} }
window.xpCore.estaLogado()                  // boolean
window.xpCore.estaPronto()                  // boolean

// Escrita (assíncrona)
await window.xpCore.incrementarXP(10, "motivo")
await window.xpCore.incrementarCliquesMascote(1)
await window.xpCore.incrementarContador("recados", 1)
await window.xpCore.registrarAcessoDiario()
await window.xpCore.desbloquearConquista("comunicador")
await window.xpCore.definirSkinAtiva("simpson")
await window.xpCore.registrarPeriodoVisto("2026.1")
await window.xpCore.registrarUsoSimulador()

// Controle
await window.xpCore.sincronizar()
await window.xpCore.migrarLocalSeNecessario()

// Debug
window.xpCore._cache                       // estado interno
window.xpCore._filaOffline                 // itens pendentes
```

---

## 📡 Eventos emitidos

| Evento | Quando | Detail |
|---|---|---|
| `xpCore:pronto` | Após sincronizar | `{ anonimo, matricula?, erro? }` |
| `xpCore:migracao` | Após migrar | `{ xpFinal, cliquesFinal }` |
| `xpCore:contador` | Contador incrementou | `{ nome, total, adicionado }` |
| `xpCore:conquista` | Conquista desbloqueada | `{ id, desbloqueadaEm }` |
| `xp:update` | XP mudou | `{ total, quantidade?, motivo? }` |
| `mascote:cliques` | Cliques mudaram | `{ total, adicionado? }` |
| `xp:streak` | Streak mudou | `{ streak, bonusXP, novo }` |
| `skin:mudou` | Skin ativa mudou | `{ skinId }` |