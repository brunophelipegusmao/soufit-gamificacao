# SOUFIT-GAMIFICACAO | lang:pt-BR | for-AI-parsing | optimize=results-over-format

<user>
role: dev único e responsável pelo código
style: direto, sem validação emocional, sem elogios
expects: verdade útil, análise estratégica, questionamento de premissas
not-expected: gentileza excessiva, suavização, elogios desnecessários
</user>

<project>
name: Soufit Gamificação
type: microsite de campanha multi-tenant
goal: plataforma reutilizável — escrever uma vez, rodar em múltiplas campanhas via configuração
client: Soufit (marca de suplementos nova no Rio de Janeiro)
first-campaign: JM Fitness Studio + academias parceiras no RJ
scope: apenas código — divulgação é responsabilidade de outro time
</project>

<gates label="hard gates | priority: gates>rules>rhythm | missing=STOP">

GATE-1 multi-tenant:
  trigger: qualquer feature nova
  action: verificar se está escopada por campaign_id
  policy: toda entidade do banco DEVE ter campaign_id — sem exceção
  violation: dado sem campaign_id = bug de arquitetura, não de lógica
  exceção: users e superadmins são identidade GLOBAL (sem campaign_id) — o escopo por campanha entra pela tabela de vínculo (campaign_participants, campaign_admins), não pela linha em si

GATE-2 custo-zero:
  trigger: sugestão de serviço/infra
  action: verificar se tem free tier suficiente para escala de campanha (centenas, não milhões)
  banned: Firebase | AWS sem free tier | serviços pagos sem alternativa gratuita equivalente
  exception: serviço pago só se não existir alternativa gratuita viável
  exception: Upstash Redis liberado para cache de queries do banco — free tier (10k comandos/dia) cobre a escala do projeto

GATE-3 simplicidade:
  trigger: decisão de arquitetura
  action: escolher a opção mais simples que resolve o problema real
  banned: over-engineering | NestJS (descartado) | microsserviços | filas complexas
  policy: Next.js API Routes resolve — não adicionar camadas sem necessidade comprovada

GATE-4 validação-qr:
  trigger: registro de missão cumprida
  action: verificar qr_scans se user_id + qr_code_id já existe hoje
  policy: QR Code físico é o mecanismo de validação principal — automático, sem intervenção humana
  exception: missões do tipo 'manual' passam pelo painel admin | 'auto' não exige validação

GATE-5 separação-backend:
  trigger: qualquer código novo em src/
  action: verificar se lógica de servidor (client de infra, service_role key, segredo de API) está isolada em src/api/
  policy: backend SEMPRE separado do frontend — src/api/ (clients/ | data/ | actions/) é a única pasta com lógica de servidor
  policy: src/components/ e src/hooks/ nunca importam client de infra (supabase-admin, resend) direto — só via src/api/
  violation: client de infra, credencial ou lógica de acesso a dado fora de src/api/ = bug de arquitetura e risco de segurança (vazamento de credencial pro bundle client-side)
  exceção: Server Components em src/app/ podem importar src/api/data/* diretamente — padrão idiomático do App Router, não viola a separação
  exceção: src/app/api/**/route.ts e src/proxy.ts ficam na posição exigida pelo Next.js, mas são fachada fina — chamam src/api/, não implementam lógica ali
  migração: estado atual (código de backend ainda espalhado em src/actions/ e src/lib/) documentado em MIGRACAO-BACKEND-API.md — gate vale para código novo a partir de agora, migração do legado é gradual

</gates>

<rules>

STACK:
  frontend: Next.js 16 App Router
  ui-runtime: React 19
  linguagem: TypeScript — sem exceção, todo código em .ts/.tsx
  banco: Supabase (Postgres + Auth + Realtime + Storage)
  cache: Upstash Redis (free tier) — cache de queries do banco, não substitui Supabase como fonte da verdade
  ui-kit: shadcn/ui + Tailwind CSS v4
  validação: Zod (schemas de formulário e de server actions)
  forms: React Hook Form + Zod resolver
  data-fetching-client: React Query (Server Actions chamadas a partir de Client Components)
  input-mascarado: react-number-format — usar sempre que houver input com máscara
  deploy-frontend: Vercel (free tier)
  deploy-api: Next.js API Routes + Server Actions (sem servidor separado)
  package-manager: pnpm — não usar npm ou yarn
  qr-code: lib qrcode
  email: Resend (100/dia grátis)
  whatsapp: Z-API ou Evolution API
  banned: NestJS | S3 separado | Firebase | banco separado do Supabase

ROTEAMENTO:
  core: tudo escopado por /[campaign_slug]
  pattern: /[campaign_slug]/page.tsx → landing
  pattern: /[campaign_slug]/cadastro → formulário
  pattern: /[campaign_slug]/dashboard → XP + missões
  pattern: /[campaign_slug]/ranking → placar público
  pattern: /[campaign_slug]/qr/[token] → captura de scan
  pattern: /admin/[campaign_slug] → painel admin

BANCO:
  tabelas: campaigns | venues | campaign_venues | users | campaign_participants | missions | qr_codes | xp_logs | superadmins | campaign_admins
  view: campaign_ranking (query de ranking por campaign_id, via campaign_participants)
  rls: habilitado em users | xp_logs | missions | qr_codes | superadmins | campaign_admins | campaign_participants
  policy: ranking é leitura pública | escrita exige auth

MODELO-XP:
  cadastro: 100xp
  primeiro-login: 50xp
  check-in (qr): 20xp
  aula: 30xp
  story: 80xp
  feed: 150xp
  seguir-perfil: 30xp
  quiz: 40xp
  indicação: 100xp
  compra: 200xp

VALIDAÇÃO-MISSÃO:
  qr: scan do QR físico → automático → verifica max_per_day
  manual: admin aprova no painel
  auto: ação rastreável no sistema (ex: cadastro completo)

MISSÃO-INSTAGRAM:
  tipo: manual
  xp: 30xp (configurável por campanha em missions.xp_value)
  limitação: API do Meta não permite verificar follow programaticamente — bloqueado por privacidade
  fluxo-aluno: clicar em "seguir perfil" → tirar print mostrando que seguiu → fazer upload no sistema
  fluxo-admin: ver fila de prints pendentes no painel → aprovar ou rejeitar → XP creditado automaticamente
  banned: OAuth Instagram | verificação automática via API | código secreto no bio (vazamento fácil)
  decision: Opção A (print + validação manual) — única que funciona sem burocracia Meta e sem gambiarra

CAMPANHA:
  nova-campanha: insert em campaigns + venues + campaign_venues + missions + qr_codes
  action: zero código novo por campanha — apenas configuração no banco
  identity: primary_color + logo_url por campanha → CSS variable --brand no frontend

</rules>

<roles label="tipos de usuário e regras de acesso">

SUPERADMIN:
  tabela: superadmins (user_id -> auth.users)
  limite: 2 no máximo — trigger no banco (supabase/migrations/0005), não é só combinado
  vínculo: nenhum — não pertence a campanha nenhuma, gerencia a plataforma inteira
  pode: criar campanha | ver/gerenciar todas as campanhas | convidar, remover e trocar admin de qualquer campanha

ADMIN-CAMPANHA:
  tabela: campaign_admins (campaign_id, user_id, is_principal)
  limite: 3 por campanha — trigger no banco (supabase/migrations/0006)
  principal: exatamente 1 por campanha quando há admins — index único parcial (is_principal) + rebalanceamento na remoção fica na lógica da action, nunca no trigger
  principal-trava: só superadmin pode trocar ou remover o admin principal — nenhum admin (nem o próprio principal) pode se autopromover/remover isso
  multi-campanha: um mesmo admin pode estar em N campanhas — já é M:N por natureza da tabela
  pode: gerenciar a(s) própria(s) campanha(s) (missões, academias, aprovações — conforme for implementado)

PARTICIPANTE:
  tabela: users (identidade global: id, name, whatsapp unique, email, created_at) + campaign_participants (campaign_id, user_id, venue_id, lgpd_consent — o que varia por campanha)
  limite: nenhum
  multi-campanha: um mesmo participante pode estar em N campanhas, incluindo campanhas diferentes de marcas/eventos diferentes
  pode: cumprir missões, aparecer no ranking — escopado por campaign_id via campaign_participants, xp_logs e missions

</roles>

<engenharia label="convenções de código | aplica a todo código novo">

PRINCÍPIOS:
  persona: engenheiro sênior — TypeScript, React 19, Next.js 16 App Router, Supabase, shadcn/ui, Zod, Tailwind CSS v4
  código: limpo, conciso, manutenível — SOLID + Clean Code
  nomes: descritivos (isLoading, hasError) — nunca abreviações obscuras
  arquivos-pastas: kebab-case
  linguagem: TypeScript em 100% do código
  dry: evitar duplicação — extrair função/componente reutilizável quando repetir
  comentários: não escrever comentários desnecessários no código

DATA-FETCHING (React Query + Server Actions):
  regra: Client Components chamam Server Actions através de React Query — nunca fetch direto sem hook
  padrão: toda query/mutation do React Query vive em um hook customizado dedicado
  local-query: src/hooks/queries/
  local-mutation: src/hooks/mutations/
  policy: cada hook exporta a função de query/mutation key junto com o hook — nunca inline a key no componente

FORMS:
  validação: Zod schema sempre — nunca validação manual de formulário
  form-lib: React Hook Form + zodResolver
  wrapper: usar o componente Field (src/components/ui/field.tsx) como wrapper padrão de campo — criar se ainda não existir
  policy: nenhum form novo sem esse padrão (Zod + RHF + Field)

INPUT-MASCARADO:
  lib: react-number-format
  uso: telefone, CPF, valores monetários, qualquer input com máscara

SERVER ACTIONS:
  local: src/actions/
  estrutura: cada action em sua própria pasta com index.ts (lógica) + schema.ts (Zod schema)
  naming: pasta nomeada pela ação (ex: src/actions/credit-xp/, src/actions/approve-mission-proof/)

nota: referências de arquivo (cart-item.tsx, user-cart.ts, sign-in-form.tsx etc.) de outro projeto foram descartadas — este projeto ainda não tem esses componentes; os padrões acima valem a partir do primeiro arquivo criado em cada categoria.

</engenharia>

<rhythm>

nova-feature:
  1. verificar GATE-1 (escopado por campaign_id?)
  2. verificar GATE-2 (custo zero?)
  3. verificar GATE-3 (solução mais simples?)
  4. implementar

nova-campanha:
  1. insert em campaigns (slug único)
  2. insert em venues
  3. insert em campaign_venues
  4. insert em missions
  5. gerar qr_codes com token uuid por local + missão
  6. imprimir QR Codes físicos para o evento

scan-qr:
  1. usuário escaneia QR físico com câmera
  2. browser abre /[campaign_slug]/qr/[token]
  3. sistema verifica token → busca mission_id e xp_value
  4. verifica se já escaneou hoje (xp_logs)
  5. credita XP ou retorna erro de limite

</rhythm>

<conn>
supabase-url: NEXT_PUBLIC_SUPABASE_URL (variável de ambiente)
supabase-key: NEXT_PUBLIC_SUPABASE_ANON_KEY (variável de ambiente)
resend-key: RESEND_API_KEY (variável de ambiente — server only)
</conn>

<ref label="on-demand | read only">
/lib/supabase.ts → client singleton
/lib/campaigns.ts → getCampaignBySlug | getVenuesByCampaign
/lib/xp.ts → creditXp | hasScannedToday | getRanking
/lib/missions.ts → getMissionByQrToken | getMissionsByCampaign
/types/index.ts → Campaign | Venue | User | CampaignParticipant | Mission | XpLog | RankingEntry | Superadmin | CampaignAdmin
/lib/admin.ts → isSuperadmin | assertSuperadmin | getCampaignsForUser | assertCampaignAccess | listCampaignAdmins | countCampaignAdmins | removeCampaignAdmin | setPrincipalAdmin
</ref>

<decisions>
nestjs: descartado — over-engineering para o escopo real
redis: adotado via Upstash (free tier) — cache de queries do banco | ranking ao vivo continua via Supabase Realtime, Redis não substitui isso
s3: descartado — Supabase Storage é suficiente
validação-manual: descartada como mecanismo principal — gargalo operacional
auto-declarado: descartado — risco de trapaça
qr-code-físico: escolhido — automático, escalável, sem intervenção humana
next-puro: confirmado — API Routes substituem NestJS sem perda funcional
instagram-follow: verificação automática descartada — API do Meta bloqueada | solução: print + validação manual no painel admin
backend-separado: adotado — src/api/ é a única pasta com lógica de servidor, ver GATE-5 | migração do código legado (src/actions/, src/lib/) é gradual, guiada por MIGRACAO-BACKEND-API.md
</decisions>