
# 🧪 Fórmula AI - Sistema Inteligente para Farmácias de Manipulação

Uma plataforma avançada de inteligência artificial para farmácias de manipulação, oferecendo análise inteligente de fórmulas, sugestões de otimização e gestão completa de prescrições.

## ✨ Principais Funcionalidades

- 🤖 **Análise Inteligente de Fórmulas** - IA especializada em farmacologia
- 📊 **Dashboard Completo** - Métricas e relatórios avançados
- 👥 **Gestão Multi-tenant** - Suporte para múltiplas organizações
- 🔐 **Sistema de Autenticação** - Controle de acesso baseado em roles
- 📱 **Interface Responsiva** - Funciona em todos os dispositivos
- ⚡ **Performance Otimizada** - Cache inteligente e monitoramento
- 📈 **Monitoramento em Tempo Real** - Sistema completo de observabilidade

## 🏗️ Arquitetura

### Frontend
- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **Shadcn/UI** para componentes
- **React Router** para navegação
- **React Query** para gerenciamento de estado

### Backend
- **Supabase** como BaaS (Backend as a Service)
- **PostgreSQL** como banco de dados
- **Edge Functions** para processamento
- **Row Level Security (RLS)** para segurança

### Monitoramento & Observabilidade
- **Sistema de Métricas** - Coleta automática de performance
- **Alertas Inteligentes** - Notificações proativas
- **Dashboard de Saúde** - Visibilidade completa do sistema
- **Logging Estruturado** - Logs centralizados e pesquisáveis

## 🚀 Configuração do Ambiente

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta no Supabase
- Chave da API OpenAI

### Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd formula-ai
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Configure as variáveis necessárias
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ENABLE_DEBUG_LOGS=false
```

4. **Configure as variáveis do Supabase**
No dashboard do Supabase, adicione as seguintes variáveis de ambiente:
- `OPENAI_API_KEY` - Sua chave da API OpenAI
- `RESEND_API_KEY` - Chave para envio de emails (opcional)

5. **Execute as migrações**
```bash
npx supabase db push
```

6. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

## 🧪 Testes

### Executar todos os testes
```bash
npm run test
```

### Executar testes em modo watch
```bash
npm run test:watch
```

### Verificar cobertura
```bash
npm run test:coverage
```

### Lint e formatação
```bash
npm run lint
npm run format
```

## 📊 Monitoramento

O sistema inclui um sistema completo de monitoramento e observabilidade:

### Métricas Coletadas
- **Performance**: Tempo de resposta, throughput, taxa de erro
- **Recursos**: Uso de memória, CPU, rede
- **Negócio**: Número de consultas, usuários ativos, fórmulas processadas
- **Erros**: Rastreamento de exceções e falhas

### Dashboard de Monitoramento
Acesse `/monitoring` (apenas para administradores) para visualizar:
- Status geral do sistema
- Métricas de performance em tempo real
- Alertas ativos e histórico
- Saúde dos serviços (DB, IA, Storage)

### Alertas Automáticos
O sistema monitora automaticamente:
- Taxa de erro > 5%
- Tempo de resposta > 5 segundos
- Uso de memória > 80%
- Falhas de serviços críticos

## 🔧 Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run preview` - Preview do build
- `npm run test` - Executar testes
- `npm run lint` - Verificar código
- `npm run format` - Formatar código
- `npm run type-check` - Verificar tipos TypeScript

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── chat/           # Componentes do chat
│   ├── dashboard/      # Componentes do dashboard
│   ├── monitoring/     # Componentes de monitoramento
│   └── ...
├── hooks/              # Custom hooks
├── pages/              # Páginas da aplicação
├── services/           # Serviços e APIs
│   ├── MonitoringService.ts    # Serviço de monitoramento
│   ├── MetricsCollector.ts     # Coletor de métricas
│   └── AlertingService.ts      # Sistema de alertas
├── utils/              # Utilitários
│   ├── logger.ts       # Sistema de logging
│   └── corsConfig.ts   # Configurações CORS
├── config/             # Configurações
│   └── security.ts     # Configurações de segurança
└── types/              # Definições de tipos
```

## 🔒 Segurança

### Medidas Implementadas
- **Autenticação JWT** via Supabase Auth
- **Row Level Security (RLS)** no banco de dados
- **Sanitização de entrada** para prevenir XSS
- **Rate limiting** nas APIs
- **CORS configurado** adequadamente
- **Logs de auditoria** para operações sensíveis

### Roles e Permissões
- **owner**: Acesso total à organização
- **admin**: Gerenciamento de usuários e configurações
- **user**: Acesso básico às funcionalidades
- **doctor**: Acesso específico para médicos parceiros

## 🌍 Deploy

### Netlify/Vercel
```bash
npm run build
# Deploy da pasta dist/
```

### Docker
```bash
docker build -t formula-ai .
docker run -p 3000:3000 formula-ai
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Padrões de Código
- Use TypeScript para tipagem
- Siga as regras do ESLint configurado
- Escreva testes para novas funcionalidades
- Mantenha componentes pequenos e focados

## 📈 Roadmap

- [ ] Sistema de notificações push
- [ ] Integração com sistemas de farmácia
- [ ] App mobile nativo
- [ ] API pública para parceiros
- [ ] Machine Learning avançado
- [ ] Relatórios automatizados

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

- 📧 Email: suporte@formula-ai.app
- 📚 Documentação: [docs.formula-ai.app](https://docs.formula-ai.app)
- 💬 Discord: [Comunidade Formula AI](https://discord.gg/formula-ai)

---

**Desenvolvido com ❤️ para revolucionar a farmácia de manipulação**
