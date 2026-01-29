-- Função para verificar se e-mail ou telefone já existem sem expor a tabela profiles via RLS
create or replace function check_user_exists(email_to_check text)
returns boolean
language plpgsql
security definer -- Executa com privilégios de administrador
as $$
begin
  return exists (
    select 1 from profiles 
    where email = email_to_check     
  );
end;
$$;
