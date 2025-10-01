import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Configuração do novo banco
const newPool = new Pool({
  connectionString: process.env.NEW_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Função para importar dados
const importDatabase = async () => {
  try {
    console.log('🔄 Iniciando importação para o novo banco...');
    
    // Ler arquivo de exportação
    const exportFile = process.argv[2] || 'database_export.json';
    
    if (!fs.existsSync(exportFile)) {
      console.error(`❌ Arquivo de exportação não encontrado: ${exportFile}`);
      console.log('💡 Use: node import_database.js arquivo_exportado.json');
      process.exit(1);
    }
    
    const exportData = JSON.parse(fs.readFileSync(exportFile, 'utf8'));
    
    // Ordem de importação (respeitando foreign keys)
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
        console.log(`⏭️ Pulando ${table}: sem dados`);
        continue;
      }
      
      console.log(`📥 Importando ${table}: ${exportData[table].length} registros`);
      
      for (const row of exportData[table]) {
        try {
          // Construir query de INSERT dinamicamente
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
          console.log(`⚠️ Erro ao importar registro em ${table}:`, error.message);
        }
      }
      
      console.log(`✅ ${table} importada com sucesso`);
    }
    
    // Verificar importação
    console.log('\n📊 Verificação da importação:');
    for (const table of importOrder) {
      try {
        const result = await newPool.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`   ${table}: ${result.rows[0].count} registros`);
      } catch (error) {
        console.log(`   ${table}: erro na verificação`);
      }
    }
    
    await newPool.end();
    console.log('🎉 Importação concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na importação:', error);
    process.exit(1);
  }
};

importDatabase();

