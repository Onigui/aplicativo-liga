# 🗄️ Guia de Migração do Banco de Dados - Liga do Bem

## 📋 Situação Atual
- **Banco atual**: `liga-do-bem-db` (plano free que venceu)
- **Problema**: Banco expirado, aplicação não funciona
- **Solução**: Migrar para novo banco no Render

## 🚀 Passo a Passo da Migração

### **1. Criar Novo Banco no Render**

1. Acesse: https://dashboard.render.com
2. Clique em **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `liga-do-bem-db-v2`
   - **Database**: `liga_do_bem_v2`
   - **User**: `liga_do_bem_user_v2`
   - **Plan**: Free (ou Starter se preferir)
   - **Region**: Mesma do seu app atual
4. Clique em **"Create Database"**
5. **COPIE** a `DATABASE_URL` gerada

### **2. Configurar Variáveis de Ambiente**

1. Copie o arquivo `env.migration.example` para `.env`:
   ```bash
   cp env.migration.example .env
   ```

2. Edite o arquivo `.env` e configure:
   ```env
   # Banco antigo (se ainda acessível)
   OLD_DATABASE_URL=postgresql://usuario:senha@host:porta/banco_antigo
   
   # Banco novo (criado no passo 1)
   NEW_DATABASE_URL=postgresql://usuario:senha@host:porta/banco_novo
   ```

### **3. Executar Migração**

#### Opção A: Migração Completa (Recomendada)
```bash
npm run migrate:full
```

#### Opção B: Migração Manual (se a opção A falhar)
```bash
# 1. Exportar dados do banco antigo
npm run migrate:export

# 2. Importar dados para o banco novo
npm run migrate:import arquivo_exportado.json
```

### **4. Atualizar Configuração no Render**

1. Acesse o serviço **"liga-do-bem-api"** no Render
2. Vá para **"Environment"**
3. Atualize a variável `DATABASE_URL` com a URL do novo banco
4. Salve as alterações
5. O Render fará deploy automático

### **5. Verificar Migração**

1. Acesse: https://liga-do-bem-api.onrender.com/api/health
2. Deve retornar status "OK"
3. Teste login e funcionalidades principais

## 📊 Estrutura das Tabelas Migradas

- ✅ **users** - Usuários/membros
- ✅ **companies** - Empresas parceiras  
- ✅ **donations** - Doações
- ✅ **payments** - Pagamentos
- ✅ **events** - Eventos
- ✅ **event_participants** - Participantes de eventos
- ✅ **activity_logs** - Logs de atividades
- ✅ **system_settings** - Configurações do sistema

## 🔧 Scripts Disponíveis

```bash
# Migração completa
npm run migrate:full

# Exportar dados do banco antigo
npm run migrate:export

# Importar dados para banco novo
npm run migrate:import arquivo.json

# Ver instruções de configuração
npm run migrate:instructions
```

## ⚠️ Troubleshooting

### Erro de Conexão
- Verifique se as URLs estão corretas
- Confirme se o banco novo foi criado
- Teste a conexão manualmente

### Erro de Permissão
- Verifique se o usuário tem permissões adequadas
- Confirme se o banco está acessível

### Dados Não Aparecem
- Verifique os logs da migração
- Confirme se todas as tabelas foram criadas
- Teste queries manuais no banco

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs da migração
2. Confirme as configurações do Render
3. Teste a conexão com o banco novo
4. Verifique se todas as variáveis estão corretas

## ✅ Checklist Final

- [ ] Novo banco criado no Render
- [ ] Variáveis de ambiente configuradas
- [ ] Migração executada com sucesso
- [ ] DATABASE_URL atualizada no Render
- [ ] Deploy realizado
- [ ] Aplicação funcionando
- [ ] Testes realizados

---

**🎉 Migração Concluída!** Sua aplicação deve estar funcionando perfeitamente com o novo banco de dados.