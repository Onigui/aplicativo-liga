-- Migração para adicionar campos de autenticação na tabela companies
-- Executar: psql -d seu_banco -f add_company_auth_fields.sql

-- 1. Adicionar campo password_hash para armazenar senha criptografada
ALTER TABLE companies ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- 2. Adicionar campo is_active para controlar se a empresa está ativa
ALTER TABLE companies ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 3. Adicionar campo name para armazenar o nome da empresa
ALTER TABLE companies ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- 4. Adicionar campo city e state se não existirem
ALTER TABLE companies ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS state VARCHAR(2);

-- 5. Adicionar campo discount_percent se não existir
ALTER TABLE companies ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 10;

-- 6. Atualizar empresas existentes para ter um nome padrão
UPDATE companies SET name = company_name WHERE name IS NULL OR name = '';

-- 7. Tornar o campo name obrigatório (após preencher)
ALTER TABLE companies ALTER COLUMN name SET NOT NULL;

-- 8. Converter campo discount existente para discount_percent se necessário
UPDATE companies 
SET discount_percent = CAST(REPLACE(discount, '%', '') AS INTEGER) 
WHERE discount_percent IS NULL AND discount LIKE '%';

-- 9. IMPORTANTE: Definir senhas padrão para empresas existentes
-- Senha padrão: "123123" (hash bcrypt)
UPDATE companies 
SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.' 
WHERE password_hash IS NULL OR password_hash = '';

-- 10. Verificar se as alterações foram aplicadas
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'companies' 
  AND column_name IN ('password_hash', 'is_active', 'name', 'city', 'state', 'discount_percent')
ORDER BY column_name;

-- 11. Verificar empresas que agora têm senha
SELECT 
  id, 
  cnpj, 
  name, 
  CASE 
    WHEN password_hash IS NOT NULL THEN 'COM SENHA'
    ELSE 'SEM SENHA'
  END as status_senha,
  is_active
FROM companies 
ORDER BY id;

-- 12. Comentários sobre os campos
COMMENT ON COLUMN companies.password_hash IS 'Hash da senha da empresa para login';
COMMENT ON COLUMN companies.is_active IS 'Indica se a empresa está ativa no sistema';
COMMENT ON COLUMN companies.name IS 'Nome da empresa (pode ser diferente de company_name)';
COMMENT ON COLUMN companies.city IS 'Cidade da empresa';
COMMENT ON COLUMN companies.state IS 'Estado da empresa (UF)';
COMMENT ON COLUMN companies.discount_percent IS 'Percentual de desconto oferecido pela empresa';
