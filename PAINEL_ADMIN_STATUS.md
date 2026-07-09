# Status: Painel Superadmin + Admin de Campanha

Documento de handoff — lido isso pra saber exatamente onde parou.

## O que existe

Dois níveis de acesso, autenticados via Supabase Auth (email+senha):

- **Superadmin** (você, `bruno.mulim.prog@gmail.com`): loga em `/admin/login`, cai em `/admin` vendo todas as campanhas, cria campanhas completas em `/admin/nova-campanha` (campaign + venues + missions + qr_codes num fluxo só), e convida o admin de cada campanha por email a partir de `/admin/[campaign_slug]`.
- **Admin de campanha**: convidado por email pelo superadmin, define a própria senha em `/admin/set-password`, loga e cai direto na campanha dele em `/admin/[campaign_slug]` (sem ver outras campanhas nem a seção de convite).

Rotas: `/admin/login`, `/admin`, `/admin/nova-campanha`, `/admin/[campaign_slug]`, `/admin/set-password`.

Arquivos principais: `src/proxy.ts` (gate de sessão — substitui `middleware.ts`, descontinuado no Next 16), `src/lib/admin.ts` (DAL: `verifySession`, `isSuperadmin`, `assertSuperadmin`, `assertCampaignAccess`, `getCampaignsForUser`, `listCampaignAdmins`), `src/lib/invite-admin.ts` (convite via `inviteUserByEmail` + fallback `generateLink` pra quem já tem conta), `src/lib/supabase-{server,browser,admin}.ts` (clients), tudo em `src/app/admin/**`.

## Banco de dados

Duas tabelas novas, com 4 migrations em `supabase/migrations/` — **todas já rodadas** por você no SQL Editor:

- `0001_admin_access.sql` — cria `superadmins` e `campaign_admins`, RLS.
- `0002_service_role_grants.sql` — o `service_role` nunca tinha GRANT em nenhuma tabela do projeto (schema original só previa a chave `anon`). Sem isso, toda escrita do painel dava "permission denied".
- `0003_authenticated_campaigns_grant.sql` — o papel `authenticated` também nunca tinha GRANT em `campaigns` (é a primeira vez que o projeto usa esse papel — os participantes de campanha não passam pelo Supabase Auth).
- `0004_fix_campaign_admins_recursion.sql` — a policy original de `campaign_admins` causava recursão infinita (consultava a própria tabela dentro da policy). Simplificada pra "vê a própria linha OU é superadmin".

**Bootstrap já feito:** seu usuário (`bruno.mulim.prog@gmail.com`) está inserido em `superadmins`.

**Campanha de teste:** `sou-fit` (slug) foi criada com sucesso — 1 venue, 10 missões (defaults do MODELO-XP do CLAUDE.md), 2 qr_codes gerados (Check-in e Aula, os únicos tipo `qr`). Nenhum admin de campanha vinculado a ela no momento (os usuários de teste foram apagados durante o debug, ver abaixo).

## Bugs encontrados e corrigidos nesta sessão

1. `src/app/page.tsx` (rota raiz `/`) estava com JSX quebrado desde um commit anterior, sem relação com esse trabalho — quebrava o `tsc` do projeto inteiro. Reduzido pra um `return null` mínimo (não é uma rota usada por este projeto multi-tenant).
2. `supabase-admin.ts` criava o client no import do módulo — quebrava até `/admin/login` (que nem usa a service key) se a env var estivesse vazia. Virou lazy (`getSupabaseAdmin()`).
3. Grants faltando pra `service_role` e `authenticated` (migrations 0002 e 0003).
4. Recursão infinita na policy de `campaign_admins` (migration 0004).
5. **O bug mais importante**: o client de browser (`@supabase/ssr`) força `flowType: "pkce"` e não dá pra desligar, mas `inviteUserByEmail`/`generateLink` geram links no formato antigo ("implicit grant", tokens no `#hash`). O auth-js rejeita esse hash de propósito por descompasso de flow (`AuthPKCEGrantCodeExchangeError: Not a valid PKCE flow url.`), o que aparecia pro usuário como "Link inválido ou expirado." Corrigido em `src/app/admin/set-password/set-password-form.tsx`: agora parseia `access_token`/`refresh_token` do hash manualmente e chama `supabase.auth.setSession(...)` direto, sem depender da detecção automática. **Validado via simulação com jsdom antes de aplicar** (não dependi só de teoria).
6. `invite-admin.ts` tratava **qualquer** erro do `inviteUserByEmail` como "email já registrado" e caía num fallback silencioso — escondendo erros reais. Corrigido pra só cair no fallback quando o `error.code` for de fato `email_exists`/`user_already_exists`/`identity_already_exists`; qualquer outro erro (rate limit, etc.) agora aparece de verdade pro superadmin.
7. Mensagem de sucesso do convite agora diferencia "convite enviado por email" de "usuário já existia, acesso concedido sem email" (antes dizia "sucesso" nos dois casos, o que gerou confusão).

## Onde parou / bloqueio atual

Estourei o rate limit de email do mailer padrão do Supabase (`over_email_send_rate_limit`, 429) de tanto reenviar convite de teste. **Você optou por só esperar o limite resetar** (janela costuma ser por hora) em vez de configurar SMTP customizado agora.

O fix do bug #5 (o principal) **foi validado via simulação (jsdom + tokens reais do Supabase), mas ainda não foi confirmado num navegador de verdade ponta a ponta**, porque o rate limit bloqueou o reenvio do email de teste depois da correção.

## Próximos passos (retomar por aqui)

1. Esperar uns 30-60min do último 429 (ou configurar Resend como SMTP em **Authentication → Emails → SMTP Settings** no Supabase — o projeto já vai usar Resend mesmo, é o setup certo pra produção e remove esse limite).
2. Ir em `/admin/sou-fit`, convidar um email de teste (novo, não use um que já tentamos: `bruno.mulim.prog@gmail.com` e `brunomulim@gmail.com` já foram usados e apagados algumas vezes).
3. Abrir o email, clicar no link, confirmar que cai direto na tela de definir senha (sem "Link inválido ou expirado"), definir senha, confirmar login e que só vê a campanha `sou-fit`.
4. Se der tudo certo, o painel admin está pronto. Próxima feature natural pelo roadmap do CLAUDE.md: `/[campaign_slug]/cadastro` (formulário de inscrição do aluno).

## Pendências que não são bugs, só avisos

- Nada foi commitado ainda (`git status` mostra tudo como não commitado) — decida quando commitar.
- `.env` tem `SUPABASE_SERVICE_ROLE_KEY` preenchida — nunca commitar esse arquivo (já está no `.gitignore`).
- Rate limit de email do Supabase sem SMTP customizado é bem restritivo — não é um problema de código, é do plano free sem SMTP configurado.
- Fluxo de "esqueci minha senha" ainda não existe (mencionado no plano original como fora de escopo).
