import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

// Função para gerar token JWT
const generateToken = (user) => {
  // Forçar expiração de 7 dias
  const expiresIn = '7d';
  console.log('[JWT DEBUG] expiresIn forçado para:', expiresIn);
  
  return jwt.sign(
    { 
      id: user.id, 
      cpf: user.cpf, 
      role: user.role 
    },
    process.env.JWT_SECRET || 'fallback_secret_key',
    { 
      expiresIn: expiresIn
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

// Função para login de empresa
export async function companyLogin(req, res) {
  try {
    console.log('[COMPANY LOGIN DEBUG] Dados recebidos:', req.body);
    
    const { cnpj, password } = req.body;
    
    if (!cnpj || !password) {
      return res.status(400).json({
        success: false,
        message: 'CNPJ e senha são obrigatórios'
      });
    }

    // Limpar CNPJ (remover pontos e traços)
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    console.log('[COMPANY LOGIN DEBUG] CNPJ limpo:', cleanCNPJ);
    
    // Buscar empresa no banco (sem verificar campos específicos)
    console.log('[COMPANY LOGIN DEBUG] Buscando empresa com CNPJ:', cleanCNPJ);
    const result = await query(
      'SELECT * FROM companies WHERE cnpj = $1 AND status = $2',
      [cleanCNPJ, 'approved']
    );

    console.log('[COMPANY LOGIN DEBUG] Resultado da busca:', result.rows.length, 'empresas encontradas');
    if (result.rows.length > 0) {
      const company = result.rows[0];
      console.log('[COMPANY LOGIN DEBUG] Empresa encontrada:', {
        id: company.id,
        cnpj: company.cnpj,
        name: company.company_name || company.name,
        hasPassword: !!company.password_hash,
        hasPasswordField: 'password_hash' in company
      });
    }

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'CNPJ não encontrado ou empresa não aprovada'
      });
    }

    const company = result.rows[0];
    
    // Verificar se a empresa tem senha (compatibilidade com estrutura atual)
    if (!company.password_hash) {
      console.log('[COMPANY LOGIN DEBUG] Empresa sem senha cadastrada');
      
      // Se não tem password_hash, verificar se tem password (campo antigo)
      if (company.password) {
        // Comparar com senha em texto plano (temporário)
        if (company.password === password) {
          console.log('[COMPANY LOGIN DEBUG] Login com senha antiga bem-sucedido');
          
          // Remover senha do objeto de resposta
          const { password, ...companyWithoutPassword } = company;
          
          res.status(200).json({
            success: true,
            message: 'Login realizado com sucesso',
            company: companyWithoutPassword
          });
          return;
        }
      }
      
      return res.status(401).json({
        success: false,
        message: 'Empresa sem senha cadastrada. Entre em contato com o administrador.'
      });
    }
    
    // Verificar senha com bcrypt
    console.log('[COMPANY LOGIN DEBUG] Verificando senha com bcrypt...');
    const isValidPassword = await bcrypt.compare(password, company.password_hash);
    console.log('[COMPANY LOGIN DEBUG] Senha válida:', isValidPassword);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Senha incorreta'
      });
    }

    console.log('[COMPANY LOGIN DEBUG] Empresa logada com sucesso:', company.company_name || company.name);
    
    // Remover senha do objeto de resposta
    const { password_hash, ...companyWithoutPassword } = company;
    
    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      company: companyWithoutPassword
    });

  } catch (error) {
    console.error('[COMPANY LOGIN ERROR]:', error);
    console.error('[COMPANY LOGIN ERROR] Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Função para solicitar recuperação de senha de empresa
export async function requestCompanyPasswordReset(req, res) {
  try {
    console.log('[PASSWORD RESET DEBUG] Solicitação de recuperação de senha...');
    
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'E-mail é obrigatório'
      });
    }
    
    // Buscar empresa pelo e-mail
    const result = await query(
      'SELECT id, name, cnpj FROM companies WHERE email = $1 AND is_active = true',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'E-mail não encontrado ou empresa inativa'
      });
    }
    
    const company = result.rows[0];
    
    // Gerar token de recuperação (expira em 1 hora)
    const resetToken = jwt.sign(
      { 
        companyId: company.id, 
        type: 'password_reset',
        email: email
      },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '1h' }
    );
    
    // Salvar token no banco
    await query(
      'UPDATE companies SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3',
      [resetToken, new Date(Date.now() + 3600000), company.id]
    );
    
    // TODO: Enviar e-mail com link de recuperação
    // Por enquanto, retornar o token (em produção, enviar por e-mail)
    console.log('[PASSWORD RESET DEBUG] Token gerado para empresa:', company.name);
    
    res.json({
      success: true,
      message: 'E-mail de recuperação enviado. Verifique sua caixa de entrada.',
      debug: process.env.NODE_ENV === 'development' ? { resetToken } : undefined
    });

  } catch (error) {
    console.error('[PASSWORD RESET ERROR]:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// Função para redefinir senha de empresa
export async function resetCompanyPassword(req, res) {
  try {
    console.log('[PASSWORD RESET DEBUG] Redefinindo senha...');
    
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token e nova senha são obrigatórios'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A senha deve ter pelo menos 6 caracteres'
      });
    }
    
    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    } catch (jwtError) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }
    
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    // Buscar empresa
    const result = await query(
      'SELECT id, name, password_reset_token, password_reset_expires FROM companies WHERE id = $1',
      [decoded.companyId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada'
      });
    }
    
    const company = result.rows[0];
    
    // Verificar se o token é válido e não expirou
    if (company.password_reset_token !== token) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (new Date() > new Date(company.password_reset_expires)) {
      return res.status(400).json({
        success: false,
        message: 'Token expirado'
      });
    }
    
    // Hash da nova senha
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
    
    // Atualizar senha e limpar token
    await query(
      'UPDATE companies SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL WHERE id = $2',
      [newPasswordHash, company.id]
    );
    
    console.log('[PASSWORD RESET DEBUG] Senha redefinida para empresa:', company.name);
    
    res.json({
      success: true,
      message: 'Senha redefinida com sucesso!'
    });

  } catch (error) {
    console.error('[PASSWORD RESET ERROR]:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}
