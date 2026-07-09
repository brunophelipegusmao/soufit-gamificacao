-- Painel administrativo: superadmins (acesso global) + campaign_admins (acesso por campanha)
-- Rodar manualmente no SQL Editor do Supabase.

create table superadmins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table superadmins enable row level security;

create policy "superadmin ve a propria linha"
  on superadmins for select
  to authenticated
  using (user_id = auth.uid());

create table campaign_admins (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (campaign_id, user_id)
);

alter table campaign_admins enable row level security;

create policy "admin ve a propria campanha, superadmin ve todas"
  on campaign_admins for select
  to authenticated
  using (
    campaign_id in (
      select campaign_id from campaign_admins where user_id = auth.uid()
    )
    or exists (select 1 from superadmins where user_id = auth.uid())
  );

-- Sem policies de insert/update/delete: todo write nessas duas tabelas passa
-- pelo client com a service role key, dentro de Server Actions que já checaram
-- autorização (bootstrap manual para superadmins; convite de admin de campanha
-- exige ser superadmin, checado em src/lib/admin.ts).

-- GRANTs: tabelas criadas via SQL Editor não herdam automaticamente os
-- privilégios que as tabelas originais do schema já tinham. Sem isso o
-- service_role recebe "permission denied" mesmo bypassando RLS.
grant select, insert, update, delete on public.superadmins to service_role;
grant select on public.superadmins to authenticated;

grant select, insert, update, delete on public.campaign_admins to service_role;
grant select on public.campaign_admins to authenticated;

-- Bootstrap manual do primeiro superadmin (rodar depois de criar o usuário em
-- Authentication > Add user no Supabase Dashboard):
-- insert into superadmins (user_id) values ('<uid-do-usuario>');
