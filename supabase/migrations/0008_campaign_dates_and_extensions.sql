-- Plataforma de evento: contract_* é a janela de disponibilização
-- contratada (só superadmin edita); event_* são as datas do evento em si,
-- informadas depois pelo campaign_admin, sem relação automática com as
-- datas de contrato — a única regra é o evento caber dentro da janela
-- contratada (ver check constraint abaixo). rename preserva o tipo e os
-- dados das colunas existentes.
alter table campaigns rename column starts_at to contract_starts_at;
alter table campaigns rename column ends_at to contract_ends_at;
alter table campaigns add column event_starts_at timestamptz;
alter table campaigns add column event_ends_at timestamptz;

alter table campaigns add constraint campaigns_event_within_contract check (
  (event_starts_at is null or event_starts_at >= contract_starts_at)
  and (event_ends_at is null or event_ends_at <= contract_ends_at)
  and (event_starts_at is null or event_ends_at is null or event_starts_at <= event_ends_at)
);

-- Campaign_admin solicita prorrogação do encerramento da plataforma
-- (contract_ends_at); só superadmin aprova. No máximo 1 pedido pending por
-- campanha por vez (mesmo padrão do índice parcial de admin principal na
-- migration 0006) — evita solicitação duplicada empilhada.
create table campaign_extension_requests (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  requested_by uuid not null references auth.users(id) on delete cascade,
  requested_until timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table campaign_extension_requests enable row level security;

create unique index campaign_extension_requests_one_pending_idx
  on campaign_extension_requests (campaign_id)
  where status = 'pending';

-- Sem policy de insert/update/delete: escrita passa pelo service_role nas
-- Server Actions (request-campaign-extension, review-campaign-extension),
-- que já checam autorização — mesmo padrão de superadmins/campaign_admins
-- na migration 0001. service_role já tem grant automático em tabelas
-- novas (alter default privileges da migration 0002).
create policy "admin da campanha ve os proprios pedidos, superadmin ve todos"
  on campaign_extension_requests for select
  to authenticated
  using (
    campaign_id in (select campaign_id from campaign_admins where user_id = auth.uid())
    or exists (select 1 from superadmins where user_id = auth.uid())
  );

grant select on public.campaign_extension_requests to authenticated;
