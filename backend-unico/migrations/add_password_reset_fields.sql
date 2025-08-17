-- Migração para adicionar campos de recuperação de senha na tabela companies
-- Executar: psql -d seu_banco -f add_password_reset_fields.sql

-- 1. Adicionar campo email se não existir
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- 2. Adicionar campo password_reset_token para armazenar token de recuperação
ALTER TABLE companies ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(500);

-- 3. Adicionar campo password_reset_expires para controlar expiração do token
ALTER TABLE companies ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP;

-- 4. Verificar se as alterações foram aplicadas
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'companies' 
  AND column_name IN ('email', 'password_reset_token', 'password_reset_expires')
ORDER BY column_name;

-- 5. Comentários sobre os campos
COMMENT ON COLUMN companies.email IS 'E-mail da empresa para contato e recuperação de senha';
COMMENT ON COLUMN companies.password_reset_token IS 'Token para recuperação de senha';
COMMENT ON COLUMN companies.password_reset_expires IS 'Data de expiração do token de recuperação';
