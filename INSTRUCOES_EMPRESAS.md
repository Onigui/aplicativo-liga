# 🏢 Sistema de Empresas - Liga do Bem

## 📋 **Resumo das Correções**

✅ **Problema resolvido:** Empresas agora são salvas no banco de dados local
✅ **Integração completa:** Frontend conecta com backend local para empresas
✅ **Persistência de dados:** Empresas cadastradas ficam salvas e aparecem para usuários
✅ **Sistema de aprovação:** Admin pode aprovar/rejeitar empresas

## 🚀 **Como Usar**

### **1. Iniciar Backend Local (OBRIGATÓRIO)**
```bash
# Opção 1: Usar o script automático
INICIAR_BACKEND_EMPRESAS.bat

# Opção 2: Manual
cd backend-unico
npm install
npm start
```

**URL do Backend:** `http://localhost:3001`
**Health Check:** `http://localhost:3001/api/health`

### **2. Testar Sistema de Empresas**

#### **Cadastrar Nova Empresa:**
1. Acesse "Parceiro Empresarial"
2. Clique em "Cadastrar Empresa"
3. Preencha os dados
4. Clique em "Cadastrar"
5. ✅ **Empresa será salva no banco local**
6. ✅ **Login automático acontece**
7. ✅ **Notificação de sucesso aparece**

#### **Ver Empresas Cadastradas:**
1. Vá para "Empresas Parceiras"
2. ✅ **Empresas aprovadas aparecem com descontos e horários**
3. ✅ **Dados são carregados do banco local**

#### **Administrar Empresas (Admin):**
1. Acesse área administrativa
2. ✅ **Lista todas as empresas do banco local**
3. ✅ **Pode aprovar/rejeitar empresas**
4. ✅ **Pode editar informações**

## 🗄️ **Arquitetura do Sistema**

### **Frontend (React)**
- **Configuração:** `src/config/api.js` - Usa backend local para empresas
- **Serviços:** `src/services/api2.js` - Endpoints corretos para empresas
- **Componentes:** Modal de cadastro, dashboard, admin

### **Backend Local (Node.js + PostgreSQL)**
- **Rotas:** `/api/admin/companies` - Todas as operações de empresas
- **Controller:** `backend-unico/controllers/companies.js`
- **Banco:** PostgreSQL local com tabela `companies`

### **Endpoints Disponíveis:**
```
POST   /api/admin/companies     - Criar empresa
GET    /api/admin/companies     - Listar empresas
GET    /api/admin/companies/:id - Buscar empresa por ID
PUT    /api/admin/companies/:id - Atualizar empresa
PUT    /api/admin/companies/:id/approve - Aprovar empresa
PUT    /api/admin/companies/:id/reject  - Rejeitar empresa
DELETE /api/admin/companies/:id - Deletar empresa
```

## 🔧 **Estrutura do Banco de Dados**

### **Tabela `companies`:**
```sql
- id (SERIAL PRIMARY KEY)
- company_name (VARCHAR)
- cnpj (VARCHAR UNIQUE)
- address (TEXT)
- phone (VARCHAR)
- email (VARCHAR)
- discount (INTEGER)
- description (TEXT)
- category (VARCHAR)
- working_hours (JSONB)
- status (VARCHAR) - 'pending', 'approved', 'rejected'
- logo_url (VARCHAR)
- website (VARCHAR)
- coordinates (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## ✅ **Verificações de Funcionamento**

### **1. Backend Rodando:**
```bash
curl http://localhost:3001/api/health
# Deve retornar: {"status":"OK",...}
```

### **2. Endpoint de Empresas:**
```bash
curl http://localhost:3001/api/admin/companies
# Deve retornar lista de empresas (vazia se não houver)
```

### **3. Frontend Conectando:**
- Abrir console do navegador
- Ver mensagem: "🌐 API configurada para: http://localhost:3001"
- Ver mensagem: "✅ Conexão com API estabelecida"

## 🚨 **Problemas Comuns**

### **"Empresa não aparece após cadastro"**
- ✅ Verificar se backend local está rodando
- ✅ Verificar console do navegador por erros
- ✅ Verificar se empresa foi aprovada pelo admin

### **"Erro ao conectar com API"**
- ✅ Verificar se `http://localhost:3001` está acessível
- ✅ Verificar se backend está rodando
- ✅ Verificar firewall/antivírus

### **"Dados não são salvos"**
- ✅ Verificar se banco PostgreSQL está rodando
- ✅ Verificar logs do backend
- ✅ Verificar permissões do banco

## 📱 **Deploy em Produção**

### **Para usar em produção:**
1. **Deploy do Backend:** Fazer deploy do `backend-unico` para um servidor
2. **Configuração:** Alterar `API_BASE_URL` para URL do servidor
3. **Banco:** Configurar PostgreSQL no servidor
4. **Variáveis de Ambiente:** Configurar no servidor

### **Configuração atual (desenvolvimento):**
```javascript
// src/config/api.js
baseURL = API_URLS.development; // http://localhost:3001
```

## 🎯 **Próximos Passos**

1. ✅ **Testar cadastro de empresa**
2. ✅ **Verificar se aparece na lista de parceiros**
3. ✅ **Testar sistema de aprovação**
4. ✅ **Verificar se dados persistem após reiniciar**

---

**💡 Dica:** Sempre inicie o backend local antes de testar o sistema de empresas!
