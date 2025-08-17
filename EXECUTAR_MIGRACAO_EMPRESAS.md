# 🚨 EXECUTAR MIGRAÇÃO PARA LOGIN DE EMPRESAS

## ⚠️ **ATENÇÃO: Esta migração é OBRIGATÓRIA para o login funcionar!**

### **🔧 O que a migração faz:**

1. **Adiciona campos necessários** na tabela `companies`:
   - `password_hash` - para armazenar senhas criptografadas
   - `is_active` - para controlar se a empresa está ativa
   - `name` - nome da empresa
   - `city` e `state` - informações de localização
   - `discount_percent` - percentual de desconto

2. **Define senhas padrão** para empresas existentes:
   - **Senha padrão:** `123123`
   - **Usuário:** CNPJ da empresa
   - Todas as empresas aprovadas receberão esta senha

### **📋 Como executar:**

#### **Opção 1: Via psql (Recomendado)**
```bash
# Conectar ao banco de produção
psql -h [HOST] -U [USUARIO] -d [NOME_DO_BANCO] -f backend-unico/migrations/add_company_auth_fields.sql
```

#### **Opção 2: Via pgAdmin ou DBeaver**
1. Abrir o arquivo `backend-unico/migrations/add_company_auth_fields.sql`
2. Executar todo o conteúdo no seu cliente SQL
3. Verificar se não houve erros

#### **Opção 3: Via Render Dashboard (se estiver usando Render)**
1. Acessar o dashboard do Render
2. Ir para o serviço do banco PostgreSQL
3. Abrir o console SQL
4. Colar e executar o conteúdo do arquivo

### **✅ Após executar a migração:**

1. **Reiniciar o backend** para garantir que as mudanças sejam carregadas
2. **Testar o login** com uma empresa aprovada:
   - **CNPJ:** Qualquer empresa aprovada
   - **Senha:** `123123`

### **🔍 Verificar se funcionou:**

A migração inclui comandos SELECT para verificar:
- Se os campos foram criados
- Se as empresas têm senhas
- Status das empresas

### **🚨 Se der erro:**

1. **Verificar permissões** do usuário do banco
2. **Verificar se a tabela `companies` existe**
3. **Executar comandos individualmente** se necessário

### **📞 Suporte:**

Se houver problemas, verificar:
1. Logs do backend após reiniciar
2. Estrutura atual da tabela `companies`
3. Permissões do usuário do banco

---

## **🎯 RESULTADO ESPERADO:**

Após a migração, todas as empresas aprovadas poderão fazer login com:
- **CNPJ:** O CNPJ cadastrado
- **Senha:** `123123`

**⚠️ IMPORTANTE:** Empresas novas aprovadas pelo admin terão senhas personalizadas definidas durante o processo de aprovação.
