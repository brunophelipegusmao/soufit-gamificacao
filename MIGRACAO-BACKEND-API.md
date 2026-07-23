# Migração: separar backend em `src/api/`

Guia passo a passo para separar toda a lógica de servidor (Server Actions,
acesso a dado, clients de infra) da UI, reunindo tudo em `src/api/`. Continua
sendo **1 único app Next.js, 1 único deploy** — isso é reorganização de
pasta, não criação de serviço separado (GATE-3 do CLAUDE.md continua valendo:
nada de microsserviço).

Execute as etapas em ordem. Cada uma tem: o que mover, quais imports ajustar,
e como validar antes de ir pra próxima. Marque o checkbox ao concluir.

## Estrutura alvo

```
src/
  api/
    clients/     supabase-admin.ts, supabase-server.ts, resend.ts
    data/        admin.ts, campaigns.ts, missions.ts, xp.ts, invite-admin.ts
    actions/     create-campaign/, invite-admin/, login/, logout/,
                 remove-campaign-admin/, set-principal-admin/, submit-contact-form/

  app/           inalterado — pages, layouts, route handlers
  components/    inalterado — UI pura
  hooks/         inalterado — só o caminho dos imports muda
  lib/           só sobra utilitário puro de frontend (utils.ts, slug.ts)
  types/         inalterado — contrato de dado compartilhado, não é "backend"
```

**Por que `src/api/` e não algo na raiz do repo:** o Next.js já reserva
`src/app/api/` para route handlers; uma segunda pasta `api/` na raiz do
projeto criaria confusão visual com aquela. Ficando dentro de `src`, o alias
`@/api/...` funciona de graça com o `paths` que já existe no
`tsconfig.json`.

**Decisões que valem para todas as etapas:**
- `src/types/index.ts` não se move — é contrato de dado (shape), usado tanto
  pelo backend quanto por componentes de UI. Não é lógica de servidor.
- Os `schema.ts` (Zod) de cada action também continuam importáveis pelo
  frontend depois de mover a pasta da action — formulários usam
  `zodResolver(schema)` direto deles (padrão já usado em `campaign-form.tsx`,
  `login-form.tsx`, `invite-admin-form.tsx`, `contact-form.tsx`,
  `missions-section.tsx`). Só o caminho do import muda.
- Server Components (`page.tsx`, `layout.tsx`) podem continuar importando
  direto de `src/api/data/*`. Isso é o padrão idiomático do App Router
  (fetch no servidor) — a regra é sobre onde o código *mora*, não sobre
  proibir Server Component de chamar função de dado.
- `src/proxy.ts` (middleware) não muda de lugar — é posição exigida pelo
  Next.js. Tratado à parte na Etapa 6.

---

## Etapa 0 — Criar a estrutura vazia

```bash
mkdir -p src/api/clients src/api/data src/api/actions
```

- [x] Feito. Nada mais para validar aqui.

---

## Etapa 1 — Mover os clients de infra

Menor risco: poucos consumidores, todos dentro de `src/actions/`.

```bash
git mv src/lib/supabase-admin.ts src/api/clients/supabase-admin.ts
git mv src/lib/supabase-server.ts src/api/clients/supabase-server.ts
git mv src/lib/resend.ts src/api/clients/resend.ts
```

Ajustar imports (`@/lib/supabase-admin` → `@/api/clients/supabase-admin`,
mesma coisa para os outros dois) nestes arquivos:

- `src/actions/create-campaign/index.ts`
- `src/actions/login/index.ts`
- `src/actions/logout/index.ts`
- `src/actions/remove-campaign-admin/index.ts`
- `src/actions/set-principal-admin/index.ts`
- `src/actions/submit-contact-form/index.ts`

Também vale checar `src/lib/admin.ts`, `src/lib/invite-admin.ts` (usam
`supabase-admin`/`supabase-server` internamente) — mas esses só serão
movidos na Etapa 2, então por enquanto só ajuste o import path deles para
apontar para o novo local em `src/api/clients/`.

**Correção:** o grep original só olhou imports absolutos (`@/lib/supabase"`) e
não pegou o uso real — `src/lib/campaigns.ts`, `src/lib/missions.ts` e
`src/lib/xp.ts` importam esse client via caminho relativo (`./supabase`).
Não é código morto. Ele foi movido junto na Etapa 2, para
`src/api/clients/supabase.ts`, e os três consumidores relativos foram
trocados para o import absoluto `@/api/clients/supabase`.

Checagem (deve voltar vazio):
```bash
grep -rn "@/lib/supabase-admin\|@/lib/supabase-server\|@/lib/resend" src
```

Validação: `pnpm build`

- [x] Feito e build passando.

---

## Etapa 2 — Mover a camada de dados (`lib` de domínio)

```bash
git mv src/lib/admin.ts src/api/data/admin.ts
git mv src/lib/campaigns.ts src/api/data/campaigns.ts
git mv src/lib/missions.ts src/api/data/missions.ts
git mv src/lib/xp.ts src/api/data/xp.ts
git mv src/lib/invite-admin.ts src/api/data/invite-admin.ts
git mv src/lib/supabase.ts src/api/clients/supabase.ts
```

(o `supabase.ts` entrou aqui também — ver correção na nota da Etapa 1: é
dependência direta de `campaigns.ts`, `missions.ts` e `xp.ts`, então move
junto para `src/api/clients/`)

Ajustar imports (`@/lib/admin` → `@/api/data/admin`, etc.) nestes
consumidores:

- `src/actions/create-campaign/index.ts`
- `src/actions/invite-admin/index.ts`
- `src/actions/remove-campaign-admin/index.ts`
- `src/actions/set-principal-admin/index.ts`
- `src/app/[campaign_slug]/page.tsx`
- `src/app/admin/(dashboard)/[campaign_slug]/administradores/page.tsx`
- `src/app/admin/(dashboard)/[campaign_slug]/page.tsx`
- `src/app/admin/(dashboard)/components/campaign-admins-list.tsx`
- `src/app/admin/(dashboard)/components/campaign-card.tsx`
- `src/app/admin/(dashboard)/components/campaign-section.tsx`
- `src/app/admin/(dashboard)/layout.tsx`
- `src/app/admin/(dashboard)/new-campaign/page.tsx`
- `src/app/admin/(dashboard)/page.tsx`
- `src/app/admin/login/page.tsx`

(`src/app/api/test/route.ts` foi removido pelo usuário antes desta etapa —
não existe mais, não precisa de ajuste)

Também ajustar os imports *internos*: `campaigns.ts`, `missions.ts` e
`xp.ts` importavam `supabase` via `./supabase` (relativo) — vira
`@/api/clients/supabase` (absoluto). `admin.ts` e `invite-admin.ts` já
importavam os clients via `@/api/clients/*` (ajustado na Etapa 1), não
precisam de mudança adicional.

Checagem (deve voltar vazio):
```bash
grep -rn "@/lib/admin\"\|@/lib/campaigns\"\|@/lib/missions\"\|@/lib/xp\"\|@/lib/invite-admin\"\|\"\./supabase\"" src
```

Validação: `pnpm build`

- [x] Feito e build passando.

---

## Etapa 3 — Mover as Server Actions

```bash
git mv src/actions src/api/actions
```

(isso move a pasta inteira de uma vez — cada subpasta com `index.ts` +
`schema.ts` junto)

**Armadilha encontrada na execução:** como `src/api/actions/` já existia
(criado vazio na Etapa 0), o `git mv` acima aninhou tudo em
`src/api/actions/actions/<nome-da-action>` em vez de
`src/api/actions/<nome-da-action>`. Corrigido com `git mv` individual de
cada uma das 7 subpastas para um nível acima, seguido de
`rmdir src/api/actions/actions`. Se você rodar este passo do zero (etapas
posteriores desta migração, ou outra pasta que já exista), cheque a
estrutura resultante antes de seguir:
```bash
find src/api/actions -maxdepth 1 -type d
```
Não deve aparecer nenhuma subpasta chamada `actions` dentro de
`src/api/actions/`.

Ajustar imports (`@/actions/...` → `@/api/actions/...`) nestes consumidores:

- `src/hooks/mutations/use-create-campaign-mutation.ts`
- `src/hooks/mutations/use-invite-admin-mutation.ts`
- `src/hooks/mutations/use-login-mutation.ts`
- `src/hooks/mutations/use-remove-campaign-admin-mutation.ts`
- `src/hooks/mutations/use-set-principal-admin-mutation.ts`
- `src/hooks/mutations/use-submit-contact-form-mutation.ts`
- `src/hooks/mutations/use-update-password-mutation.ts` (confirmar se
  importa alguma action — não apareceu no grep original, checar mesmo assim)
- `src/app/admin/(dashboard)/components/app-sidebar.tsx` (importa a função
  `logout` diretamente, não só o schema)
- `src/app/admin/(dashboard)/components/campaign-form.tsx` (só `schema.ts`)
- `src/app/admin/(dashboard)/components/invite-admin-form.tsx` (só
  `schema.ts`)
- `src/app/admin/(dashboard)/components/missions-section.tsx` (só
  `schema.ts`)
- `src/app/admin/login/components/login-form.tsx` (só `schema.ts`)
- `src/app/contact/components/contact-form.tsx` (só `schema.ts`)

Checagem (deve voltar vazio):
```bash
grep -rn "@/actions/" src
```

Validação: `pnpm build`

- [x] Feito e build passando.

---

## Etapa 4 — Confirmar route handlers como fachada fina

`src/app/api/test/route.ts` (o único route handler que existia) foi removido
pelo usuário antes desta etapa — não há route handler no projeto hoje. Não
há nada para validar aqui agora; a regra fica registrada para o próximo
route handler que nascer:

Qualquer `route.ts` novo em `src/app/api/**/` deve ficar fisicamente ali
(exigência de roteamento do Next.js), mas só pode `import` de `src/api/`,
sem nenhuma lógica de acesso a dado escrita dentro do próprio `route.ts`.

- [x] Confirmado — nada a migrar aqui, regra registrada para uso futuro.

---

## Etapa 5 — Revisar `src/proxy.ts` (middleware)

Não move de lugar — é posição exigida pelo Next.js. Mas hoje ele fazia a
própria checagem de sessão (`supabase.auth.getUser()`) inline, o que
pareceu à primeira vista uma violação do GATE-5 ("fachada fina, chama
src/api/"). Antes de aceitar isso como exceção, a pergunta certa foi feita:
existe um motivo técnico real (não só conveniência) para não injetar o
client Supabase em vez de deixar `src/api/data/admin.ts` construí-lo
sozinho?

**Resposta: parcialmente sim, parcialmente não — e a parte que era "não"
foi corrigida.**

- A **construção do client** não dá pra compartilhar de verdade: o
  middleware roda em Edge e precisa de um client montado com
  `request.cookies` (API do Next.js só disponível em middleware); o resto
  do app usa `cookies()` de `next/headers` (só disponível em Server
  Component/Route Handler/Server Action). Duas APIs de cookie mutuamente
  incompatíveis — isso é um limite real do Next.js/Supabase SSR, não
  conveniência.
- Mas a **query de sessão em si** (`supabase.auth.getUser()`) é idêntica
  nos dois runtimes — só precisa de um client já construído como
  parâmetro. Essa parte não tinha motivo pra estar duplicada, e o arquivo
  já tinha o precedente certo: `isSuperadmin(supabase, userId)` em
  `admin.ts` já recebe o client injetado em vez de construí-lo.

**Mudança feita:** extraída `getAuthUser(supabase)` em
`src/api/data/admin.ts` — recebe o client e devolve o `user`.
`getSessionUser()` (usado pelos Server Components) passou a chamar essa
função em vez de repetir a query. `src/proxy.ts` agora importa
`getAuthUser` de `@/api/data/admin` e chama com o client Edge que ele
mesmo constrói — só a construção do client fica local ao middleware, a
lógica de autenticação vem de `src/api/`.

Validado com `pnpm build` (o build do Next.js compila o middleware
separado e acusaria incompatibilidade de Edge runtime) e com `pnpm dev`
rodando `curl` em `/admin` e `/admin/soufit-rio` sem sessão — ambos
redirecionam (307) para `/admin/login`, que continua respondendo 200.

Não foi necessário alterar o texto do GATE-5 no CLAUDE.md — a regra
("fachada fina, chama src/api/") passou a ser literalmente verdadeira para
o `proxy.ts`, em vez de precisar virar uma exceção.

- [x] Feito, validado com build + teste manual.

---

## Etapa 6 — Classificar o que sobrou em `src/lib/`

- `src/lib/utils.ts` (`cn()`) — fica. Utilitário puro de frontend
  (Tailwind), sem acesso a banco/env sensível.
- `src/lib/slug.ts` (`slugify()`) — fica. Função pura, usada por
  `campaign-form.tsx` no client; não tem motivo pra ir para `src/api/`.
- `src/lib/supabase.ts` — sem consumidores encontrados (ver nota na Etapa
  1). Decida: apagar, ou mover pra `src/api/clients/` se descobrir uso
  futuro.

- [ ] Feito.

---

## Etapa 7 — Atualizar o CLAUDE.md

Adicionar na seção `<engenharia>` a convenção nova, para valer em toda
feature futura:

```
BACKEND:
  local: src/api/ (clients/, data/, actions/) — única pasta com lógica de servidor
  policy: src/components/ e src/hooks/ nunca importam client de infra (supabase-admin, resend) direto — só via src/api/
  policy: Server Components em src/app/ podem importar src/api/data/* direto (padrão App Router)
  policy: route handlers em src/app/api/**/route.ts são fachada fina — chamam src/api/, não implementam lógica ali
```

- [ ] Feito.

---

## Etapa 8 — Checklist de validação final

```bash
pnpm build
pnpm lint
```

Teste manual (rodando `pnpm dev`):
- [ ] Login admin funciona
- [ ] Criar campanha funciona
- [ ] Convidar admin funciona (e-mail via Resend)
- [ ] Remover admin / trocar principal funciona
- [ ] Form de contato envia
- [ ] `/api/test` responde com campanha + missões
- [ ] Nenhum `page.tsx`/`component` fora de `src/api/` importa
      `supabase-admin`, `supabase-server` ou `resend` diretamente:
      ```bash
      grep -rln "supabase-admin\|supabase-server\|@/api/clients/resend" src/app src/components src/hooks
      ```
      (deve retornar vazio, exceto arquivos dentro de `src/api/`)

- [ ] Migração concluída.
