import { query } from '../config/database.js';

// Controller para usuários
export async function getUsers(req, res) {
  try {
    console.log('[USERS DEBUG] Buscando usuários...');
    
    const result = await query(`
      SELECT 
        id,
        name,
        cpf,
        email,
        phone,
        total_donated,
        is_active,
        role,
        created_at
      FROM users 
      ORDER BY created_at DESC
    `);
    
    console.log('[USERS DEBUG] Usuários encontrados:', result.rows.length);
    
    res.json({
      success: true,
      users: result.rows
    });
    
  } catch (error) {
    console.error('[USERS ERROR]:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// Criar usuário
export async function createUser(req, res) {
  try {
    console.log('[USERS DEBUG] Criando usuário...');
    
    const { name, cpf, email, phone, password, isActive } = req.body;
    
    // Hash da senha
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.default.hash(password, 10);
    
    const result = await query(`
      INSERT INTO users (name, cpf, email, phone, password_hash, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, cpf, email, phone, is_active, created_at
    `, [name, cpf, email, phone, passwordHash, isActive]);
    
    console.log('[USERS DEBUG] Usuário criado:', result.rows[0]);
    
    res.json({
      success: true,
      user: result.rows[0]
    });
    
  } catch (error) {
    console.error('[USERS ERROR]:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// Atualizar status do usuário
export async function toggleUserStatus(req, res) {
  try {
    console.log('[USERS DEBUG] Alterando status do usuário...');
    
    const { id } = req.params;
    const { isActive } = req.body;
    
    const result = await query(`
      UPDATE users 
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, name, cpf, email, phone, is_active
    `, [isActive, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    console.log('[USERS DEBUG] Status atualizado:', result.rows[0]);
    
    res.json({
      success: true,
      user: result.rows[0]
    });
    
  } catch (error) {
    console.error('[USERS ERROR]:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}
