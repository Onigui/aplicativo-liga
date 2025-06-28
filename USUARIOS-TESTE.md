# 👥 **USUÁRIOS E SENHAS PARA TESTE - Liga do Bem**

## 🔐 **Credenciais de Acesso**

### **ADMINISTRADOR**
- **Nome:** Admin Silva
- **CPF:** `12345678901`
- **Senha:** `admin123`
- **Email:** admin@ligadobem.org.br
- **Telefone:** (14) 99988-7766
- **Função:** Administrador (acesso total)
- **Status:** Ativo

---

### **USUÁRIOS REGULARES**

#### **Usuário Principal de Teste**
- **Nome:** João Silva
- **CPF:** `98765432100`
- **Senha:** `user123`
- **Email:** joao@email.com
- **Telefone:** (14) 98877-6655
- **Função:** Usuário
- **Status:** Ativo

#### **Outros Usuários de Teste**
> **Todos usam a mesma senha:** `user123`

| Nome | CPF | Email | Telefone | Status |
|------|-----|-------|----------|--------|
| Maria Oliveira | `11122233344` | maria@email.com | (14) 97766-5544 | Ativo |
| Pedro Santos | `55566677788` | pedro@email.com | (14) 96655-4433 | Inativo |
| Ana Costa | `99988877766` | ana@email.com | (14) 95544-3322 | Ativo |
| Carlos Silva | `12312312345` | carlos@email.com | (14) 98877-6655 | Ativo |
| Lucia Fernandes | `98798798712` | lucia@email.com | (14) 97766-5544 | Ativo |
| Roberto Lima | `45645645678` | roberto@email.com | (14) 96655-4433 | Inativo |
| Fernanda Santos | `78978978945` | fernanda@email.com | (14) 95544-3322 | Ativo |
| Paulo Mendes | `32132132156` | paulo@email.com | (14) 94433-2211 | Ativo |
| Juliana Alves | `65465465489` | juliana@email.com | (14) 93322-1100 | Ativo |
| Marcos Rodrigues | `85285285201` | marcos@email.com | (14) 92211-0099 | Inativo |

---

## 🚀 **Como Fazer Login**

### **Painel Administrativo**
1. Acesse: http://localhost:3002
2. Use uma das credenciais acima
3. Para **ADMIN completo**: CPF `12345678901` + senha `admin123`

### **Diferenças de Acesso:**

#### **👑 ADMINISTRADOR (`12345678901`)**
- ✅ Dashboard completo
- ✅ Gestão de usuários
- ✅ Aprovar/Rejeitar pagamentos
- ✅ Relatórios avançados
- ✅ Configurações do sistema
- ✅ Todas as funcionalidades

#### **👤 USUÁRIOS REGULARES (todos os outros)**
- ✅ Ver próprio perfil
- ✅ Enviar comprovantes
- ✅ Ver histórico de pagamentos
- ❌ Não acessa painel admin
- ❌ Não gerencia outros usuários

---

## 💳 **Dados de Pagamentos para Teste**

O sistema já vem com **8 pagamentos de teste** associados aos usuários:

| Usuário | Valor | Mês | Status | Método |
|---------|-------|-----|--------|--------|
| João Silva | R$ 50,00 | 2024-01 | Pendente | PIX |
| João Silva | R$ 50,00 | 2023-12 | Aprovado | PIX |
| Maria Oliveira | R$ 50,00 | 2024-01 | Pendente | Boleto |
| Pedro Santos | R$ 50,00 | 2024-01 | Aprovado | PIX |
| Ana Costa | R$ 50,00 | 2023-12 | Aprovado | Cartão |
| Carlos Silva | R$ 50,00 | 2024-01 | Rejeitado | PIX |
| Lucia Fernandes | R$ 50,00 | 2024-01 | Pendente | PIX |
| Roberto Lima | R$ 50,00 | 2023-11 | Aprovado | Boleto |

---

## 🧪 **Como Testar o Sistema**

### **Teste 1: Login como Admin**
```
CPF: 12345678901
Senha: admin123
```
**Deve acessar:** Dashboard completo com todas as funcionalidades

### **Teste 2: Login como Usuário**
```
CPF: 98765432100
Senha: user123
```
**Deve acessar:** Área restrita do usuário

### **Teste 3: Gestão de Pagamentos**
1. Faça login como admin
2. Vá em "Pagamentos"
3. Teste aprovação/rejeição dos pagamentos pendentes

### **Teste 4: Gestão de Usuários**
1. Faça login como admin
2. Vá em "Usuários"
3. Veja a lista completa de usuários
4. Teste ativar/desativar usuários

---

## 🔧 **Script de Teste Automático**

Para testar todas as credenciais rapidamente:

```bash
node test-login.js
```

Este script testa:
- ✅ Conexão com backend
- ✅ Login do administrador
- ✅ Validação de token
- ✅ Acesso aos pagamentos

---

## 📊 **Resumo Rápido**

**Para testes rápidos, use:**

| Tipo | CPF | Senha | Para que serve |
|------|-----|-------|----------------|
| **Admin** | `12345678901` | `admin123` | Tudo - gestão completa |
| **Usuário** | `98765432100` | `user123` | Área do cliente |

**Todos os outros usuários também usam senha `user123`**

---

## 🎯 **Dicas de Teste**

1. **Sempre começar com o admin** para ver todas as funcionalidades
2. **Testar diferentes status** de usuários (ativo/inativo)
3. **Aprovar/rejeitar pagamentos** para ver o fluxo completo
4. **Verificar logs no console** (F12) para debug
5. **Testar filtros** nas telas de usuários e pagamentos

**Todas as senhas são simples propositalmente para facilitar os testes!** 🚀