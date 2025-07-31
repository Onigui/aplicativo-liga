# 🚀 Guia Completo de Deploy - Liga do Bem

Este guia te ajudará a fazer o deploy completo do sistema Liga do Bem para GitHub e Render com banco de dados PostgreSQL.

## 📋 Pré-requisitos

- ✅ Git instalado
- ✅ Node.js 18+ instalado
- ✅ Conta no GitHub
- ✅ Conta no Render
- ✅ Editor de código (VS Code recomendado)

## 🎯 Passo a Passo Completo

### **FASE 1: Preparação do Projeto**

1. **Abra o PowerShell como administrador**
2. **Navegue até a pasta do projeto:**
   ```powershell
   cd "C:\Users\Onigu\OneDrive\Desktop\liga-do-bem-app"
   ```

3. **Execute o script de deploy:**
   ```powershell
   .\DEPLOY_GITHUB_RENDER.ps1 -FirstTime
   ```

### **FASE 2: Criar Repositório no GitHub**

1. **Acesse:** https://github.com
2. **Clique em "New repository"**
3. **Configure:**
   - **Repository name:** `liga-do-bem-app`
   - **Description:** `Sistema completo para ONG de proteção animal em Botucatu-SP`
   - **Visibility:** Public (ou Private se preferir)
   - **NÃO** inicialize com README (já temos um)

4. **Copie a URL do repositório** (ex: `https://github.com/seu-usuario/liga-do-bem-app.git`)

5. **Execute o comando no PowerShell:**
   ```powershell
   git remote add origin https://github.com/seu-usuario/liga-do-bem-app.git
   git push -u origin main
   ```

### **FASE 3: Configurar Render**

#### **3.1 Criar Conta no Render**
1. **Acesse:** https://render.com
2. **Faça login com GitHub**
3. **Complete o cadastro**

#### **3.2 Criar Banco de Dados PostgreSQL**
1. **No dashboard do Render, clique em "New +"**
2. **Selecione "PostgreSQL"**
3. **Configure:**
   - **Name:** `liga-do-bem-db`
   - **Database:** `liga_do_bem`
   - **User:** `liga_do_bem_user`
   - **Plan:** Free
4. **Clique em "Create Database"**
5. **Aguarde a criação (pode demorar alguns minutos)**
6. **Copie a "Internal Database URL"** (será algo como: `postgresql://liga_do_bem_user:password@host:port/liga_do_bem`)

#### **3.3 Criar Web Service (Backend)**
1. **Clique em "New +" → "Web Service"**
2. **Conecte seu repositório GitHub**
3. **Configure:**
   - **Name:** `liga-do-bem-api`
   - **Environment:** Node
   - **Build Command:** `cd backend-unico && npm install`
   - **Start Command:** `cd backend-unico && npm run migrate && npm start`
   - **Plan:** Free

4. **Configure as variáveis de ambiente:**
   - **NODE_ENV:** `production`
   - **PORT:** `3001`
   - **DATABASE_URL:** `[URL do PostgreSQL copiada acima]`
   - **JWT_SECRET:** `[gere uma chave secreta forte]`
   - **JWT_EXPIRES_IN:** `86400`
   - **CORS_ORIGINS:** `https://liga-do-bem-app.onrender.com`

5. **Clique em "Create Web Service"**

#### **3.4 Criar Static Site (Frontend)**
1. **Clique em "New +" → "Static Site"**
2. **Conecte o mesmo repositório GitHub**
3. **Configure:**
   - **Name:** `liga-do-bem-app`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`
   - **Plan:** Free

4. **Configure as variáveis de ambiente:**
   - **REACT_APP_API_URL:** `https://liga-do-bem-api.onrender.com`
   - **REACT_APP_ENV:** `production`

5. **Clique em "Create Static Site"**

### **FASE 4: Configurar Deploy Automático**

1. **No Render, vá em "Settings" de cada serviço**
2. **Em "Build & Deploy":**
   - **Auto-Deploy:** Enabled
   - **Branch:** main

### **FASE 5: Testar o Sistema**

1. **Aguarde o deploy automático** (pode demorar 5-10 minutos)
2. **Acesse o frontend:** `https://liga-do-bem-app.onrender.com`
3. **Teste o login:**
   - **Admin:** CPF `000.000.000-00` | Senha `admin123`
   - **User:** CPF `123.456.789-01` | Senha `123456`

## 🔧 Configurações Importantes

### **Variáveis de Ambiente (Backend)**
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=sua_chave_secreta_muito_forte_aqui
JWT_EXPIRES_IN=86400
CORS_ORIGINS=https://liga-do-bem-app.onrender.com
LOG_LEVEL=info
DEBUG=false
```

### **Variáveis de Ambiente (Frontend)**
```env
REACT_APP_API_URL=https://liga-do-bem-api.onrender.com
REACT_APP_ENV=production
```

## 🚨 Solução de Problemas

### **Erro de Build**
- Verifique se todas as dependências estão no `package.json`
- Confirme se o Node.js está na versão 18+

### **Erro de Conexão com Banco**
- Verifique se a `DATABASE_URL` está correta
- Confirme se o banco PostgreSQL foi criado
- Aguarde alguns minutos após a criação do banco

### **Erro de CORS**
- Verifique se `CORS_ORIGINS` está configurado corretamente
- Inclua tanto HTTP quanto HTTPS se necessário

### **Erro de JWT**
- Gere uma nova `JWT_SECRET` forte
- Use pelo menos 32 caracteres

## 📱 URLs Finais

Após o deploy, você terá:
- **Frontend:** `https://liga-do-bem-app.onrender.com`
- **Backend:** `https://liga-do-bem-api.onrender.com`
- **Admin:** `https://liga-do-bem-app.onrender.com/admin`

## 🔄 Atualizações Futuras

Para fazer atualizações:
1. **Faça as alterações no código**
2. **Commit e push para GitHub:**
   ```bash
   git add .
   git commit -m "feat: nova funcionalidade"
   git push origin main
   ```
3. **O Render fará deploy automático**

## 📞 Suporte

Se encontrar problemas:
1. **Verifique os logs no Render**
2. **Teste localmente primeiro**
3. **Consulte a documentação do Render**

## 🎉 Parabéns!

Seu sistema Liga do Bem está online e pronto para uso! 🐾✨

---

**🐾 Juntos fazemos a diferença na vida dos animais! 🐾** 