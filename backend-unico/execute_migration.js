import { query } from './config/database.js';

const executeMigration = async () => {
  try {
    console.log('🔄 Executando migração no banco de produção...');
    
    // Verificar se os campos já existem
    const checkFields = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'companies' 
        AND column_name IN ('password_hash', 'name', 'city', 'state')
    `);
    
    const existingFields = checkFields.rows.map(row => row.column_name);
    console.log('Campos existentes:', existingFields);
    
    // Adicionar campos que não existem
    if (!existingFields.includes('password_hash')) {
      console.log('Adicionando campo password_hash...');
      await query('ALTER TABLE companies ADD COLUMN password_hash VARCHAR(255)');
    }
    
    if (!existingFields.includes('name')) {
      console.log('Adicionando campo name...');
      await query('ALTER TABLE companies ADD COLUMN name VARCHAR(255)');
    }
    
    if (!existingFields.includes('city')) {
      console.log('Adicionando campo city...');
      await query('ALTER TABLE companies ADD COLUMN city VARCHAR(100)');
    }
    
    if (!existingFields.includes('state')) {
      console.log('Adicionando campo state...');
      await query('ALTER TABLE companies ADD COLUMN state VARCHAR(2)');
    }
    
    // Atualizar campo name se estiver vazio
    await query("UPDATE companies SET name = company_name WHERE name IS NULL OR name = ''");
    
    // Verificar solicitações pendentes
    const pending = await query(`
      SELECT id, company_name, cnpj, status, created_at 
      FROM companies 
      WHERE status = 'pending' 
      ORDER BY created_at DESC
    `);
    
    console.log(`📊 Total de solicitações pendentes: ${pending.rows.length}`);
    pending.rows.forEach(req => {
      console.log(`  - ID: ${req.id}, Nome: ${req.company_name}, CNPJ: ${req.cnpj}, Status: ${req.status}`);
    });
    
    console.log('✅ Migração concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao executar migração:', error);
  } finally {
    process.exit(0);
  }
};

executeMigration();
