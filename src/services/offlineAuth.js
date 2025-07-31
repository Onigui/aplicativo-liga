// Sistema de autenticação completamente offline
// Não depende de nenhuma conexão com internet

export class OfflineAuth {
  constructor() {
    const instanceId = Date.now() + Math.random();
    console.log('🔧 [OFFLINE AUTH] Inicializando sistema offline - Instância:', instanceId);
    console.log('🔧 [OFFLINE AUTH] Stack trace:', new Error().stack);
    this.instanceId = instanceId;
    this.users = [
      {
        id: 1,
        name: 'Administrador',
        cpf: '00000000000',
        password: 'admin123',
        role: 'admin',
        isAdmin: true,
        isActive: true
      },
      {
        id: 2,
        name: 'João Silva',
        cpf: '11111111111',
        password: 'senha123',
        role: 'user',
        isAdmin: false,
        isActive: true
      },
      {
        id: 3,
        name: 'Maria Santos',
        cpf: '22222222222',
        password: 'senha123',
        role: 'user',
        isAdmin: false,
        isActive: true
      },
      {
        id: 4,
        name: 'Pedro Oliveira',
        cpf: '33333333333',
        password: 'senha123',
        role: 'user',
        isAdmin: false,
        isActive: true
      }
    ];

    this.companies = [
      {
        id: '1',
        companyName: 'Pet Shop Exemplo',
        cnpj: '12.345.678/0001-90',
        address: 'Rua das Flores, 123 - Centro, Botucatu - SP',
        phone: '(14) 99999-9999',
        email: 'contato@petshopexemplo.com',
        discount: '15% em rações e acessórios',
        description: 'Oferecemos desconto em rações, brinquedos e acessórios para pets',
        coordinates: {
          latitude: -22.8858,
          longitude: -48.4406
        },
        workingHours: {
          monday: { open: '08:00', close: '18:00', closed: false },
          tuesday: { open: '08:00', close: '18:00', closed: false },
          wednesday: { open: '08:00', close: '18:00', closed: false },
          thursday: { open: '08:00', close: '18:00', closed: false },
          friday: { open: '08:00', close: '18:00', closed: false },
          saturday: { open: '08:00', close: '16:00', closed: false },
          sunday: { open: '08:00', close: '12:00', closed: false }
        },
        status: 'approved',
        createdAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
        approvedBy: 'Admin'
      },
      {
        id: '2',
        companyName: 'Clínica Veterinária VidaPet',
        cnpj: '98.765.432/0001-11',
        address: 'Av. Dom Lúcio, 456 - Vila Assunção, Botucatu - SP',
        phone: '(14) 3333-5678',
        email: 'contato@clinicavidapet.com.br',
        discount: '20% em consultas veterinárias',
        description: 'Clínica veterinária completa com especialistas em pequenos animais',
        coordinates: {
          latitude: -22.8912,
          longitude: -48.4421
        },
        workingHours: {
          monday: { open: '07:00', close: '19:00', closed: false },
          tuesday: { open: '07:00', close: '19:00', closed: false },
          wednesday: { open: '07:00', close: '19:00', closed: false },
          thursday: { open: '07:00', close: '19:00', closed: false },
          friday: { open: '07:00', close: '19:00', closed: false },
          saturday: { open: '07:00', close: '17:00', closed: false },
          sunday: { open: '08:00', close: '12:00', closed: false }
        },
        status: 'pending',
        createdAt: new Date().toISOString(),
        approvedAt: null,
        approvedBy: null
      },
      {
        id: '3',
        companyName: 'Ração & Cia',
        cnpj: '11.222.333/0001-44',
        address: 'Rua Amando de Barros, 789 - Vila Independência, Botucatu - SP',
        phone: '(14) 3344-9012',
        email: 'contato@racaoecia.com.br',
        discount: '10% em rações premium',
        description: 'Loja especializada em rações premium e suplementos para pets',
        coordinates: {
          latitude: -22.8789,
          longitude: -48.4367
        },
        workingHours: {
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { open: '09:00', close: '18:00', closed: false },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '09:00', close: '18:00', closed: false },
          saturday: { open: '09:00', close: '17:00', closed: false },
          sunday: { open: '00:00', close: '00:00', closed: true }
        },
        status: 'approved',
        createdAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
        approvedBy: 'Admin'
      },
      {
        id: '4',
        companyName: 'Farmácia Animal',
        cnpj: '55.666.777/0001-88',
        address: 'Rua Floriano Peixoto, 321 - Centro, Botucatu - SP',
        phone: '(14) 2222-4444',
        email: 'contato@farmaciaanimal.com.br',
        discount: '15% em medicamentos',
        description: 'Farmácia especializada em medicamentos veterinários',
        coordinates: {
          latitude: -22.8845,
          longitude: -48.4398
        },
        workingHours: {
          monday: { open: '08:00', close: '19:00', closed: false },
          tuesday: { open: '08:00', close: '19:00', closed: false },
          wednesday: { open: '08:00', close: '19:00', closed: false },
          thursday: { open: '08:00', close: '19:00', closed: false },
          friday: { open: '08:00', close: '19:00', closed: false },
          saturday: { open: '08:00', close: '18:00', closed: false },
          sunday: { open: '08:00', close: '14:00', closed: false }
        },
        status: 'pending',
        createdAt: new Date().toISOString(),
        approvedAt: null,
        approvedBy: null
      },
      {
        id: '5',
        companyName: 'Banho & Tosa Premium',
        cnpj: '33.444.555/0001-66',
        address: 'Av. Santana, 654 - Jardim Paraíso, Botucatu - SP',
        phone: '(14) 1111-7777',
        email: 'contato@banhoetosapremium.com.br',
        discount: '25% em banho e tosa',
        description: 'Serviços premium de banho, tosa e estética animal',
        coordinates: {
          latitude: -22.8823,
          longitude: -48.4412
        },
        workingHours: {
          monday: { open: '08:00', close: '17:00', closed: false },
          tuesday: { open: '08:00', close: '17:00', closed: false },
          wednesday: { open: '08:00', close: '17:00', closed: false },
          thursday: { open: '08:00', close: '17:00', closed: false },
          friday: { open: '08:00', close: '17:00', closed: false },
          saturday: { open: '08:00', close: '16:00', closed: false },
          sunday: { open: '00:00', close: '00:00', closed: true }
        },
        status: 'approved',
        createdAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
        approvedBy: 'Admin'
      }
    ];

    this.loadFromStorage();
    
    // FORÇAR SALVAMENTO INICIAL se não há dados no localStorage
    const savedCompanies = localStorage.getItem('ligadobem_companies');
    if (!savedCompanies) {
      console.log('🔥 [OFFLINE AUTH] FORÇANDO salvamento inicial dos dados');
      this.saveToStorage();
    }
  }

  // Carregar dados do localStorage
  loadFromStorage() {
    try {
      console.log('🔄 [OFFLINE AUTH] Carregando dados do localStorage - Instância:', this.instanceId);
      
      const savedUsers = localStorage.getItem('ligadobem_users');
      const savedCompanies = localStorage.getItem('ligadobem_companies');
      
      console.log('📊 [OFFLINE AUTH] Usuários salvos:', savedUsers ? 'SIM' : 'NÃO');
      console.log('📊 [OFFLINE AUTH] Empresas salvas:', savedCompanies ? 'SIM' : 'NÃO');
      
      if (savedUsers) {
        this.users = JSON.parse(savedUsers);
        console.log('✅ [OFFLINE AUTH] Usuários carregados:', this.users.length);
      }
      
      if (savedCompanies) {
        this.companies = JSON.parse(savedCompanies);
        console.log('✅ [OFFLINE AUTH] Empresas carregadas:', this.companies.length);
      } else {
        console.log('⚠️ [OFFLINE AUTH] Nenhuma empresa no localStorage, usando dados padrão');
        console.log('📋 [OFFLINE AUTH] Empresas padrão:', this.companies.length);
      }
    } catch (error) {
      console.log('📱 [OFFLINE AUTH] Primeiro acesso - usando dados padrão');
    }
  }

  // Salvar dados no localStorage
  saveToStorage() {
    try {
      console.log('💾 [OFFLINE AUTH] Salvando dados no localStorage - Instância:', this.instanceId);
      console.log('💾 [OFFLINE AUTH] Salvando usuários:', this.users.length);
      console.log('💾 [OFFLINE AUTH] Salvando empresas:', this.companies.length);
      
      localStorage.setItem('ligadobem_users', JSON.stringify(this.users));
      localStorage.setItem('ligadobem_companies', JSON.stringify(this.companies));
      
      console.log('✅ [OFFLINE AUTH] Dados salvos com sucesso');
    } catch (error) {
      console.log('⚠️ [OFFLINE AUTH] Erro ao salvar dados localmente:', error);
    }
  }

  // Simular delay de rede para parecer real
  async simulateNetworkDelay(min = 500, max = 1500) {
    const delay = Math.random() * (max - min) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Login offline
  async login(cpf, password) {
    console.log('🔐 Iniciando login offline...');
    
    try {
      // Simular delay de rede
      await this.simulateNetworkDelay();
      
      // Validar entrada
      if (!cpf || !password) {
        throw new Error('CPF e senha são obrigatórios');
      }
      
      // Buscar usuário
      const user = this.users.find(u => u.cpf === cpf);
      
      if (!user) {
        throw new Error('CPF não encontrado');
      }
      
      // Verificar senha
      if (user.password !== password) {
        throw new Error('Senha incorreta');
      }
      
      // Verificar se usuário está ativo
      if (!user.isActive) {
        throw new Error('Conta desativada');
      }
      
      // Gerar token simples
      const token = `offline_token_${user.id}_${Date.now()}`;
      
      // Salvar sessão
      const sessionData = {
        token,
        user: {
          id: user.id,
          name: user.name,
          cpf: user.cpf,
          role: user.role,
          isAdmin: user.isAdmin
        },
        loginTime: new Date().toISOString()
      };
      
      localStorage.setItem('ligadobem_session', JSON.stringify(sessionData));
      
      console.log('✅ Login offline bem-sucedido:', user.name);
      
      return {
        success: true,
        message: 'Login realizado com sucesso',
        token,
        user: {
          id: user.id,
          name: user.name,
          cpf: user.cpf,
          role: user.role,
          isAdmin: user.isAdmin
        }
      };
      
    } catch (error) {
      console.error('❌ Erro no login offline:', error.message);
      return {
        success: false,
        message: error.message || 'Erro ao fazer login'
      };
    }
  }

  // Registro offline
  async register(name, cpf, password, email = '') {
    console.log('📝 Iniciando registro offline...');
    
    try {
      // Simular delay de rede
      await this.simulateNetworkDelay();
      
      // Validar entrada
      if (!name || !cpf || !password) {
        throw new Error('Nome, CPF e senha são obrigatórios');
      }
      
      // Verificar se CPF já existe
      const existingUser = this.users.find(u => u.cpf === cpf);
      if (existingUser) {
        throw new Error('CPF já cadastrado');
      }
      
      // Criar novo usuário
      const newUser = {
        id: Date.now(),
        name,
        cpf,
        password,
        email,
        role: 'user',
        isAdmin: false,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      // Adicionar usuário
      this.users.push(newUser);
      
      // Salvar dados
      this.saveToStorage();
      
      console.log('✅ Registro offline bem-sucedido:', newUser.name);
      
      return {
        success: true,
        message: 'Cadastro realizado com sucesso',
        user: {
          id: newUser.id,
          name: newUser.name,
          cpf: newUser.cpf,
          role: newUser.role,
          isAdmin: newUser.isAdmin
        }
      };
      
    } catch (error) {
      console.error('❌ Erro no registro offline:', error.message);
      return {
        success: false,
        message: error.message || 'Erro ao fazer cadastro'
      };
    }
  }

  // Verificar sessão ativa
  async verifySession() {
    try {
      const sessionData = localStorage.getItem('ligadobem_session');
      if (!sessionData) {
        return { valid: false, message: 'Sessão não encontrada' };
      }
      
      const session = JSON.parse(sessionData);
      
      // Verificar se token não expirou (24 horas)
      const loginTime = new Date(session.loginTime);
      const now = new Date();
      const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        localStorage.removeItem('ligadobem_session');
        return { valid: false, message: 'Sessão expirada' };
      }
      
      return {
        valid: true,
        user: session.user,
        token: session.token
      };
      
    } catch (error) {
      return { valid: false, message: 'Erro ao verificar sessão' };
    }
  }

  // Logout
  async logout() {
    localStorage.removeItem('ligadobem_session');
    return { success: true, message: 'Logout realizado com sucesso' };
  }

  // Listar usuários
  async getUsers() {
    await this.simulateNetworkDelay(200, 500);
    return this.users.map(user => ({
      id: user.id,
      name: user.name,
      cpf: user.cpf,
      role: user.role,
      isActive: user.isActive,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt
    }));
  }

  // Listar empresas
  async getCompanies() {
    console.log('📋 [OFFLINE AUTH] getCompanies chamado - Instância:', this.instanceId);
    console.log('📋 [OFFLINE AUTH] Número de empresas:', this.companies.length);
    
    // Debug: listar todas as empresas
    this.companies.forEach((company, index) => {
      console.log(`📋 [OFFLINE AUTH] Empresa ${index + 1}:`, {
        id: company.id,
        name: company.companyName,
        status: company.status
      });
    });
    
    await this.simulateNetworkDelay(200, 500);
    return this.companies;
  }

  // Adicionar empresa
  async addCompany(companyData) {
    await this.simulateNetworkDelay();
    
    const newCompany = {
      id: Date.now(),
      ...companyData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    this.companies.push(newCompany);
    this.saveToStorage();
    
    return {
      success: true,
      message: 'Empresa adicionada com sucesso',
      company: newCompany
    };
  }

  // Aprovar empresa
  async approveCompany(id, approvedBy = 'admin@ligadobem.org') {
    await this.simulateNetworkDelay();
    
    const companyIndex = this.companies.findIndex(c => c.id == id);
    if (companyIndex === -1) {
      throw new Error('Empresa não encontrada');
    }
    
    this.companies[companyIndex] = {
      ...this.companies[companyIndex],
      status: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: approvedBy,
      rejectedAt: null,
      rejectedBy: null
    };
    
    this.saveToStorage();
    
    return {
      success: true,
      message: 'Empresa aprovada com sucesso',
      company: this.companies[companyIndex]
    };
  }

  // Rejeitar empresa
  async rejectCompany(id, rejectedBy = 'admin@ligadobem.org') {
    await this.simulateNetworkDelay();
    
    const companyIndex = this.companies.findIndex(c => c.id == id);
    if (companyIndex === -1) {
      throw new Error('Empresa não encontrada');
    }
    
    this.companies[companyIndex] = {
      ...this.companies[companyIndex],
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectedBy: rejectedBy,
      approvedAt: null,
      approvedBy: null
    };
    
    this.saveToStorage();
    
    return {
      success: true,
      message: 'Empresa rejeitada',
      company: this.companies[companyIndex]
    };
  }

  // Atualizar empresa
  async updateCompany(id, companyData) {
    await this.simulateNetworkDelay();
    
    const companyIndex = this.companies.findIndex(c => c.id == id);
    if (companyIndex === -1) {
      throw new Error('Empresa não encontrada');
    }
    
    this.companies[companyIndex] = {
      ...this.companies[companyIndex],
      ...companyData,
      updatedAt: new Date().toISOString()
    };
    
    this.saveToStorage();
    
    return {
      success: true,
      message: 'Empresa atualizada com sucesso',
      company: this.companies[companyIndex]
    };
  }

  // Deletar empresa
  async deleteCompany(id) {
    await this.simulateNetworkDelay();
    
    const companyIndex = this.companies.findIndex(c => c.id == id);
    if (companyIndex === -1) {
      throw new Error('Empresa não encontrada');
    }
    
    this.companies.splice(companyIndex, 1);
    this.saveToStorage();
    
    return {
      success: true,
      message: 'Empresa excluída com sucesso'
    };
  }

  // Health check
  async healthCheck() {
    return {
      status: 'ok',
      message: 'Sistema offline funcionando perfeitamente',
      timestamp: new Date().toISOString(),
      mode: 'offline',
      users: this.users.length,
      companies: this.companies.length
    };
  }
}

// Instância singleton
const offlineAuth = new OfflineAuth();
export default offlineAuth;