# 🐾 Backend Liga do Bem - API

Backend completo para o sistema de membros da Liga do Bem com controle de pagamentos e autenticação.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação por tokens
- **bcryptjs** - Hash de senhas
- **Multer** - Upload de arquivos
- **Mercado Pago** - Gateway de pagamento

## 📦 Instalação

1. **Clone o repositório e instale as dependências:**
```bash
cd backend-liga-do-bem
npm install
```

2. **Configure as variáveis de ambiente:**
```bash
# Copie o arquivo .env e configure suas variáveis
cp .env.example .env
```

3. **Inicie o MongoDB:**
```bash
# Windows (MongoDB Compass)
mongod

# Linux/Mac
sudo systemctl start mongod
```

4. **Crie o usuário administrador:**
```bash
node scripts/createAdmin.js
```

5. **Popule o banco com dados de teste (opcional):**
```bash
node scripts/seedDatabase.js
```

6. **Inicie o servidor:**
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 🔗 Endpoints da API

### Autenticação (`/api/auth`)
- `POST /login` - Login de usuário
- `POST /register` - Registro de novo usuário
- `POST /verify-token` - Verificar token
- `POST /logout` - Logout

### Usuários (`/api/users`)
- `GET /profile` - Obter perfil do usuário
- `PUT /profile` - Atualizar perfil
- `PUT /change-password` - Alterar senha
- `GET /payments` - Histórico de pagamentos
- `GET /payment-status` - Status de pagamento
- `DELETE /account` - Desativar conta

### Pagamentos (`/api/payments`)
- `POST /create` - Criar novo pagamento
- `POST /:id/upload-receipt` - Upload de comprovante
- `GET /:id` - Detalhes do pagamento
- `POST /monthly/generate` - Gerar cobrança mensal
- `DELETE /:id` - Cancelar pagamento

### Administração (`/api/admin`)
- `GET /dashboard` - Dashboard com estatísticas
- `GET /users` - Listar usuários
- `GET /payments` - Listar pagamentos
- `PUT /payments/:id/approve` - Aprovar pagamento
- `PUT /payments/:id/reject` - Rejeitar pagamento
- `GET /payments/:id/receipt` - Baixar comprovante
- `POST /users` - Criar usuário
- `PUT /users/:id/toggle-status` - Ativar/desativar usuário

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Inclua o token no header:

```http
Authorization: Bearer <seu-token-jwt>
```

## 📊 Dados de Teste

Após executar `seedDatabase.js`, você terá:

**Usuários de teste:**
- João Silva - CPF: 123.456.789-01 - Senha: 123456 - Ativo
- Maria Santos - CPF: 109.876.543-21 - Senha: 123456 - Ativo
- Pedro Oliveira - CPF: 111.222.333-44 - Senha: 123456 - Inativo
- Ana Costa - CPF: 555.666.777-88 - Senha: 123456 - Ativo
- Carlos Pereira - CPF: 999.888.777-66 - Senha: 123456 - Ativo

**Administrador:**
- Email: admin@ligadobem.org.br
- Senha: admin123 (ALTERE após primeiro login!)

## 🛡️ Segurança

- Rate limiting para prevenir ataques
- Validação de dados de entrada
- Hash seguro de senhas
- Proteção contra injeção de código
- Logs de auditoria
- Controle de acesso por roles

## 📁 Estrutura do Projeto

```
backend-liga-do-bem/
├── models/           # Modelos do banco de dados
├── routes/           # Rotas da API
├── middleware/       # Middlewares customizados
├── scripts/          # Scripts utilitários
├── uploads/          # Arquivos enviados
├── .env             # Variáveis de ambiente
├── server.js        # Servidor principal
└── README.md        # Documentação
```

## 🔧 Configuração de Produção

1. **Altere as variáveis de ambiente:**
```bash
NODE_ENV=production
JWT_SECRET=sua-chave-super-secreta-aqui
MONGODB_URI=mongodb://usuario:senha@host:porta/liga-do-bem
```

2. **Configure o MongoDB Atlas ou servidor próprio**

3. **Configure o Mercado Pago:**
```bash
MERCADOPAGO_ACCESS_TOKEN=sua-chave-de-acesso
MERCADOPAGO_PUBLIC_KEY=sua-chave-publica
```

4. **Configure HTTPS e proxy reverso (Nginx)**

## 📞 Suporte

Para dúvidas ou problemas:
- 📧 Email: contato@ligadobem.org.br
- 📱 WhatsApp: (14) 3815-1234

---

**Liga do Bem Botucatu** - Fazendo a diferença na vida dos animais! 🐕🐱💝