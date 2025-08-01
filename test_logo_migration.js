// Test script to verify logo migration
import { query } from './backend-unico/config/database.js';

const testLogoMigration = async () => {
  try {
    console.log('🧪 Testando migração do logo_url...');
    
    // Test 1: Verificar se a coluna foi alterada para TEXT
    const columnInfo = await query(`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'companies' AND column_name = 'logo_url'
    `);
    
    if (columnInfo.rows.length > 0) {
      const column = columnInfo.rows[0];
      console.log('✅ Coluna logo_url encontrada:', {
        name: column.column_name,
        type: column.data_type,
        maxLength: column.character_maximum_length
      });
      
      if (column.data_type === 'text') {
        console.log('✅ Coluna logo_url é do tipo TEXT - migração bem-sucedida!');
      } else {
        console.log('⚠️ Coluna logo_url ainda não é TEXT:', column.data_type);
      }
    } else {
      console.log('❌ Coluna logo_url não encontrada');
    }
    
    // Test 2: Tentar inserir um logo base64 de teste
    const testLogoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='; // 1x1 pixel PNG
    
    const updateResult = await query(`
      UPDATE companies 
      SET logo_url = $1 
      WHERE id = (SELECT id FROM companies LIMIT 1)
      RETURNING id, company_name
    `, [testLogoBase64]);
    
    if (updateResult.rows.length > 0) {
      console.log('✅ Logo base64 inserido com sucesso na empresa:', updateResult.rows[0].company_name);
    } else {
      console.log('⚠️ Nenhuma empresa encontrada para teste');
    }
    
    // Test 3: Verificar se o logo foi salvo
    const checkResult = await query(`
      SELECT id, company_name, logo_url 
      FROM companies 
      WHERE logo_url IS NOT NULL 
      LIMIT 1
    `);
    
    if (checkResult.rows.length > 0) {
      const company = checkResult.rows[0];
      console.log('✅ Logo encontrado na empresa:', company.company_name);
      console.log('📏 Tamanho do logo:', company.logo_url ? company.logo_url.length : 0, 'caracteres');
    } else {
      console.log('ℹ️ Nenhum logo encontrado no banco');
    }
    
    console.log('🎉 Teste de migração concluído!');
    
  } catch (error) {
    console.error('❌ Erro no teste de migração:', error);
  } finally {
    process.exit(0);
  }
};

testLogoMigration(); 