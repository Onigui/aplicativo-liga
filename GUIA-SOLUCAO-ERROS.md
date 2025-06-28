# 🚨 Guia de Solução de Erros - Liga do Bem

## 🔍 **Problemas Identificados e Soluções**

### ❌ **Erro: Serviços não inicializam**

**Sintomas:**
- Backend não responde na porta 3001
- Frontend não responde na porta 3002
- Mensagem "Impossível conectar-se ao servidor remoto"

**Solução Passo a Passo:**

#### **1. Limpar Processos Antigos**
```powershell
# Matar todos os processos Node
taskkill /f /im node.exe
```

#### **2. Iniciar Backend Manualmente**
```powershell
# Abrir terminal e navegar para o backend
cd backend

# Instalar dependências (se necessário)
npm install

# Iniciar o servidor
node server.js
```

**Deve aparecer:**
```
🚀 Servidor rodando na porta 3001
📱 Saúde: http://localhost:3001/api/health
🔐 Login: http://localhost:3001/api/auth/login
Conectado ao banco SQLite em memória
✅ Admin criado com sucesso
✅ Usuário teste criado com sucesso
```

#### **3. Iniciar Frontend (Em outro terminal)**
```powershell
# Abrir OUTRO terminal e navegar para o frontend
cd admin-panel-liga-do-bem

# Instalar dependências (se necessário)
npm install

# Iniciar o servidor
npm start
```

**Deve aparecer:**
```
Starting the development server...
Local: http://localhost:3002
```

### 🧪 **Como Testar se Está Funcionando**

#### **Teste 1: Backend**
```powershell
node test-login.js
```

**Resultado esperado:**
```
🧪 Testando login...
✅ Backend conectado: { status: 'OK', message: 'Backend funcionando!' }
✅ Login bem-sucedido: { ... }
```

#### **Teste 2: Frontend**
Acesse: http://localhost:3002

**Deve carregar a página de login**

### 🔧 **Erros Comuns e Soluções**

#### **Erro 1: "EADDRINUSE: address already in use :::3001"**
```powershell
# Matar processo na porta 3001
netstat -ano | findstr :3001
taskkill /PID [PID_ENCONTRADO] /F
```

#### **Erro 2: "Module not found"**
```powershell
# Reinstalar dependências
npm install
```

#### **Erro 3: "Permission denied"**
```powershell
# Executar como administrador
# Clique direito no PowerShell > "Executar como administrador"
```

#### **Erro 4: Frontend não compila**
```powershell
# Verificar erros de compilação
npm run build

# Se houver erros, eles aparecerão aqui
```

### 📊 **Script de Diagnóstico**

Execute este comando para verificar se tudo está funcionando:

```powershell
node test-connections.js
```

**Resultado esperado:**
```
🧪 Testando conexões...
✅ Backend está funcionando na porta 3001
✅ Frontend está funcionando na porta 3002

📊 Resumo:
Backend (3001): ✅ OK
Frontend (3002): ✅ OK
```

### 🚀 **Inicialização Rápida (Método Alternativo)**

Se os métodos acima não funcionarem, use este:

#### **Terminal 1 - Backend:**
```powershell
cd "C:\Users\Onigu\OneDrive\Desktop\novo projeto da liga\liga-do-bem-app\backend"
node server.js
```

#### **Terminal 2 - Frontend:**
```powershell
cd "C:\Users\Onigu\OneDrive\Desktop\novo projeto da liga\liga-do-bem-app\admin-panel-liga-do-bem"
npm start
```

### 🔐 **Credenciais de Teste**

- **Admin**: 
  - CPF: `12345678901`
  - Senha: `admin123`

- **Usuário**: 
  - CPF: `98765432100`
  - Senha: `user123`

### 📝 **Checklist de Verificação**

- [ ] Backend rodando na porta 3001
- [ ] Frontend rodando na porta 3002
- [ ] Login funcionando
- [ ] Dashboard carregando
- [ ] Pagamentos listando
- [ ] Console sem erros

### 🆘 **Se Nada Funcionar**

1. **Feche todos os terminais**
2. **Reinicie o computador**
3. **Execute o script de inicialização:**
   ```
   start-system.bat
   ```

### 📞 **Logs de Debug**

Sempre verifique o console do navegador (F12) para ver logs detalhados:
- `🔍` = Carregando dados
- `✅` = Sucesso
- `❌` = Erro

---

**💡 Dica:** Mantenha ambos os terminais abertos para monitorar os logs em tempo real!