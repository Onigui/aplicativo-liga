# 🐾 Liga do Bem - Botucatu

Sistema completo para ONG de proteção animal em Botucatu-SP, integrando app público, painel administrativo e sistema de parcerias empresariais.

## 🌟 Características

- **App Público**: Para membros da comunidade
- **Painel Administrativo**: Gestão completa da ONG
- **Sistema de Parcerias**: Empresas oferecem descontos aos membros
- **App Mobile**: Versão Android com Capacitor
- **Geolocalização**: Encontre empresas parceiras próximas
- **Sistema de Doações**: Histórico e gestão de contribuições

## 🚀 Tecnologias

- **Frontend**: React 19 + Tailwind CSS
- **Backend**: Node.js + Express
- **Mobile**: Capacitor Android
- **Banco de Dados**: PostgreSQL (Render)
- **Deploy**: Render + GitHub
- **Autenticação**: JWT Tokens

## 📱 Funcionalidades

### Para Membros
- ✅ Cadastro e login por CPF
- ✅ Carteirinha digital
- ✅ Busca de empresas parceiras
- ✅ Sistema de doações
- ✅ Guia PET e legislação
- ✅ Eventos da ONG
- ✅ Telefones de emergência

### Para Empresas
- ✅ Cadastro como parceira
- ✅ Definição de descontos
- ✅ Horários de funcionamento
- ✅ Aprovação administrativa

### Para Administradores
- ✅ Dashboard com métricas
- ✅ Gestão de usuários
- ✅ Aprovação de empresas
- ✅ Relatórios e analytics
- ✅ Configurações do sistema

## 🛠️ Instalação Local

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Git

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/liga-do-bem-app.git
cd liga-do-bem-app
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
# Edite o arquivo .env.local com suas configurações
```

4. **Inicie o desenvolvimento**
```bash
# Inicia frontend + backend
npm run dev

# Ou apenas o frontend
npm start
```

## 🌐 URLs de Acesso

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Admin**: http://localhost:3000/admin

## 🔐 Credenciais de Teste

### Administrador
- **CPF**: 000.000.000-00
- **Senha**: admin123

### Usuário Teste
- **CPF**: 123.456.789-01
- **Senha**: 123456

## 📊 Métricas Atuais

- 🐕 **847 animais resgatados**
- 👥 **2.341 membros ativos**
- 🏢 **156 empresas parceiras**
- 💰 **R$ 89k arrecadados em 2024**

## 🚀 Deploy

### Render (Recomendado)

1. **Conecte seu repositório GitHub ao Render**
2. **Configure as variáveis de ambiente**:
   - `NODE_ENV=production`
   - `DATABASE_URL=sua_url_postgresql`
   - `JWT_SECRET=sua_chave_secreta`

3. **Deploy automático** a cada push para `main`

### Netlify (Alternativo)

```bash
npm run build
# Faça upload da pasta build/
```

## 📱 App Mobile

### Build Android
```bash
npm run build
npx cap add android
npx cap sync
npx cap open android
```

### Build iOS
```bash
npm run build
npx cap add ios
npx cap sync
npx cap open ios
```

## 🔧 Scripts Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run dev` - Inicia frontend + backend
- `npm test` - Executa testes
- `npm run deploy:prepare` - Prepara para deploy

## 📁 Estrutura do Projeto

```
liga-do-bem-app/
├── src/
│   ├── components/          # Componentes React
│   │   ├── admin/          # Painel administrativo
│   │   └── services/       # Serviços de API
│   ├── config/             # Configurações
│   └── App.js              # App principal
├── backend-unico/          # Backend Express
├── android/                # App Android (Capacitor)
├── netlify/                # Funções Netlify
└── public/                 # Arquivos estáticos
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Contato

- **Email**: contato@ligadobembotucatu.org.br
- **Telefone**: (14) 3815-1234
- **Site**: https://ligadobembotucatu.org.br

## 🙏 Agradecimentos

- Comunidade de Botucatu
- Empresas parceiras
- Voluntários da ONG
- Contribuidores do projeto

---

**🐾 Juntos fazemos a diferença na vida dos animais! 🐾** 