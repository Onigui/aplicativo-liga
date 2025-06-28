# 🏥 Painel Administrativo - Liga do Bem

> Sistema administrativo para gerenciamento da ONG Liga do Bem de Botucatu

## 🚀 Sobre o Projeto

Este é o painel administrativo da Liga do Bem, uma ONG de proteção animal de Botucatu. O sistema permite que administradores gerenciem usuários, aprovem pagamentos, visualizem relatórios e configurem o sistema.

## ✨ Funcionalidades

### 🔐 **Autenticação Segura**
- Login exclusivo para administradores
- Verificação de token JWT
- Logout seguro

### 📊 **Dashboard Completo**
- Estatísticas em tempo real
- Gráficos de receita mensal
- Status dos usuários
- Métricas de crescimento
- Alertas para pagamentos vencidos

### 👥 **Gerenciamento de Usuários**
- Lista completa de membros
- Busca e filtros avançados
- Ativação/desativação de contas
- Visualização de detalhes completos
- Histórico de pagamentos

### 💳 **Gestão de Pagamentos**
- Aprovação/rejeição de pagamentos
- Visualização de comprovantes
- Filtros por status
- Download de documentos
- Controle de vencimentos

### 📈 **Relatórios e Analytics**
- Receita total e mensal
- Crescimento de usuários
- Gráficos interativos
- Métricas de conversão
- Exportação em PDF

### ⚙️ **Configurações do Sistema**
- Valores de mensalidade
- Períodos de tolerância
- Configurações de notificação
- Upload de arquivos
- Informações do sistema

## 🛠 Tecnologias Utilizadas

- **React 19.1.0** - Interface do usuário
- **React Router 7.6.2** - Navegação
- **Axios 1.10.0** - Requisições HTTP
- **Lucide React 0.523.0** - Ícones
- **Recharts 3.0.0** - Gráficos
- **CSS3** - Estilização customizada
- **Cross-env** - Variáveis de ambiente

## 🏃‍♂️ Como Executar

### Pré-requisitos
- Node.js 16+
- NPM ou Yarn
- Backend da Liga do Bem rodando na porta 3001

### Instalação

```bash
# Entre na pasta do painel
cd admin-panel-liga-do-bem

# Instale as dependências
npm install

# Execute o projeto
npm start
```

O painel estará disponível em `http://localhost:3002`

## 🔑 Login de Teste

Para acessar o painel administrativo, use:
- **CPF**: CPF de um usuário com role 'admin'
- **Senha**: Senha cadastrada no banco

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── Login.js        # Tela de login
│   ├── Dashboard.js    # Dashboard principal
│   ├── Sidebar.js      # Menu lateral
│   ├── Header.js       # Cabeçalho
│   ├── Users.js        # Gerenciamento de usuários
│   ├── Payments.js     # Gestão de pagamentos
│   ├── Reports.js      # Relatórios
│   └── Settings.js     # Configurações
├── App.js              # Componente principal
├── index.js           # Entrada da aplicação
└── index.css          # Estilos customizados
```

## 🎨 Design System

O painel utiliza um design system customizado inspirado no Tailwind CSS com:

- **Cores Principais**: 
  - Admin: Tons de azul (#0ea5e9, #0284c7, #0369a1)
  - Primary: Rosa (#ec4899)
  - Sucesso: Verde (#059669)
  - Perigo: Vermelho (#dc2626)

- **Componentes**: Cards, botões, inputs e modais responsivos
- **Ícones**: Lucide React para consistência visual
- **Animações**: Transições suaves e loading states

## 🔗 Integração com Backend

O painel se conecta com o backend através das seguintes rotas:

### Autenticação
```
POST /api/auth/login      # Login
POST /api/auth/verify-token # Verificar token
```

### Usuários
```
GET /api/admin/users      # Listar usuários
PUT /api/admin/users/:id/toggle-status # Ativar/desativar
```

### Pagamentos
```
GET /api/admin/payments   # Listar pagamentos
PUT /api/admin/payments/:id/approve # Aprovar
PUT /api/admin/payments/:id/reject  # Rejeitar
```

### Dashboard
```
GET /api/admin/dashboard  # Estatísticas
```

## 🛡️ Segurança

- Autenticação JWT obrigatória
- Verificação de role 'admin'
- Sanitização de inputs
- Headers de segurança
- Logout automático em caso de token inválido

## 📱 Responsividade

O painel é totalmente responsivo e funciona em:
- 💻 Desktop (1024px+)
- 📱 Tablet (768px+)
- 📱 Mobile (320px+)

## 🚀 Deploy

Para fazer o deploy em produção:

```bash
# Build da aplicação
npm run build

# Os arquivos estarão na pasta 'build'
# Configure seu servidor web para servir os arquivos estáticos
```

## 🆘 Suporte

Para problemas ou dúvidas:
- 📧 Email: admin@ligadobem.org.br
- 📱 Telefone: (14) 3815-1234

## 📄 Licença

Este projeto foi desenvolvido exclusivamente para a Liga do Bem - Botucatu.

---

🐾 **Feito com ❤️ para os animais de Botucatu** 🐾
