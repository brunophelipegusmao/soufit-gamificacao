-- A policy original consultava campaign_admins dentro da própria policy de
-- campaign_admins ("ver outras campanhas onde eu também sou admin"), o que
-- causa "infinite recursion detected in policy" no Postgres. Na prática o
-- app só precisa: (a) o próprio usuário ver sua própria linha, (b) o
-- superadmin ver todas — nunca um admin vendo linhas de outros admins.
drop policy "admin ve a propria campanha, superadmin ve todas" on campaign_admins;

create policy "ve a propria linha ou superadmin ve todas"
  on campaign_admins for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (select 1 from superadmins where user_id = auth.uid())
  );
