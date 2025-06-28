# 🔧 Teste de Login - Liga do Bem

## 🚨 Como resolver o erro de login

### 1️⃣ **Verificar se o Backend está rodando**

```bash
# Abrir terminal na pasta backend
cd backend
npm start

# Deve mostrar:
# 🚀 Servidor rodando na porta 3001
# ✅ Admin criado com sucesso
# ✅ Usuário teste criado com sucesso
```

### 2️⃣ **Verificar se o Painel Admin está rodando**

```bash
# Abrir outro terminal na pasta admin-panel-liga-do-bem
cd admin-panel-liga-do-bem
npm start

# Deve abrir em http://localhost:3002
```

### 3️⃣ **Acessar a página de teste**

Acesse: **http://localhost:3002/test**

Esta página vai testar:
- ✅ Conexão com o backend
- ✅ Login direto
- ✅ Configuração do axios

### 4️⃣ **Credenciais de Teste**

**Para Admin (Painel Administrativo):**
- **CPF**: `12345678901`
- **Senha**: `admin123`

**Para Usuário (Site Principal):**
- **CPF**: `98765432100`
- **Senha**: `user123`

### 5️⃣ **Verificar logs no console**

1. Abra o painel admin: http://localhost:3002
2. Pressione **F12** para abrir as ferramentas do desenvolvedor
3. Vá na aba **Console**
4. Tente fazer login
5. Veja os logs que aparecem

### 6️⃣ **Possíveis problemas e soluções**

#### ❌ **Erro: "Network Error" ou "ECONNREFUSED"**
**Solução**: Backend não está rodando
```bash
cd backend
npm start
```

#### ❌ **Erro: "CORS policy"**
**Solução**: Backend já está configurado para aceitar CORS

#### ❌ **Erro: "CPF ou senha incorretos"**
**Solução**: Use as credenciais exatas:
- CPF: `12345678901` (sem pontos ou traços)
- Senha: `admin123`

#### ❌ **Erro: "Timeout"**
**Solução**: Backend pode estar lento, aguarde ou reinicie

#### ❌ **Erro: "Role não é admin"**
**Solução**: Certifique-se de usar as credenciais do admin, não do usuário comum

### 7️⃣ **Teste manual via CURL (Windows)**

```powershell
# Teste de conexão
Invoke-WebRequest -Uri "http://localhost:3001/api/health" -Method GET

# Teste de login
$body = @{
    cpf = "12345678901"
    password = "admin123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

### 8️⃣ **Se nada funcionar**

1. **Pare todos os processos**:
   - Feche todas as janelas do terminal
   - Pare o navegador

2. **Reinicie tudo**:
```bash
# Terminal 1
cd backend
npm start

# Terminal 2  
cd admin-panel-liga-do-bem
npm start
```

3. **Acesse a página de teste primeiro**:
   http://localhost:3002/test

4. **Se o teste funcionar, acesse o login normal**:
   http://localhost:3002

### 🆘 **Ainda com problemas?**

Se ainda estiver dando erro, me informe:
1. Qual erro aparece no console (F12)
2. O que acontece na página de teste (/test)
3. Se o backend está realmente rodando
4. Screenshots do erro, se possível

---

**🎯 O login deve funcionar com estas credenciais:**
- **CPF**: 12345678901
- **Senha**: admin123

**🐾 Liga do Bem - Teste funcionando!** 🐾