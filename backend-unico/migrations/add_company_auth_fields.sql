-- Migração para adicionar campos de autenticação na tabela companies
-- Executar: psql -d seu_banco -f add_company_auth_fields.sql

-- Adicionar campo password_hash para armazenar senha criptografada
ALTER TABLE companies ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Adicionar campo is_active para controlar se a empresa está ativa
ALTER TABLE companies ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Adicionar campo name para armazenar o nome da empresa (pode ser diferente de company_name)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- Atualizar empresas existentes para ter um nome padrão se o campo name estiver vazio
UPDATE companies SET name = company_name WHERE name IS NULL OR name = '';

-- Tornar o campo name obrigatório
ALTER TABLE companies ALTER COLUMN name SET NOT NULL;

-- Adicionar campo city e state se não existirem
ALTER TABLE companies ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS state VARCHAR(2);

-- Adicionar campo discount como INTEGER se não existir (para armazenar percentual)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 10;

-- Converter campo discount existente para discount_percent se necessário
UPDATE companies 
SET discount_percent = CAST(REPLACE(discount, '%', '') AS INTEGER) 
WHERE discount_percent IS NULL AND discount LIKE '%';

-- Comentários sobre os campos
COMMENT ON COLUMN companies.password_hash IS 'Hash da senha da empresa para login';
COMMENT ON COLUMN companies.is_active IS 'Indica se a empresa está ativa no sistema';
COMMENT ON COLUMN companies.name IS 'Nome da empresa (pode ser diferente de company_name)';
COMMENT ON COLUMN companies.city IS 'Cidade da empresa';
COMMENT ON COLUMN companies.state IS 'Estado da empresa (UF)';
COMMENT ON COLUMN companies.discount_percent IS 'Percentual de desconto oferecido pela empresa';

-- Verificar se as alterações foram aplicadas
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'companies' 
  AND column_name IN ('password_hash', 'is_active', 'name', 'city', 'state', 'discount_percent')
ORDER BY column_name;
