# Contexto da sessão — Soufit Gamificação

> Registro do que foi feito, decidido e descoberto na sessão de trabalho com o
> Claude Code neste projeto. Não substitui o `CLAUDE.md` (regras/stack do projeto)
> — é um complemento com o histórico concreto do que já foi construído, convenções
> que emergiram na prática, e pontas soltas conhecidas.

## Estado atual das rotas públicas

| Rota | Status | Observação |
|---|---|---|
| `/` | Pronta | Header + HeroSection (vídeo de fundo) + Footer. Header+Hero preenchem exatamente 100dvh no desktop (`md:h-dvh` + `md:flex-1`), sem scroll extra; mobile cresce naturalmente com o conteúdo. |
| `/about` | Pronta | `AboutSection` compõe `HowWork` (steps numerados), `AboutServices` (compartilhado, ver abaixo), `AboutBenefects`. |
| `/services` | Pronta | Reaproveita `AboutServices` + `ServicesXpModel` (grid com as 10 missões do MODELO-XP do CLAUDE.md) + `ServicesValidation` (qr/manual/auto) + `ServicesCta`. |
| `/contact` | Pronta, com form funcional | Zod + RHF + `Field` + shadcn (`Input`/`Textarea`/`Select`/`PatternFormat` pro telefone) → Server Action `submit-contact-form` → envia e-mail via **Resend** (primeiro uso real do Resend no projeto). |
| `/pricing` | **Stub** | `PriceSection` só tem o cabeçalho ("Escolha o plano ideal..."); os cards de preço em si (`{/* Pricing cards will go here */}`) ainda não foram construídos. |

## Estado atual do `/admin`

Estrutura em route group `admin/(dashboard)/` (sidebar + shell) separado de
`admin/login/` e `admin/set-password/` (telas standalone, sem sidebar):

- **`admin/login/`** — tela cheia dividida em duas colunas (`LoginScreen` →
  `LoginHero` + `LoginPanel` → `LoginForm`). Login real via Supabase
  (`signInWithPassword`), RHF+Zod+`useLoginMutation`. Botão Google visível mas
  **não há OAuth configurado** (clicável, sem ação real — decisão explícita do
  usuário, não esconder/desabilitar). "Esqueceu senha" também sem fluxo real.
  Botão Apple foi removido a pedido.
- **`admin/set-password/`** — form de definir senha (fluxo de convite).
- **`admin/(dashboard)/layout.tsx`** — monta `SidebarProvider` + `AppSidebar` +
  `SidebarInset`. Sidebar retrátil (`collapsible="icon"`).
- **`admin/(dashboard)/page.tsx`** — dashboard: campanhas agrupadas em
  "Ativas"/"Desativadas" (`campaign.active`), cards via `CampaignCard`. Superadmin
  cai aqui direto no login (não mais redirecionado pra `/new-campaign`
  automaticamente — isso foi tentado e revertido a pedido).
- **`admin/(dashboard)/new-campaign/`** — form de criar campanha, grid de 12
  colunas (Campanha | Admin da campanha / Academias | Missões). Academias e
  Missões extraídas em `venues-section.tsx`/`missions-section.tsx`, ambas com
  **paginação de 5 itens por página** (shadcn `Pagination`, tamanho fixo — não
  altura medida via JS, ver "Decisões" abaixo). Missões usam um **Dialog** (não
  linha inline) pra adicionar/editar, com distinção visual "Padrão" (badge) pras
  10 missões seedadas vs. as criadas na hora — o campo `isDefault` viaja no
  próprio item do array (client-only, o Zod descarta ao chegar no servidor).
  Botão "Criar campanha" fica na mesma linha do `<h1>`, não mais no rodapé.
- **`admin/(dashboard)/[campaign_slug]/`** — só tem o form de convidar admin da
  campanha (`invite-admin-form.tsx`) por enquanto.

## Organização de componentes (convenção do usuário)

Estabelecida pelo usuário nesta sessão, aplicar daqui pra frente:

- **Usado em mais de uma rota** → `src/components/common/` (ex: `header.tsx`,
  `footer.tsx`, `hero-section.tsx`, `about-services.tsx` — este último foi
  movido de `app/about/components/` pra `common/` porque também é usado em
  `/services`).
- **Usado só numa rota** → `app/<rota>/components/` (ex: `about-how-work.tsx`,
  `contact-form.tsx`, `services-xp-model.tsx`).
- **Compartilhado só dentro de `/admin`** (não é "common" pro site inteiro, mas
  é usado por mais de uma sub-rota do admin) → solto direto em `src/app/admin/`
  (ex: `app-sidebar.tsx`, `campaign-card.tsx`, `campaign-section.tsx`,
  `list-pagination.tsx`). Não é `admin/components/` nem `admin/(dashboard)/components/`
  — é a raiz de `admin/`.
- `src/components/ui/` continua só pros componentes gerados pelo shadcn.

## shadcn/ui — como este projeto usa

- **Style**: `base-nova`, tudo construído sobre `@base-ui/react` (não Radix —
  Radix não é dependência do projeto). Confirmar isso sempre que um componente
  novo for adicionado via CLI, pra não quebrar consistência.
- **MCP do shadcn nunca conectou nesta sessão**, apesar de múltiplas tentativas
  e o usuário relatar ter conectado. Fallback usado o tempo todo, já validado:
  `pnpm dlx shadcn@latest add <componente>`.
- **Componentes instalados até agora**: badge, button, card, checkbox, dialog,
  field (próprio do projeto, não shadcn), input, pagination, select, separator,
  sheet, sidebar, skeleton, textarea, tooltip.
- **Gotcha do `Button`**: quando `render` aponta pra um elemento que não é
  `<button>` (ex: `<a>`, `next/link`), é obrigatório passar `nativeButton={false}`,
  senão o base-ui loga erro em runtime ("expected a native `<button>`").
  `SidebarMenuButton`/`DialogClose` usam `useRender` genérico e não têm esse
  requisito.
- **Padrão de integração com React Hook Form**: `Select` e `Checkbox` do shadcn
  não são inputs nativos — sempre via `Controller` (`value`/`onValueChange` pro
  Select, `checked`/`onCheckedChange` pro Checkbox), nunca `register()` direto.
- **Ícones de marca** (Google, Apple, Instagram, Facebook, YouTube, LinkedIn):
  `lucide-react` (v1.24 instalada) **não tem mais ícones de marca** (removidos
  por questão de trademark). Técnica usada: `curl -sf
  https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/<nome>.svg` pra pegar o
  path SVG oficial exato e embutir inline — nunca desenhar path de memória.
- **`use-mobile.ts`** (gerado pelo `shadcn add sidebar`) tinha um bug real de
  lint (setState síncrono dentro de `useEffect`, sinalizado pelo React
  Compiler) — corrigido movendo o valor inicial pro lazy initializer do
  `useState`.

## Tokens e convenções visuais (`globals.css`)

- Paleta: `--background`, `--foreground`, `--primary` (verde marca),
  `--accent` (verde, tom ligeiramente diferente), `--muted-foreground`,
  `--destructive`, mais os tokens `--sidebar*` (usados pelo componente Sidebar).
- **Par CTA de ação** (botão que dispara ação): `bg-accent text-background
  hover:bg-primary` — usado em hero, footer, services-cta, contact-form,
  login-form.
- **Par decorativo** (badge/ícone, não clicável): `bg-primary text-primary-foreground`
  ou `bg-primary/10 border-primary/30 text-primary` — usado nos "eyebrows"
  (pill acima dos títulos) e ícones-quadrado dos cards.
- Classes utilitárias próprias: `.hero-overlay` (gradiente escuro sobre
  vídeo/imagem de fundo), `.green-glow`, `.text-glow`, `.pulse-dot`.
- Breakpoint principal do projeto é `md:`; `sm:`/`lg:`/`xl:` só entram quando
  há uma razão concreta (ex: CTAs empilhando cedo demais, cards com muito
  espaço sobrando em telas largas).

## Decisões de design registradas (com o porquê)

- **Paginação (Academias/Missões) é de tamanho fixo (5 itens), não medição de
  altura via JS.** Motivo: altura de linha é previsível, então um N fixo já
  limita a altura do card na prática, sem a complexidade de
  ResizeObserver/recálculo em resize.
- **Painel admin não deve fazer scroll de página inteira** — é uma ferramenta
  desktop, o shell (`SidebarInset`) é fluido (`w-full flex-1`, sem `max-w`
  artificial) pra acompanhar o tamanho da tela.
- **Botões OAuth/forgot-password no login: visíveis, não desabilitados**,
  mesmo sem funcionalidade real por trás — decisão explícita do usuário
  (replica o mockup como veio).
- **Sidebar do admin tem uma seção "Gestão de campanha" com itens placeholder
  desabilitados** (Visão geral, Missões, Academias/Locais, QR Codes, Aprovações
  pendentes, Ranking, Administradores) e uma seção "Relatórios" (Engajamento,
  Exportar dados) — o usuário ainda não decidiu a estrutura completa de gestão
  de campanha, pediu ideias fundamentadas no modelo de dados do CLAUDE.md,
  vai aceitar/trocar/remover conforme for implementando.
- **Ícone de botão `icon-sm` (28px) mantido** mesmo abaixo do guideline de
  44×44px de touch target — é o baseline do próprio shadcn usado em todo o
  design system (sidebar, sheet), ferramenta desktop de admin, não superfície
  touch-first.

## Pendências / avisos conhecidos (não resolvidos, sinalizados ao usuário)

- **`RESEND_API_KEY` vazio no `.env`** — o envio de e-mail do form de contato
  vai falhar até isso ser configurado.
- **`from: "onboarding@resend.dev"`** no `submit-contact-form` é o remetente
  sandbox do Resend — trocar pra um domínio verificado quando houver um.
- **`to: contato@eventsfitness.com.br`** (contact form) é e-mail placeholder.
- **Campo `description` de missão** existe no schema (`missionSchema`) e agora
  tem input no Dialog de missões — mas antes da reestilização ficou muito
  tempo sem UI nenhuma; verificar se isso não afeta dados de campanhas
  criadas antes dessa mudança (não há migração de dados envolvida, é só
  formulário).
- **`/pricing` é só um esqueleto** — cabeçalho pronto, cards de preço não
  implementados.
- **Um acidente de reorganização já aconteceu nesta sessão**: ao mover
  componentes para `common/`, o usuário apagou (não moveu) toda a árvore
  `admin/(dashboard)/`, `admin/login/`, `admin/set-password/` do disco. Foi
  recuperado via `git checkout` (estava tudo commitado). **Lição**: ao
  reorganizar arquivos manualmente, conferir com `git status` se apareceu
  `D` (deletado) em vez de rename — o Git não detecta renome automático em
  arquivos ainda não commitados, então mover errado parece exclusão.

## Stack confirmada em uso (além do que já está no CLAUDE.md)

- `react-hook-form` ^7.81, `zod` ^4.4, `@hookform/resolvers`, `react-number-format`
  ^5.4 (máscara de telefone), `resend` ^6.16, `@tanstack/react-query`,
  `lucide-react` ^1.24 (sem ícones de marca), `clsx`.
- Server Actions em `src/actions/<nome-da-ação>/{index.ts,schema.ts}`:
  `create-campaign`, `invite-admin`, `login`, `logout`, `submit-contact-form`.
- Mutations em `src/hooks/mutations/use-<nome>-mutation.ts`, uma pra cada
  action acima (exceto `logout`, que é chamada direto via `<form action={logout}>`).
