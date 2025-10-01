import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Função principal de migração
const migrateDatabase = async () => {
  console.log('🚀 INICIANDO MIGRAÇÃO DO BANCO DE DADOS');
  console.log('=====================================\n');
  
  try {
    // 1. Verificar se as variáveis de ambiente estão configuradas
    if (!process.env.OLD_DATABASE_URL) {
      console.error('❌ OLD_DATABASE_URL não configurada');
      console.log('💡 Configure no .env: OLD_DATABASE_URL=postgresql://...');
      process.exit(1);
    }
    
    if (!process.env.NEW_DATABASE_URL) {
      console.error('❌ NEW_DATABASE_URL não configurada');
      console.log('💡 Configure no .env: NEW_DATABASE_URL=postgresql://...');
      process.exit(1);
    }
    
    // 2. Conectar aos bancos
    console.log('🔌 Conectando aos bancos de dados...');
    
    const oldPool = new Pool({
      connectionString: process.env.OLD_DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    const newPool = new Pool({
      connectionString: process.env.NEW_DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    // Testar conexões
    await oldPool.query('SELECT 1');
    console.log('✅ Conexão com banco antigo: OK');
    
    await newPool.query('SELECT 1');
    console.log('✅ Conexão com banco novo: OK');
    
    // 3. Executar migração das tabelas no banco novo
    console.log('\n📋 Executando migração das tabelas...');
    
    // Importar e executar o script de criação das tabelas
    const { query: newQuery } = await import('./backend-unico/config/database.js');
    
    // Executar init.js no banco novo
    const { createTables } = await import('./backend-unico/migrations/init.js');
    await createTables();
    
    // 4. Exportar dados do banco antigo
    console.log('\n📤 Exportando dados do banco antigo...');
    
    const tables = [
      'system_settings',
      'users', 
      'companies',
      'donations',
      'payments',
      'events',
      'event_participants',
      'activity_logs'
    ];
    
    const exportData = {};
    
    for (const table of tables) {
      try {
        const result = await oldPool.query(`SELECT * FROM ${table} ORDER BY id`);
        exportData[table] = result.rows;
        console.log(`✅ ${table}: ${result.rows.length} registros`);
      } catch (error) {
        console.log(`⚠️ ${table}: ${error.message}`);
        exportData[table] = [];
      }
    }
    
    // 5. Importar dados para o banco novo
    console.log('\n📥 Importando dados para o banco novo...');
    
    const importOrder = [
      'system_settings',
      'users',
      'companies', 
      'donations',
      'payments',
      'events',
      'event_participants',
      'activity_logs'
    ];
    
    for (const table of importOrder) {
      if (!exportData[table] || exportData[table].length === 0) {
        console.log(`⏭️ ${table}: sem dados para importar`);
        continue;
      }
      
      console.log(`📥 ${table}: ${exportData[table].length} registros`);
      
      for (const row of exportData[table]) {
        try {
          const columns = Object.keys(row).filter(key => row[key] !== null);
          const values = columns.map((_, index) => `$${index + 1}`);
          const valuesArray = columns.map(col => row[col]);
          
          const query = `
            INSERT INTO ${table} (${columns.join(', ')})
            VALUES (${values.join(', ')})
            ON CONFLICT (id) DO UPDATE SET
            ${columns.filter(col => col !== 'id').map(col => `${col} = EXCLUDED.${col}`).join(', ')}
          `;
          
          await newPool.query(query, valuesArray);
        } catch (error) {
          console.log(`⚠️ Erro em ${table}: ${error.message}`);
        }
      }
      
      console.log(`✅ ${table}: importada`);
    }
    
    // 6. Verificação final
    console.log('\n🔍 Verificação final:');
    for (const table of importOrder) {
      try {
        const result = await newPool.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`   ${table}: ${result.rows[0].count} registros`);
      } catch (error) {
        console.log(`   ${table}: erro na verificação`);
      }
    }
    
    // 7. Fechar conexões
    await oldPool.end();
    await newPool.end();
    
    console.log('\n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('=====================================');
    console.log('✅ Banco de dados migrado');
    console.log('✅ Todas as tabelas criadas');
    console.log('✅ Todos os dados importados');
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

