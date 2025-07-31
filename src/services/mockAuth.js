// Adaptador para funcionar com API mock temporária
export const mockAuth = {
  async login(cpf, password) {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Usuários mockados
    const users = [
      {
        id: 1,
        name: 'Administrador',
        cpf: '12345678901',
        password: 'admin123',
        role: 'admin',
        isAdmin: true
      },
      {
        id: 2,
        name: 'João Silva',
        cpf: '11111111111',
        password: 'senha123',
        role: 'user',
        isAdmin: false
      },
      {
        id: 3,
        name: 'Maria Santos',
        cpf: '22222222222',
        password: 'senha123',
        role: 'user',
        isAdmin: false
      }
    ];
    
    // Verificar credenciais
    const user = users.find(u => u.cpf === cpf && u.password === password);
    
    if (!user) {
      throw new Error('CPF ou senha incorretos');
    }
    
    return {
      success: true,
      message: 'Login realizado com sucesso',
      token: `mock-token-${user.id}-${Date.now()}`,
      user: {
        id: user.id,
        name: user.name,
        cpf: user.cpf,
        role: user.role,
        isAdmin: user.isAdmin
      }
    };
  },
  
  async register(name, cpf, password) {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular verificação de CPF existente
    const existingCpfs = ['12345678901', '11111111111', '22222222222'];
    
    if (existingCpfs.includes(cpf)) {
      throw new Error('CPF já cadastrado');
    }
    
    return {
      success: true,
      message: 'Cadastro realizado com sucesso',
      user: {
        id: Date.now(),
        name,
        cpf,
        role: 'user',
        isAdmin: false
      }
    };
  }
};