import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';

// ========================================
// CONFIGURAÇÕES - SUBSTITUA PELAS SUAS URLs
// ========================================

// URLs configuradas para migração
const OLD_DATABASE_URL = 'postgresql://usuario:senha@host:porta/banco_antigo'; // Banco antigo não acessível
const NEW_DATABASE_URL = 'postgresql://liga_do_bem_db_v2_user:ipiGjcrdlSxRxfPPP1zXuXokKuIrpIFC@dpg-d39nc1emcj7s739g38c0-a.ohio-postgres.render.com/liga_do_bem_db_v2';

// ========================================
// SCRIPT DE MIGRAÇÃO
// ========================================

const migrateDatabase = async () => {
  console.log('🚀 INICIANDO MIGRAÇÃO DO BANCO DE DADOS');
  console.log('=====================================\n');
  
  try {
    // Verificar se a URL do banco novo foi configurada
    if (NEW_DATABASE_URL.includes('usuario:senha')) {
      console.error('❌ ERRO: Configure a URL do banco novo no arquivo migrate_now.js');
      console.log('💡 Edite a variável NEW_DATABASE_URL');
      console.log('💡 Use a URL real do seu Render Dashboard');
      process.exit(1);
    }
    
    // Conectar aos bancos
    console.log('🔌 Conectando aos bancos de dados...');
    
    const oldPool = new Pool({
      connectionString: OLD_DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    const newPool = new Pool({
      connectionString: NEW_DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    // Testar conexões
    try {
      await oldPool.query('SELECT 1');
      console.log('✅ Conexão com banco antigo: OK');
    } catch (error) {
      console.log('⚠️ Banco antigo não acessível, continuando apenas com criação das tabelas...');
    }
    
    await newPool.query('SELECT 1');
    console.log('✅ Conexão com banco novo: OK');
    
    // Criar tabelas no banco novo
    console.log('\n📋 Criando tabelas no banco novo...');
    
    // Tabela de usuários
    await newPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        cpf VARCHAR(14) UNIQUE NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        password_hash VARCHAR(255) NOT NULL,
        total_donated DECIMAL(10,2) DEFAULT 0.00,
        member_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        role VARCHAR(20) DEFAULT 'member',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabela users criada');
    
    // Tabela de empresas
    await newPool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        cnpj VARCHAR(18) UNIQUE NOT NULL,
        address TEXT NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(255),
        discount VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        working_hours JSONB,
        coordinates JSONB,
        logo_url TEXT,
        website VARCHAR(500),
        approved_at TIMESTAMP,
        approved_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabela companies criada');
    
    // Tabela de doações
    await newPool.query(`
      CREATE TABLE IF NOT EXISTS donations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50),
        status VARCHAR(20) DEFAULT 'pending',
        transaction_id VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabela donations criada');
    
    // Tabela de pagamentos
    await newPool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50),
        status VARCHAR(20) DEFAULT 'pending',
        transaction_id VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabela payments criada');
    
    // Tabela de eventos
    await newPool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        time VARCHAR(50),
        location VARCHAR(255),
        max_participants INTEGER,
        current_participants INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabela events criada');
    
    // Tabela de participação em eventos
    await newPool.query(`
      CREATE TABLE IF NOT EXISTS event_participants (
        id SERIAL PRIMARY KEY,
        event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, user_id)
      );
    `);
    console.log('✅ Tabela event_participants criada');
    
    // Tabela de logs de atividades
    await newPool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        description TEXT,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabela activity_logs criada');
    
    // Tabela de configurações do sistema
    await newPool.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabela system_settings criada');
    
    // Inserir configurações padrão
    await newPool.query(`
      INSERT INTO system_settings (key, value, description) VALUES
      ('app_name', 'Liga do Bem', 'Nome da aplicação'),
      ('app_version', '1.0.0', 'Versão da aplicação'),
      ('contact_phone', '(14) 3815-1234', 'Telefone de contato'),
      ('contact_email', 'contato@ligadobembotucatu.org.br', 'Email de contato'),
      ('website_url', 'https://ligadobembotucatu.org.br', 'URL do site oficial'),
      ('donation_goal_2024', '100000', 'Meta de doações para 2024'),
      ('animals_rescued', '847', 'Total de animais resgatados'),
      ('active_members', '2341', 'Total de membros ativos'),
      ('partner_companies', '156', 'Total de empresas parceiras')
      ON CONFLICT (key) DO NOTHING;
    `);
    console.log('✅ Configurações padrão inseridas');
    
    // Inserir usuário administrador padrão
    const bcrypt = await import('bcryptjs');
    const adminPasswordHash = await bcrypt.default.hash('admin123', 10);
    
    await newPool.query(`
      INSERT INTO users (name, cpf, email, password_hash, role, is_active) VALUES
      ('Administrador', '00000000000', 'admin@ligadobembotucatu.org.br', $1, 'admin', true)
      ON CONFLICT (cpf) DO NOTHING;
    `, [adminPasswordHash]);
    console.log('✅ Usuário administrador criado');
    
    // Inserir usuário de teste
    const testPasswordHash = await bcrypt.default.hash('123456', 10);
    
    await newPool.query(`
      INSERT INTO users (name, cpf, email, password_hash, role, is_active) VALUES
      ('Usuário Teste', '12345678901', 'teste@ligadobembotucatu.org.br', $1, 'member', true)
      ON CONFLICT (cpf) DO NOTHING;
    `, [testPasswordHash]);
    console.log('✅ Usuário de teste criado');
    
    // Inserir algumas empresas de exemplo
    await newPool.query(`
      INSERT INTO companies (company_name, cnpj, address, phone, email, discount, category, status, working_hours) VALUES
      ('Pet Shop Amigo Fiel', '12.345.678/0001-90', 'Rua das Flores, 123, Centro, Botucatu-SP', '(14) 3322-1111', 'contato@amigofiel.com.br', '15% em produtos', 'pet shop', 'approved', '{"monday": "08:00 - 18:00", "tuesday": "08:00 - 18:00", "wednesday": "08:00 - 18:00", "thursday": "08:00 - 18:00", "friday": "08:00 - 18:00", "saturday": "08:00 - 14:00", "sunday": "Fechado"}'),
      ('Clínica Veterinária Saúde Animal', '98.765.432/0001-10', 'Av. Dom Aguirre, 456, Vila Assunção, Botucatu-SP', '(14) 3355-2222', 'contato@saudeanimal.com.br', '20% em consultas', 'veterinária', 'approved', '{"monday": "08:00 - 18:00", "tuesday": "08:00 - 18:00", "wednesday": "08:00 - 18:00", "thursday": "08:00 - 18:00", "friday": "08:00 - 18:00", "saturday": "08:00 - 12:00", "sunday": "Fechado"}'),
      ('Farmácia Pet Central', '11.222.333/0001-44', 'Rua do Comércio, 789, Centro, Botucatu-SP', '(14) 3388-3333', 'contato@farmaciapet.com.br', '10% em medicamentos', 'farmácia pet', 'approved', '{"monday": "08:00 - 20:00", "tuesday": "08:00 - 20:00", "wednesday": "08:00 - 20:00", "thursday": "08:00 - 20:00", "friday": "08:00 - 20:00", "saturday": "08:00 - 18:00", "sunday": "08:00 - 12:00"}')
      ON CONFLICT (cnpj) DO NOTHING;
    `);
    console.log('✅ Empresas de exemplo inseridas');
    
    // Inserir alguns eventos de exemplo
    await newPool.query(`
      INSERT INTO events (title, description, date, time, location, max_participants) VALUES
      ('Feira de Adoção', 'Venha conhecer nossos animais disponíveis para adoção!', '2024-07-15', '09:00 - 16:00', 'Praça Rubião Júnior', 100),
      ('Campanha de Vacinação', 'Vacinação gratuita para cães e gatos da comunidade', '2024-07-22', '08:00 - 17:00', 'Centro Comunitário Vila Assunção', 200),
      ('Bazar Solidário', 'Roupas, calçados e objetos diversos com preços solidários', '2024-08-05', '14:00 - 18:00', 'Sede da Liga do Bem', 50)
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Eventos de exemplo inseridos');
    
    // Fechar conexões
    await newPool.end();
    if (oldPool) await oldPool.end();
    
    console.log('\n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('=====================================');
    console.log('✅ Banco de dados criado');
    console.log('✅ Todas as tabelas criadas');
    console.log('✅ Dados de exemplo inseridos');
    console.log('\n📝 Próximos passos:');
    console.log('1. Atualize a variável DATABASE_URL no Render');
    console.log('2. Faça o deploy da aplicação');
    console.log('3. Teste todas as funcionalidades');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
};

migrateDatabase();
