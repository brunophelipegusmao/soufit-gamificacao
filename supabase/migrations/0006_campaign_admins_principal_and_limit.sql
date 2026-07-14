-- Admin de campanha ganha o conceito de "principal": exatamente 1 por
-- campanha quando há admins, e só um superadmin pode trocar ou remover esse
-- principal (checagem fica na Server Action — ver src/actions/
-- set-principal-admin e src/actions/remove-campaign-admin, ambas gated por
-- assertSuperadmin()). O banco garante duas coisas que não podem depender só
-- da aplicação: no máximo 1 principal por campanha, e no máximo 3 admins por
-- campanha (evita race condition entre dois convites simultâneos).

alter table campaign_admins
  add column is_principal boolean not null default false;

create unique index campaign_admins_principal_idx
  on campaign_admins (campaign_id)
  where is_principal;

create function limit_campaign_admins() returns trigger as $$
begin
  if (select count(*) from campaign_admins where campaign_id = new.campaign_id) >= 3 then
    raise exception 'Limite de 3 admins por campanha atingido.';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger limit_campaign_admins_trigger
  before insert on campaign_admins
  for each row execute function limit_campaign_admins();

-- Rebalanceamento do principal ao remover (promover o admin mais antigo
-- restante) fica só na aplicação (src/lib/admin.ts: removeCampaignAdmin) —
-- um trigger de DELETE pra isso seria mais complexo sem necessidade
-- comprovada, dado o baixo volume de escrita nessa tabela.
