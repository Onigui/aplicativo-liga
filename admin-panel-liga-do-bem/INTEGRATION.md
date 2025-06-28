# 🔗 Guia de Integração - Backend

Este documento explica como integrar o painel administrativo com o backend da Liga do Bem.

## 📋 Rotas Esperadas pelo Frontend

### 🔐 Autenticação

#### `POST /api/auth/login`
**Descrição**: Login do administrador
**Body**:
```json
{
  "cpf": "12345678901",
  "password": "senha123"
}
```
**Resposta esperada**:
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "Admin Silva",
    "cpf": "12345678901",
    "email": "admin@ligadobem.org.br",
    "role": "admin"
  }
}
```

#### `POST /api/auth/verify-token`
**Descrição**: Verificar se o token é válido
**Headers**: `Authorization: Bearer {token}`
**Resposta esperada**:
```json
{
  "valid": true,
  "user": {
    "id": 1,
    "name": "Admin Silva",
    "role": "admin"
  }
}
```

#### `POST /api/auth/logout`
**Descrição**: Logout do administrador
**Headers**: `Authorization: Bearer {token}`
**Resposta esperada**:
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

---

### 📊 Dashboard

#### `GET /api/admin/dashboard`
**Descrição**: Estatísticas do dashboard
**Headers**: `Authorization: Bearer {token}`
**Resposta esperada**:
```json
{
  "totalUsers": 156,
  "activeUsers": 142,
  "inactiveUsers": 14,
  "totalRevenue": 15600.00,
  "monthlyRevenue": 2800.00,
  "pendingPayments": 8,
  "overdue": 3,
  "revenueGrowth": 12.5,
  "userGrowth": 8.3,
  "revenueChart": [
    { "month": "Jan", "revenue": 2400, "users": 35 },
    { "month": "Fev", "revenue": 2200, "users": 42 },
    { "month": "Mar", "revenue": 2800, "users": 38 }
  ],
  "alerts": [
    {
      "id": 1,
      "type": "warning",
      "message": "3 pagamentos vencidos",
      "link": "/payments?status=overdue"
    }
  ]
}
```

---

### 👥 Usuários

#### `GET /api/admin/users`
**Descrição**: Listar usuários com paginação e filtros
**Query Params**:
- `page`: Página (padrão: 1)
- `limit`: Itens por página (padrão: 10)
- `search`: Busca por nome/CPF/email
- `status`: Filtro por status (active/inactive/all)

**Headers**: `Authorization: Bearer {token}`
**Resposta esperada**:
```json
{
  "users": [
    {
      "id": 1,
      "name": "João Silva",
      "cpf": "12345678901",
      "email": "joao@email.com",
      "phone": "14999887766",
      "status": "active",
      "joinDate": "2024-01-15T10:30:00Z",
      "lastLogin": "2024-01-20T14:22:00Z",
      "monthlyValue": 50.00,
      "totalPaid": 250.00,
      "address": {
        "street": "Rua das Flores, 123",
        "city": "Botucatu",
        "state": "SP",
        "zipCode": "18600000"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 16,
    "totalItems": 156,
    "itemsPerPage": 10
  }
}
```

#### `GET /api/admin/users/:id`
**Descrição**: Detalhes do usuário
**Headers**: `Authorization: Bearer {token}`
**Resposta esperada**:
```json
{
  "user": {
    "id": 1,
    "name": "João Silva",
    "cpf": "12345678901",
    "email": "joao@email.com",
    "phone": "14999887766",
    "status": "active",
    "joinDate": "2024-01-15T10:30:00Z",
    "lastLogin": "2024-01-20T14:22:00Z",
    "monthlyValue": 50.00,
    "totalPaid": 250.00,
    "address": {
      "street": "Rua das Flores, 123",
      "city": "Botucatu",
      "state": "SP",
      "zipCode": "18600000"
    },
    "paymentHistory": [
      {
        "id": 1,
        "month": "2024-01",
        "value": 50.00,
        "status": "paid",
        "paidAt": "2024-01-05T10:00:00Z"
      }
    ]
  }
}
```

#### `PUT /api/admin/users/:id/toggle-status`
**Descrição**: Ativar/desativar usuário
**Headers**: `Authorization: Bearer {token}`
**Resposta esperada**:
```json
{
  "success": true,
  "message": "Status do usuário alterado com sucesso",
  "user": {
    "id": 1,
    "status": "inactive"
  }
}
```

---

### 💳 Pagamentos

#### `GET /api/admin/payments`
**Descrição**: Listar pagamentos
**Query Params**:
- `page`: Página (padrão: 1)
- `limit`: Itens por página (padrão: 10)
- `status`: Filtro por status (pending/approved/rejected/all)
- `user`: Filtro por usuário

**Headers**: `Authorization: Bearer {token}`
**Resposta esperada**:
```json
{
  "payments": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "name": "João Silva",
        "cpf": "12345678901"
      },
      "value": 50.00,
      "month": "2024-01",
      "status": "pending",
      "paymentMethod": "pix",
      "receipt": "https://example.com/receipt1.jpg",
      "submittedAt": "2024-01-05T10:00:00Z",
      "reviewedAt": null,
      "reviewedBy": null
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 45,
    "itemsPerPage": 10
  }
}
```

#### `GET /api/admin/payments/:id`
**Descrição**: Detalhes do pagamento
**Headers**: `Authorization: Bearer {token}`
**Resposta esperada**:
```json
{
  "payment": {
    "id": 1,
    "user": {
      "id": 1,
      "name": "João Silva",
      "cpf": "12345678901",
      "email": "joao@email.com",
      "phone": "14999887766"
    },
    "value": 50.00,
    "month": "2024-01",
    "status": "pending",
    "paymentMethod": "pix",
    "receipt": "https://example.com/receipt1.jpg",
    "submittedAt": "2024-01-05T10:00:00Z",
    "reviewedAt": null,
    "reviewedBy": null,
    "notes": "Pagamento via PIX"
  }
}
```

#### `PUT /api/admin/payments/:id/approve`
**Descrição**: Aprovar pagamento
**Headers**: `Authorization: Bearer {token}`
**Body**:
```json
{
  "notes": "Comprovante válido"
}
```
**Resposta esperada**:
```json
{
  "success": true,
  "message": "Pagamento aprovado com sucesso",
  "payment": {
    "id": 1,
    "status": "approved",
    "reviewedAt": "2024-01-20T15:30:00Z",
    "reviewedBy": "Admin Silva"
  }
}
```

#### `PUT /api/admin/payments/:id/reject`
**Descrição**: Rejeitar pagamento
**Headers**: `Authorization: Bearer {token}`
**Body**:
```json
{
  "reason": "Comprovante ilegível"
}
```
**Resposta esperada**:
```json
{
  "success": true,
  "message": "Pagamento rejeitado",
  "payment": {
    "id": 1,
    "status": "rejected",
    "reviewedAt": "2024-01-20T15:30:00Z",
    "reviewedBy": "Admin Silva",
    "rejectionReason": "Comprovante ilegível"
  }
}
```

---

### ⚙️ Configurações

#### `GET /api/admin/settings`
**Descrição**: Obter configurações do sistema
**Headers**: `Authorization: Bearer {token}`
**Resposta esperada**:
```json
{
  "monthlyValue": 50.00,
  "gracePeriod": 7,
  "autoApprove": false,
  "notifications": {
    "email": true,
    "sms": false,
    "whatsapp": true
  },
  "paymentMethods": ["pix", "boleto", "cartao"],
  "systemInfo": {
    "version": "1.0.0",
    "lastUpdate": "2024-01-20T10:00:00Z"
  }
}
```

#### `PUT /api/admin/settings`
**Descrição**: Atualizar configurações
**Headers**: `Authorization: Bearer {token}`
**Body**:
```json
{
  "monthlyValue": 55.00,
  "gracePeriod": 10,
  "autoApprove": false,
  "notifications": {
    "email": true,
    "sms": false,
    "whatsapp": true
  }
}
```
**Resposta esperada**:
```json
{
  "success": true,
  "message": "Configurações atualizadas com sucesso"
}
```

---

### 📈 Relatórios

#### `GET /api/admin/reports`
**Descrição**: Obter dados para relatórios
**Query Params**:
- `startDate`: Data inicial (YYYY-MM-DD)
- `endDate`: Data final (YYYY-MM-DD)
- `type`: Tipo do relatório (revenue/users/payments/all)

**Headers**: `Authorization: Bearer {token}`
**Resposta esperada**:
```json
{
  "period": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "revenue": {
    "total": 15600.00,
    "monthly": [
      { "month": "2024-01", "value": 2800.00 }
    ]
  },
  "users": {
    "total": 156,
    "new": 12,
    "active": 142
  },
  "payments": {
    "total": 312,
    "approved": 289,
    "pending": 15,
    "rejected": 8
  }
}
```

---

## 🛡️ Autenticação e Segurança

### JWT Token
- Todos os endpoints (exceto login) requerem token JWT
- Token deve ser enviado no header: `Authorization: Bearer {token}`
- Token expira em 24 horas
- Em caso de token inválido, retornar status 401

### Verificação de Role
- Apenas usuários com `role: "admin"` podem acessar essas rotas
- Retornar status 403 se usuário não for admin

### Validação de Dados
- Validar todos os campos obrigatórios
- Sanitizar inputs para prevenir XSS
- Validar CPF format

---

## 🎯 Próximos Passos

1. **Implementar as rotas no backend**
2. **Configurar CORS** para permitir requests do frontend
3. **Testar integração** com o painel
4. **Implementar logs** para auditoria
5. **Configurar rate limiting** para segurança

---

## 🆘 Tratamento de Erros

### Formato de Resposta de Erro
```json
{
  "success": false,
  "message": "Mensagem de erro amigável",
  "error": "VALIDATION_ERROR",
  "details": {
    "field": "cpf",
    "message": "CPF inválido"
  }
}
```

### Códigos de Status HTTP
- `200`: Sucesso
- `201`: Criado com sucesso
- `400`: Erro de validação
- `401`: Não autenticado
- `403`: Sem permissão
- `404`: Não encontrado
- `500`: Erro interno do servidor

---

## 📱 Contato

Para dúvidas sobre a integração:
- **Email**: dev@ligadobem.org.br
- **Telefone**: (14) 3815-1234

---

🐾 **Liga do Bem - Cuidando com tecnologia** 🐾