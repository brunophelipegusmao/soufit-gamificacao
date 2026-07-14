-- Participante hoje é preso a uma única campanha (users.campaign_id fixo).
-- Isso vira multi-campanha: users passa a ser identidade global (nome,
-- whatsapp, email), e campaign_participants guarda o que varia por campanha
-- (venue, consentimento LGPD). GATE-1 (multi-tenant) ganha uma exceção
-- explícita aqui: users/superadmins são identidade global sem campaign_id,
-- o escopo por campanha entra pela tabela de vínculo — ver nota no CLAUDE.md.
--
-- Não existe fluxo de cadastro de participante implementado ainda, e o
-- projeto está sendo montado do zero no lado de dados: a única tabela que
-- precisa sobreviver a qualquer reset é `superadmins`. Por isso este script
-- não faz backfill nenhum, só limpa os dados de teste antes de alterar o
-- schema.

create table campaign_participants (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  venue_id uuid not null references venues(id),
  lgpd_consent boolean not null default false,
  created_at timestamptz not null default now(),
  unique (campaign_id, user_id)
);

alter table campaign_participants enable row level security;

-- Participantes hoje não logam via Supabase Auth (só o painel admin usa
-- authenticated); esta policy só passa a valer se/quando isso mudar. Leitura
-- pública de ranking passa pela view campaign_ranking, não por esta tabela.
create policy "participante ve a propria linha"
  on campaign_participants for select
  to authenticated
  using (user_id = auth.uid());

grant select, insert, update, delete on public.campaign_participants to service_role;
grant select on public.campaign_participants to authenticated;

drop view if exists campaign_ranking;

truncate table users cascade;

alter table users
  drop column campaign_id,
  drop column venue_id,
  drop column lgpd_consent;

alter table users
  add constraint users_whatsapp_unique unique (whatsapp);

-- xp_logs não tem campaign_id direto (só mission_id); o XP só conta pro
-- ranking de uma campanha se a missão pertencer a ela — por isso o join com
-- xp_logs passa por missions, não direto por user_id (evita somar XP de
-- outra campanha do mesmo participante).
create view campaign_ranking as
select
  u.id as user_id,
  u.name,
  v.name as venue_name,
  cp.campaign_id,
  coalesce(sum(xl.points), 0) as total_xp,
  count(xl.id) as total_actions,
  rank() over (
    partition by cp.campaign_id
    order by coalesce(sum(xl.points), 0) desc
  ) as position
from campaign_participants cp
join users u on u.id = cp.user_id
join venues v on v.id = cp.venue_id
left join missions m on m.campaign_id = cp.campaign_id
left join xp_logs xl on xl.user_id = cp.user_id and xl.mission_id = m.id
group by u.id, u.name, v.name, cp.campaign_id;

grant select on public.campaign_ranking to authenticated, anon;
