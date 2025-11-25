# CRM Simplificado

Sistema completo de CRM com integração WhatsApp, desenvolvido com Next.js 14, TypeScript e Supabase.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

🔗 **Repositório:** [github.com/Eveneto/sistema_crm_simples](https://github.com/Eveneto/sistema_crm_simples)

## 🚀 Stack Tecnológica

- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Estilização:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **WhatsApp:** Evolution API
- **Estado Global:** Zustand
- **Gráficos:** Recharts
- **Drag and Drop:** @dnd-kit

## 📋 Funcionalidades

- ✅ Sistema de autenticação completo
- ✅ Dashboard com métricas em tempo real
- ✅ Gestão de conversas com WhatsApp
- ✅ CRM com Kanban de negócios
- ✅ Gestão de contatos e atividades
- ✅ Integração com múltiplos canais
- ✅ Tema dark/light
- ✅ Notificações em tempo real

## 🛠️ Instalação e Configuração

### Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (gratuita)
- Evolution API configurada (opcional para WhatsApp)

### Passo a passo

1. **Clone o repositório:**

```bash
git clone https://github.com/Eveneto/sistema_crm_simples.git
cd sistema_crm_simples
```

2. **Instale as dependências:**

```bash
npm install
```

3. **Configure as variáveis de ambiente:**

```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
EVOLUTION_API_URL=sua_evolution_api_url
EVOLUTION_API_KEY=sua_evolution_api_key
```

4. **Configure o banco de dados Supabase:**

- Acesse [supabase.com](https://supabase.com)
- Crie um novo projeto
- Execute os scripts SQL em `supabase/migrations/`

5. **Rode o projeto em desenvolvimento:**

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## � Documentação do Projeto

Este projeto possui documentação completa e profissional:

| Documento                                          | Descrição                                     |
| -------------------------------------------------- | --------------------------------------------- |
| [CODE_REVIEW_GUIDE.md](CODE_REVIEW_GUIDE.md)       | Guia completo de Clean Code e Code Review     |
| [PLANEJAMENTO_TECNICO.md](PLANEJAMENTO_TECNICO.md) | Arquitetura técnica e stack detalhada         |
| [PLANEJAMENTO_SCRUM.md](PLANEJAMENTO_SCRUM.md)     | Metodologia Ágil Scrum + Roadmap de 6 sprints |
| [TEMPLATES_SCRUM.md](TEMPLATES_SCRUM.md)           | Templates práticos para cerimônias e gestão   |
| [CONTRIBUTING.md](CONTRIBUTING.md)                 | Guia de contribuição para desenvolvedores     |
| [SETUP.md](SETUP.md)                               | Guia de instalação e configuração             |

## �📁 Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rotas de autenticação
│   ├── (dashboard)/       # Rotas protegidas
│   └── api/               # API Routes
├── components/            # Componentes React
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   ├── dashboard/        # Dashboard components
│   ├── chat/             # Chat components
│   └── kanban/           # Kanban components
├── lib/                   # Utilitários e configurações
│   ├── supabase/         # Cliente Supabase
│   └── evolution/        # Cliente Evolution API
├── stores/               # Zustand stores
├── types/                # TypeScript types
└── hooks/                # Custom hooks
```

## 🎨 Padrões de Código

Este projeto segue rigorosamente os princípios de **Clean Code**. Consulte:

- [CODE_REVIEW_GUIDE.md](CODE_REVIEW_GUIDE.md) - Guia completo de boas práticas
- [PLANEJAMENTO_TECNICO.md](PLANEJAMENTO_TECNICO.md) - Planejamento técnico detalhado

### Principais regras:

- ✅ Funções com ≤ 20 linhas
- ✅ Nomes descritivos (sem abreviações)
- ✅ Single Responsibility Principle
- ✅ TypeScript strict mode
- ✅ Sem `any` (use tipos específicos)
- ✅ Testes para novas funcionalidades

## 🧪 Testes

```bash
# Rodar testes
npm test

# Rodar testes em watch mode
npm run test:watch

# Cobertura de testes
npm run test:coverage
```

## 📦 Build e Deploy

```bash
# Build de produção
npm run build

# Rodar build localmente
npm start
```

### Deploy na Vercel (recomendado)

1. Conecte seu repositório GitHub à Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push na `main`

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

**Importante:** Todo PR deve seguir o [CODE_REVIEW_GUIDE.md](CODE_REVIEW_GUIDE.md)

## 📝 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Roda build de produção
npm run lint         # Roda ESLint
npm run lint:fix     # Corrige problemas do ESLint
npm run format       # Formata código com Prettier
npm run type-check   # Verifica tipos TypeScript
```

## 🔒 Segurança

- Nunca commite arquivos `.env`
- Use variáveis de ambiente para credenciais
- Todas as rotas protegidas têm middleware de autenticação
- Validação de dados no backend (Supabase RLS)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- Eveneto - [@Eveneto](https://github.com/Eveneto)

## 🙏 Agradecimentos

- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Supabase](https://supabase.com/) - Backend as a Service
- [Evolution API](https://evolution-api.com/) - WhatsApp Integration
- Comunidade Next.js e React

---

**Desenvolvido com ❤️ seguindo princípios de Clean Code**
