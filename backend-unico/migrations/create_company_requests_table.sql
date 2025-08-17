-- Migração para criar tabela company_requests
-- Executar: psql -d seu_banco -f create_company_requests_table.sql

-- Criar tabela para solicitações de cadastro de empresas
CREATE TABLE IF NOT EXISTS company_requests (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(14) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(2),
  category VARCHAR(100) NOT NULL,
  discount INTEGER DEFAULT 10,
  working_hours JSONB,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  approved_by VARCHAR(100),
  rejected_at TIMESTAMP,
  rejected_by VARCHAR(100),
  rejection_reason TEXT
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_company_requests_cnpj ON company_requests(cnpj);
CREATE INDEX IF NOT EXISTS idx_company_requests_status ON company_requests(status);
CREATE INDEX IF NOT EXISTS idx_company_requests_created_at ON company_requests(created_at);

-- Comentários sobre os campos
COMMENT ON TABLE company_requests IS 'Solicitações de cadastro de empresas aguardando aprovação';
COMMENT ON COLUMN company_requests.company_name IS 'Nome da empresa (campo original)';
COMMENT ON COLUMN company_requests.name IS 'Nome da empresa (pode ser diferente de company_name)';
COMMENT ON COLUMN company_requests.cnpj IS 'CNPJ da empresa (único)';
COMMENT ON COLUMN company_requests.password_hash IS 'Hash da senha escolhida pela empresa';
COMMENT ON COLUMN company_requests.email IS 'E-mail da empresa para contato e recuperação de senha';
COMMENT ON COLUMN company_requests.status IS 'Status da solicitação: pending, approved, rejected';
COMMENT ON COLUMN company_requests.working_hours IS 'Horários de funcionamento em formato JSON';
COMMENT ON COLUMN company_requests.discount IS 'Percentual de desconto oferecido pela empresa';

-- Verificar se a tabela foi criada
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'company_requests'
ORDER BY ordinal_position;
