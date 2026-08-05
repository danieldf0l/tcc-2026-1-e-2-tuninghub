-- =============================================================
-- SEED: Admin Master (NivelAcesso = 'SUPER')
-- =============================================================
-- Objetivo: garantir que sempre exista pelo menos um administrador
-- com acesso total (SUPER) no banco, pois o cadastro de novos admins
-- via API (POST /api/admin) exige um token de ADMIN_MASTER já
-- autenticado -- ou seja, o primeiro precisa existir "por fora" da API.
--
-- COMO GERAR O HASH DA SENHA:
-- No terminal, na pasta do projeto (api-tuninghub), rode:
--
--   node -e "import('bcrypt').then(b => b.default.hash('SUA_SENHA_AQUI', 10).then(console.log))"
--
-- Copie o valor impresso (começa com $2b$10$...) e cole no lugar
-- de 'COLE_O_HASH_AQUI' abaixo. NUNCA use a senha em texto puro.
--
-- Exemplo de hash gerado (senha de exemplo "TuningHub@2026"), 
-- apenas para referência de formato -- gere o seu próprio antes de usar:
--   $2b$10$1WmezkjPLeQtLGs8TH2OH.sjSOGgwhR7HMoBkPAxtmgnufnRVVlwC
--
-- COMO USAR:
-- 1. Gere o hash da senha desejada (comando acima).
-- 2. Substitua e-mail e hash abaixo.
-- 3. Rode este script no schema desejado (ex: tuninghub_teste).
-- 4. Guarde a senha em texto puro em local seguro (gerenciador de
--    senhas do grupo) -- ela não fica salva em lugar nenhum do banco.
-- =============================================================

INSERT INTO admin (Nome, Email, Senha, NivelAcesso)
SELECT 'Admin Master', 'master@tuninghub.com', 'COLE_O_HASH_AQUI', 'SUPER'
WHERE NOT EXISTS (
  SELECT 1 FROM admin WHERE Email = 'master@tuninghub.com'
);

-- O WHERE NOT EXISTS acima evita duplicar o admin master se o script
-- for executado mais de uma vez por engano (idempotente).
