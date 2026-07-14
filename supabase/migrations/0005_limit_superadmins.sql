-- Superadmin é papel global (gerencia a plataforma inteira, não amarrado a
-- campanha nenhuma) e precisa ficar restrito a exatamente 2 contas — trava
-- técnica real, não só um combinado entre humanos. Trigger em vez de checagem
-- só na aplicação porque o insert de superadmin normalmente é feito à mão no
-- SQL Editor (bootstrap manual), não passa por Server Action nenhuma.

create function limit_superadmins() returns trigger as $$
begin
  if (select count(*) from superadmins) >= 2 then
    raise exception 'Limite de 2 superadmins atingido.';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger limit_superadmins_trigger
  before insert on superadmins
  for each row execute function limit_superadmins();
