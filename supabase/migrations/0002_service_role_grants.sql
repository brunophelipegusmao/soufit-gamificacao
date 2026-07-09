-- O service_role nunca tinha recebido GRANT explícito em nenhuma tabela do
-- projeto (só anon/authenticated foram configurados na criação do schema
-- original). Isso bloqueia qualquer escrita feita pelo painel admin via
-- service role key (criação de campanha, convite de admin), mesmo o
-- service_role tendo BYPASSRLS.

grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

-- Garante que tabelas futuras também herdem isso automaticamente.
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
