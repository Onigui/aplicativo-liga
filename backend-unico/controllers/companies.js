import { query } from '../config/database.js';

// Função para mapear campos do banco para o formato do frontend
const mapCompanyFields = (company) => {
  return {
    id: company.id,
    companyName: company.company_name,
    cnpj: company.cnpj,
    address: company.address,
    phone: company.phone,
    email: company.email,
    discount: company.discount,
    description: company.description,
    category: company.category,
    status: company.status,
    workingHours: company.working_hours,
    coordinates: company.coordinates,
    logo: company.logo_url, // Corrigido para 'logo' em vez de 'logoUrl'
    website: company.website,
    approvedAt: company.approved_at,
    approvedBy: company.approved_by,
    createdAt: company.created_at,
    updatedAt: company.updated_at
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
    
    const result = await query(sql, params);
    
    console.log('[COMPANIES DEBUG] Retornando', result.rows.length, 'empresas');
    
    // Mapear campos para o formato do frontend
    const mappedCompanies = result.rows.map(mapCompanyFields);
    
    res.json({
      success: true,
      companies: mappedCompanies,
      total: mappedCompanies.length
    });

  } catch (error) {
    console.error('[COMPANIES ERROR]:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
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
      cnpj,
      address,
      phone,
      email,
      discount,
      description,
      category,
      workingHours
    } = req.body;
    
    // Validações básicas
    if (!companyName || !cnpj || !address || !discount || !category) {
      return res.status(400).json({
        success: false,
        message: 'Nome da empresa, CNPJ, endereço, desconto e categoria são obrigatórios'
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
    
    // Inserir empresa
    const result = await query(
      `INSERT INTO companies (
        company_name, cnpj, address, phone, email, discount, 
        description, category, working_hours, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        companyName,
        cnpj,
        address,
        phone || null,
        email || null,
        discount,
        description || null,
        category,
        workingHours ? JSON.stringify(workingHours) : null,
        'pending'
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
