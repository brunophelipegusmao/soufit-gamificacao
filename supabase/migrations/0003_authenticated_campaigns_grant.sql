-- Até agora o app inteiro usava só a chave anon (participantes de campanha
-- não passam pelo Supabase Auth). O painel admin é a primeira coisa a usar
-- o papel authenticated do Postgres, e ele nunca recebeu GRANT em campaigns.
grant select on public.campaigns to authenticated;
