import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

// Função para gerar token JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      cpf: user.cpf, 
      role: user.role 
    },
    process.env.JWT_SECRET || 'fallback_secret_key',
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
    }
  );
};

// Função para validar CPF
const validateCPF = (cpf) => {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
};

export async function login(req, res) {
  try {
    console.log('[LOGIN DEBUG] Dados recebidos:', req.body);
    
    const { username, password, cpf } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'CPF e senha são obrigatórios'
      });
    }

    // Limpar CPF (remover pontos e traços)
    const cleanCPF = username.replace(/\D/g, '');
    
    // Buscar usuário no banco
    const result = await query(
      'SELECT * FROM users WHERE cpf = $1 AND is_active = true',
      [cleanCPF]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'CPF ou senha incorretos'
      });
    }

    const user = result.rows[0];
    
    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'CPF ou senha incorretos'
      });
    }

    // Gerar token
    const token = generateToken(user);
    
    // Remover senha do objeto de resposta
    const { password_hash, ...userWithoutPassword } = user;
    
    // Log da atividade
    await query(
      'INSERT INTO activity_logs (user_id, action, description, ip_address) VALUES ($1, $2, $3, $4)',
      [user.id, 'login', 'Login realizado com sucesso', req.ip]
    );

    console.log('[LOGIN DEBUG] Login bem-sucedido para:', user.name);
    
    res.json({
      success: true,
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('[LOGIN ERROR]:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

export async function register(req, res) {
  try {
    console.log('[REGISTER DEBUG] Dados recebidos:', req.body);
    
    const { name, cpf, password } = req.body;
    
    // Validações
    if (!name || !cpf || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nome, CPF e senha são obrigatórios'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A senha deve ter pelo menos 6 caracteres'
      });
    }

    // Validar CPF
    if (!validateCPF(cpf)) {
      return res.status(400).json({
        success: false,
        message: 'CPF inválido'
      });
    }

    // Limpar CPF
    const cleanCPF = cpf.replace(/\D/g, '');
    
    // Verificar se CPF já existe
    const existingUser = await query(
      'SELECT id FROM users WHERE cpf = $1',
      [cleanCPF]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'CPF já cadastrado'
      });
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Inserir usuário
    const result = await query(
      `INSERT INTO users (name, cpf, password_hash, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, cpf, email, phone, address, total_donated, member_since, is_active, role, created_at`,
      [name.trim(), cleanCPF, passwordHash, 'member']
    );

    const newUser = result.rows[0];
    
    // Gerar token
    const token = generateToken(newUser);
    
    // Log da atividade
    await query(
      'INSERT INTO activity_logs (user_id, action, description, ip_address) VALUES ($1, $2, $3, $4)',
      [newUser.id, 'register', 'Novo usuário registrado', req.ip]
    );

    console.log('[REGISTER DEBUG] Usuário registrado com sucesso:', newUser.name);
    
    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      user: newUser,
      token
    });

  } catch (error) {
    console.error('[REGISTER ERROR]:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// Função para validar token (middleware)
export const validateToken = async (req, res, next) => {
  try {
    console.log('[TOKEN DEBUG] Validando token...');
    console.log('[TOKEN DEBUG] Headers:', req.headers);
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[TOKEN DEBUG] Header Authorization inválido:', authHeader);
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    const token = authHeader.substring(7);
    console.log('[TOKEN DEBUG] Token extraído:', token.substring(0, 20) + '...');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    console.log('[TOKEN DEBUG] Token decodificado:', decoded);
    
    // Buscar usuário no banco
    const result = await query(
      'SELECT id, name, cpf, email, role, is_active FROM users WHERE id = $1 AND is_active = true',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      console.log('[TOKEN DEBUG] Usuário não encontrado no banco');
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    console.log('[TOKEN DEBUG] Usuário encontrado:', result.rows[0]);
    req.user = result.rows[0];
    next();

  } catch (error) {
    console.error('[TOKEN VALIDATION ERROR]:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Função para verificar se é admin
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores.'
    });
  }
  next();
};
