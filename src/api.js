// Mock API para desenvolvimento - simula o backend
class MockAPI {
  static users = [
    {
      id: '1',
      name: 'João Silva',
      cpf: '12345678901',
      password: '123456',
      isActive: true
    }
  ];

  static async login(cpf, password) {
    console.log('🔐 MockAPI: Tentativa de login', { cpf, password: password ? '[DEFINIDA]' : '[VAZIA]' });
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = this.users.find(u => u.cpf === cpf && u.password === password);
    
    if (user) {
      console.log('✅ MockAPI: Login bem-sucedido!');
      return {
        success: true,
        message: 'Login realizado com sucesso!',
        user: {
          id: user.id,
          name: user.name,
          cpf: this.formatCPF(user.cpf),
          isActive: user.isActive
        },
        token: 'mock-jwt-token-' + Date.now()
      };
    } else {
      console.log('❌ MockAPI: Credenciais inválidas');
      return {
        success: false,
        message: 'CPF ou senha incorretos'
      };
    }
  }

  static async register(name, cpf, password) {
    console.log('📝 MockAPI: Tentativa de cadastro', { name, cpf, password: password ? '[DEFINIDA]' : '[VAZIA]' });
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Verificar se CPF já existe
    const existingUser = this.users.find(u => u.cpf === cpf);
    if (existingUser) {
      console.log('❌ MockAPI: CPF já cadastrado');
      return {
        success: false,
        message: 'CPF já cadastrado no sistema'
      };
    }
    
    // Validações básicas
    if (!name || !cpf || !password) {
      console.log('❌ MockAPI: Dados obrigatórios faltando');
      return {
        success: false,
        message: 'Nome, CPF e senha são obrigatórios'
      };
    }
    
    // Criar novo usuário
    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      cpf: cpf.replace(/\D/g, ''),
      password: password.trim(),
      isActive: false
    };
    
    this.users.push(newUser);
    
    console.log('✅ MockAPI: Usuário cadastrado!', newUser);
    
    return {
      success: true,
      message: 'Usuário cadastrado com sucesso!',
      user: {
        id: newUser.id,
        name: newUser.name,
        cpf: this.formatCPF(newUser.cpf),
        isActive: newUser.isActive
      }
    };
  }

  static formatCPF(cpf) {
    const cleaned = cpf.replace(/\D/g, '');
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}

export default MockAPI;