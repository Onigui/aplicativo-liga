import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Configuração do banco atual (que venceu)
const currentPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Função para exportar dados
const exportDatabase = async () => {
  try {
    console.log('🔄 Iniciando exportação do banco de dados...');
    
    // Lista de tabelas para exportar (em ordem de dependência)
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
        console.log(`📤 Exportando tabela: ${table}`);
        const result = await currentPool.query(`SELECT * FROM ${table} ORDER BY id`);
        exportData[table] = result.rows;
        console.log(`✅ ${table}: ${result.rows.length} registros exportados`);
      } catch (error) {
        console.log(`⚠️ Erro ao exportar ${table}:`, error.message);
        exportData[table] = [];
      }
    }
    
    // Salvar dados em arquivo JSON
    const filename = `database_export_${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
    
    console.log(`💾 Dados exportados para: ${filename}`);
    console.log('📊 Resumo da exportação:');
    
    Object.entries(exportData).forEach(([table, data]) => {
      console.log(`   ${table}: ${data.length} registros`);
    });
    
    await currentPool.end();
    console.log('✅ Exportação concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na exportação:', error);
    process.exit(1);
  }
};

exportDatabase();

