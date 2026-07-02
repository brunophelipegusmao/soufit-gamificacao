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

GATE-2 custo-zero:
  trigger: sugestão de serviço/infra
  action: verificar se tem free tier suficiente para escala de campanha (centenas, não milhões)
  banned: Firebase | AWS sem free tier | serviços pagos sem alternativa gratuita equivalente
  exception: serviço pago só se não existir alternativa gratuita viável

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

</gates>

<rules>

STACK:
  frontend: Next.js 14 App Router
  banco: Supabase (Postgres + Auth + Realtime + Storage)
  deploy-frontend: Vercel (free tier)
  deploy-api: Next.js API Routes (sem servidor separado)
  package-manager: pnpm — não usar npm ou yarn
  qr-code: lib qrcode
  email: Resend (100/dia grátis)
  whatsapp: Z-API ou Evolution API
  banned: NestJS | Redis | S3 separado | Firebase | banco separado do Supabase

ROTEAMENTO:
  core: tudo escopado por /[campaign_slug]
  pattern: /[campaign_slug]/page.tsx → landing
  pattern: /[campaign_slug]/cadastro → formulário
  pattern: /[campaign_slug]/dashboard → XP + missões
  pattern: /[campaign_slug]/ranking → placar público
  pattern: /[campaign_slug]/qr/[token] → captura de scan
  pattern: /admin/[campaign_slug] → painel admin

BANCO:
  tabelas: campaigns | venues | campaign_venues | users | missions | qr_codes | xp_logs
  view: campaign_ranking (query de ranking por campaign_id)
  rls: habilitado em users | xp_logs | missions | qr_codes
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
/types/index.ts → Campaign | Venue | User | Mission | XpLog | RankingEntry
</ref>

<decisions>
nestjs: descartado — over-engineering para o escopo real
redis: descartado — Supabase Realtime resolve ranking ao vivo
s3: descartado — Supabase Storage é suficiente
validação-manual: descartada como mecanismo principal — gargalo operacional
auto-declarado: descartado — risco de trapaça
qr-code-físico: escolhido — automático, escalável, sem intervenção humana
next-puro: confirmado — API Routes substituem NestJS sem perda funcional
instagram-follow: verificação automática descartada — API do Meta bloqueada | solução: print + validação manual no painel admin
</decisions>