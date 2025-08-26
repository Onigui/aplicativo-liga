import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';

// Função para mapear campos do banco para o formato do frontend
const mapCompanyFields = (company) => {
  return {
    id: company.id || null,
    companyName: company.company_name || company.name || '',
    cnpj: company.cnpj || '',
    address: company.address || '',
    phone: company.phone || null,
    email: company.email || null,
    discount: company.discount || company.discount_percent || 10,
    description: company.description || null,
    category: company.category || '',
    status: company.status || 'pending',
    workingHours: company.working_hours || null,
    coordinates: company.coordinates || null,
    logo: company.logo_url || company.logo || null,
    website: company.website || null,
    approvedAt: company.approved_at || null,
    approvedBy: company.approved_by || null,
    createdAt: company.created_at || null,
    updatedAt: company.updated_at || null,
    // Campos adicionais para compatibilidade
    name: company.name || company.company_name || '',
    city: company.city || null,
    state: company.state || null
  };
};

// Buscar todas as empresas
export async function getCompanies(req, res) {
  try {
    console.log('[COMPANIES DEBUG] Buscando empresas...');
    console.log('[COMPANIES DEBUG] Query params:', req.query);
    
    const { status } = req.query;
    
    let sql = 'SELECT * FROM companies';
    let params = [];
    
    if (status && status !== 'all') {
      sql += ' WHERE status = $1';
      params.push(status);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    console.log('[COMPANIES DEBUG] SQL:', sql, 'Params:', params);
    
    const result = await query(sql, params);
    
    console.log('[COMPANIES DEBUG] Retornando', result.rows.length, 'empresas');
    
    // Mapear campos para o formato do frontend (com tratamento de erro)
    const mappedCompanies = result.rows.map(company => {
      try {
        return mapCompanyFields(company);
      } catch (mapError) {
        console.error('[COMPANIES ERROR] Erro ao mapear empresa:', company.id, mapError);
        // Retornar objeto básico se falhar o mapeamento
        return {
          id: company.id,
          companyName: company.company_name || company.name || 'Empresa',
          cnpj: company.cnpj || '',
          status: company.status || 'unknown'
        };
      }
    });
    
    res.json({
      success: true,
      companies: mappedCompanies,
      total: mappedCompanies.length
    });

  } catch (error) {
    console.error('[COMPANIES ERROR]:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Buscar empresa por ID
export async function getCompanyById(req, res) {
  try {
    const { id } = req.params;
    console.log('[COMPANIES DEBUG] Buscando empresa por ID:', id);
    
    const result = await query(
      'SELECT * FROM companies WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada'
      });
    }
    
    const company = result.rows[0];
    console.log('[COMPANIES DEBUG] Empresa encontrada:', company.company_name);
    
    // Mapear campos para o formato do frontend
    const mappedCompany = mapCompanyFields(company);
    
    res.json({
      success: true,
      company: mappedCompany
    });

  } catch (error) {
    console.error('[COMPANIES ERROR]:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// Criar nova empresa
export async function createCompany(req, res) {
  try {
    console.log('[COMPANIES DEBUG] Criando nova empresa...');
    console.log('[COMPANIES DEBUG] Dados recebidos:', req.body);
    
    const {
      companyName,
      name,
      cnpj,
      password,
      email,
      phone,
      address,
      city,
      state,
      category,
      discount,
      workingHours,
      description
    } = req.body;
    
    // Validações básicas
    if (!companyName || !cnpj || !address || !category) {
      return res.status(400).json({
        success: false,
        message: 'Nome da empresa, CNPJ, endereço e categoria são obrigatórios'
      });
    }
    
    // Verificar se CNPJ já existe
    const existingCompany = await query(
      'SELECT id FROM companies WHERE cnpj = $1',
      [cnpj]
    );
    
    if (existingCompany.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'CNPJ já cadastrado'
      });
    }
    
    // Hash da senha se fornecida
    let passwordHash = null;
    if (password) {
      const saltRounds = 10;
      passwordHash = await bcrypt.hash(password, saltRounds);
    }
    
    // Inserir empresa
    const result = await query(
      `INSERT INTO companies (
        company_name, name, cnpj, password_hash, email, phone, address, city, state,
        discount, category, working_hours, description, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        companyName,
        name || companyName,
        cnpj,
        passwordHash,
        email || null,
        phone || null,
        address,
        city || null,
        state || null,
        discount || 10,
        category,
        workingHours ? JSON.stringify(workingHours) : null,
        description || null,
        'approved'
      ]
    );
    
    const newCompany = result.rows[0];
    
    console.log('[COMPANIES DEBUG] Empresa criada com sucesso:', newCompany.company_name);
    
    // Mapear campos para o formato do frontend
    const mappedCompany = mapCompanyFields(newCompany);
    
    res.status(201).json({
      success: true,
      company: mappedCompany,
      message: 'Empresa criada com sucesso'
    });

  } catch (error) {
    console.error('[COMPANIES ERROR]:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// Atualizar empresa
export async function updateCompany(req, res) {
  try {
    let { id } = req.params;
    
    // Se o ID não estiver nos params, tentar pegar do body
    if (!id || id === 'undefined') {
      id = req.body.id;
    }
    
    console.log('[COMPANIES DEBUG] Atualizando empresa ID:', id);
    console.log('[COMPANIES DEBUG] Dados para atualização:', req.body);
    
    const {
      company_name,
      cnpj,
      address,
      phone,
      email,
      discount,
      description,
      category,
      working_hours,
      logo_url,
      status
    } = req.body;
    
    // Verificar se empresa existe
    const existingCompany = await query(
      'SELECT id FROM companies WHERE id = $1',
      [id]
    );
    
    if (existingCompany.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada'
      });
    }
    
    // Atualizar empresa
    const result = await query(
      `UPDATE companies SET 
        company_name = COALESCE($1, company_name),
        cnpj = COALESCE($2, cnpj),
        address = COALESCE($3, address),
        phone = $4,
        email = $5,
        discount = COALESCE($6, discount),
        description = $7,
        category = COALESCE($8, category),
        working_hours = $9,
        logo_url = $10,
        status = COALESCE($11, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *`,
      [
        company_name,
        cnpj,
        address,
        phone || null,
        email || null,
        discount,
        description || null,
        category,
        working_hours ? JSON.stringify(working_hours) : null,
        logo_url || null,
        status,
        id
      ]
    );
    
    const updatedCompany = result.rows[0];
    
    console.log('[COMPANIES DEBUG] Empresa atualizada:', updatedCompany.company_name);
    
    // Mapear campos para o formato do frontend
    const mappedCompany = mapCompanyFields(updatedCompany);
    
    res.json({
      success: true,
      company: mappedCompany,
      message: 'Empresa atualizada com sucesso'
    });

  } catch (error) {
    console.error('[COMPANIES ERROR]:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// Deletar empresa
export async function deleteCompany(req, res) {
  try {
    const { id } = req.params;
    console.log('[COMPANIES DEBUG] Deletando empresa ID:', id);
    
    // Verificar se empresa existe
    const existingCompany = await query(
      'SELECT company_name FROM companies WHERE id = $1',
      [id]
    );
    
    if (existingCompany.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada'
      });
    }
    
    // Deletar empresa
    await query('DELETE FROM companies WHERE id = $1', [id]);
    
    const deletedCompanyName = existingCompany.rows[0].company_name;
    console.log('[COMPANIES DEBUG] Empresa deletada:', deletedCompanyName);
    
    res.json({
      success: true,
      message: 'Empresa deletada com sucesso'
    });

  } catch (error) {
    console.error('[COMPANIES ERROR]:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// Aprovar empresa
export async function approveCompany(req, res) {
  try {
    const { id } = req.params;
    console.log('[COMPANIES DEBUG] Aprovando empresa ID:', id);
    
    // Verificar se empresa existe
    const existingCompany = await query(
      'SELECT id, company_name FROM companies WHERE id = $1',
      [id]
    );
    
    if (existingCompany.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada'
      });
    }
    
    // Aprovar empresa
    const result = await query(
      `UPDATE companies SET 
        status = 'approved',
        approved_at = CURRENT_TIMESTAMP,
        approved_by = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *`,
      [req.user?.id || null, id]
    );
    
    const approvedCompany = result.rows[0];
    
    console.log('[COMPANIES DEBUG] Empresa aprovada:', approvedCompany.company_name);
    
    // Mapear campos para o formato do frontend
    const mappedCompany = mapCompanyFields(approvedCompany);
    
    res.json({
      success: true,
      company: mappedCompany,
      message: 'Empresa aprovada com sucesso'
    });

  } catch (error) {
    console.error('[COMPANIES ERROR]:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// Rejeitar empresa
export async function rejectCompany(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    console.log('[COMPANIES DEBUG] Rejeitando empresa ID:', id);
    
    // Verificar se empresa existe
    const existingCompany = await query(
      'SELECT id, company_name FROM companies WHERE id = $1',
      [id]
    );
    
    if (existingCompany.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada'
      });
    }
    
    // Rejeitar empresa
    const result = await query(
      `UPDATE companies SET 
        status = 'rejected',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *`,
      [id]
    );
    
    const rejectedCompany = result.rows[0];
    
    console.log('[COMPANIES DEBUG] Empresa rejeitada:', rejectedCompany.company_name);
    
    // Mapear campos para o formato do frontend
    const mappedCompany = mapCompanyFields(rejectedCompany);
    
    res.json({
      success: true,
      company: mappedCompany,
      message: 'Empresa rejeitada com sucesso'
    });

  } catch (error) {
    console.error('[COMPANIES ERROR]:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// Atualizar senha da empresa
export async function updateCompanyPassword(req, res) {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    console.log('[COMPANIES DEBUG] Atualizando senha da empresa ID:', id);
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Senha é obrigatória'
      });
    }

    // Verificar se empresa existe
    const existingCompany = await query(
      'SELECT id, company_name FROM companies WHERE id = $1',
      [id]
    );
    
    if (existingCompany.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada'
      });
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Atualizar senha
    const result = await query(
      `UPDATE companies SET 
        password_hash = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, company_name`,
      [passwordHash, id]
    );
    
    console.log('[COMPANIES DEBUG] Senha da empresa atualizada:', result.rows[0].company_name);
    
    res.json({
      success: true,
      message: 'Senha da empresa atualizada com sucesso'
    });

  } catch (error) {
    console.error('[COMPANIES ERROR]:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// Processar solicitação de cadastro de empresa
export async function requestCompanyRegistration(req, res) {
  try {
    console.log('[COMPANIES DEBUG] Processando solicitação de cadastro...');
    console.log('[COMPANIES DEBUG] Dados recebidos:', req.body);
    
    const {
      companyName,
      name,
      cnpj,
      password,
      email,
      phone,
      address,
      city,
      state,
      category,
      discount,
      workingHours,
      description
    } = req.body;
    
    // Validações básicas
    if (!companyName || !cnpj || !password || !address || !category) {
      return res.status(400).json({
        success: false,
        message: 'Nome da empresa, CNPJ, senha, endereço e categoria são obrigatórios'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A senha deve ter pelo menos 6 caracteres'
      });
    }
    
    // Verificar se CNPJ já existe
    const existingCompany = await query(
      'SELECT id FROM companies WHERE cnpj = $1',
      [cnpj]
    );
    
    if (existingCompany.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'CNPJ já cadastrado'
      });
    }
    
    // Hash da senha
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Inserir empresa diretamente na tabela companies com status 'pending'
    const result = await query(
      `INSERT INTO companies (
        company_name, name, cnpj, password_hash, email, phone, address, city, state,
        category, discount, working_hours, description, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        companyName,
        name || companyName,
        cnpj,
        passwordHash,
        email || null,
        phone || null,
        address,
        city || null,
        state || null,
        category,
        discount || 10,
        workingHours ? JSON.stringify(workingHours) : null,
        description || null,
        'pending',
        new Date()
      ]
    );
    
    const newRequest = result.rows[0];
    
    console.log('[COMPANIES DEBUG] Solicitação criada com sucesso:', newRequest.company_name);
    
    res.status(201).json({
      success: true,
      message: 'Solicitação enviada com sucesso! Aguarde aprovação do administrador.',
      requestId: newRequest.id,
      status: 'pending'
    });

  } catch (error) {
    console.error('[COMPANIES ERROR]:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// Buscar solicitações de empresas
export async function getCompanyRequests(req, res) {
  try {
    console.log('[COMPANIES DEBUG] Buscando solicitações de empresas...');
    
    const result = await query(
      'SELECT * FROM companies WHERE status = $1 ORDER BY created_at DESC',
      ['pending']
    );
    
    console.log('[COMPANIES DEBUG] Retornando', result.rows.length, 'solicitações');
    
    res.json({
      success: true,
      requests: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('[COMPANIES ERROR]:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}

// Atualizar status de uma empresa
export async function updateCompanyStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log('[COMPANIES DEBUG] Atualizando status da empresa ID:', id, 'para:', status);
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status inválido. Use: pending, approved ou rejected'
      });
    }
    
    const result = await query(
      'UPDATE companies SET status = $1, updated_at = $2 WHERE id = $3 RETURNING *',
      [status, new Date(), id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada'
      });
    }
    
    const updatedCompany = result.rows[0];
    console.log('[COMPANIES DEBUG] Status atualizado com sucesso:', updatedCompany.company_name);
    
    // Mapear campos para o formato do frontend
    const mappedCompany = mapCompanyFields(updatedCompany);
    
    res.json({
      success: true,
      company: mappedCompany,
      message: 'Status atualizado com sucesso'
    });

  } catch (error) {
    console.error('[COMPANIES ERROR]:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}
