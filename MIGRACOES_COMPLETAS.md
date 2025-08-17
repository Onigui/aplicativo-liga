# 🚨 MIGRAÇÕES COMPLETAS PARA SISTEMA DE EMPRESAS

## ⚠️ **ATENÇÃO: Execute TODAS as migrações na ordem correta!**

### **📋 Ordem de Execução:**

1. **1ª Migração:** `add_company_auth_fields.sql` - Campos básicos de autenticação
2. **2ª Migração:** `create_company_requests_table.sql` - Tabela de solicitações
3. **3ª Migração:** `add_password_reset_fields.sql` - Recuperação de senha

---

## **🔧 1ª MIGRAÇÃO: Campos de Autenticação**

**Arquivo:** `backend-unico/migrations/add_company_auth_fields.sql`

**O que faz:**
- Adiciona `password_hash` para senhas criptografadas
- Adiciona `is_active` para controle de status
- Adiciona `name`, `city`, `state` para dados completos
- Define senha padrão `123123` para empresas existentes

**Como executar:**
```bash
psql -h [HOST] -U [USUARIO] -d [BANCO] -f backend-unico/migrations/add_company_auth_fields.sql
```

---

## **🔧 2ª MIGRAÇÃO: Tabela de Solicitações**

**Arquivo:** `backend-unico/migrations/create_company_requests_table.sql`

**O que faz:**
- Cria tabela `company_requests` para solicitações pendentes
- Armazena senhas escolhidas pelas empresas
- Inclui todos os dados do cadastro
- Controla status de aprovação/rejeição

**Como executar:**
```bash
psql -h [HOST] -U [USUARIO] -d [BANCO] -f backend-unico/migrations/create_company_requests_table.sql
```

---

## **🔧 3ª MIGRAÇÃO: Recuperação de Senha**

**Arquivo:** `backend-unico/migrations/add_password_reset_fields.sql`

**O que faz:**
- Adiciona campo `email` na tabela `companies`
- Adiciona `password_reset_token` para tokens de recuperação
- Adiciona `password_reset_expires` para controle de expiração

**Como executar:**
```bash
psql -h [HOST] -U [USUARIO] -d [BANCO] -f backend-unico/migrations/add_password_reset_fields.sql
```

---

## **✅ APÓS EXECUTAR TODAS AS MIGRAÇÕES:**

### **1. Reiniciar o Backend:**
- Para carregar as novas rotas e funcionalidades

### **2. Testar o Sistema:**
- **Cadastro de empresa:** Deve salvar senha escolhida
- **Login:** Deve funcionar com senha personalizada
- **Recuperação:** Deve funcionar por e-mail

---

## **🎯 RESULTADO ESPERADO:**

### **Para Empresas Existentes:**
- **Senha:** `123123` (padrão temporário)
- **Login:** Funcionando

### **Para Novas Empresas:**
- **Cadastro:** Escolhem senha personalizada
- **Aprovação:** Admin aprova e senha é mantida
- **Login:** Funciona com senha escolhida
- **Recuperação:** Por e-mail cadastrado

---

## **🚨 SE DER ERRO:**

1. **Verificar permissões** do usuário do banco
2. **Executar migrações individualmente**
3. **Verificar logs** do backend
4. **Confirmar estrutura** das tabelas

---

## **📞 SUPORTE:**

Após executar as migrações:
1. **Reinicie o backend**
2. **Teste o cadastro** de uma nova empresa
3. **Teste o login** com a senha escolhida
4. **Me informe o resultado** para confirmarmos

---

## **🔍 VERIFICAÇÃO FINAL:**

Execute esta query para verificar se tudo foi criado:
```sql
-- Verificar estrutura da tabela companies
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'companies' 
ORDER BY ordinal_position;

-- Verificar se a tabela company_requests foi criada
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'company_requests';
```
