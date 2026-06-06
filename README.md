# LavaRápido — Painel Administrativo Web

Sistema SaaS de gestão para lava-rápidos, desenvolvido com
React + Firebase. Painel web complementar ao app mobile em
React Native.

## Demo

[https://lavarapido-wl.web.app](https://lavarapido-wl.web.app)

## Funcionalidades

- Dashboard com KPIs em tempo real (agendamentos, receita, status)
- Agenda Kanban com drag entre colunas (Agendado → Em andamento → Concluído)
- Edição de agendamentos (serviço, horário, cliente, veículo)
- Cadastro e gerenciamento de serviços e preços
- Relatórios financeiros com gráfico de receita e exportação CSV
- Configurações do estabelecimento
- Autenticação Firebase com rotas protegidas
- Multi-tenant (cada estabelecimento com dados isolados)

## Stack

- React 18 + Vite
- Tailwind CSS
- Firebase Auth + Firestore (tempo real com onSnapshot)
- React Router v6
- Recharts (gráficos)
- React Icons

## Como rodar localmente

```bash
git clone https://github.com/Le-Toledo/LavaRapidoJS.git
cd LavaRapidoJS/lavarapido-web
npm install
npm run dev
```

## Estrutura do projeto

```
lavarapido-web/
├── src/
│   ├── assets/            # Imagens e recursos estáticos
│   ├── components/
│   │   ├── layout/        # Header, Sidebar, MainLayout, ProtectedRoute
│   │   └── ui/            # KpiCard, KanbanCard/Coluna, Modais, Gráficos, Toast
│   ├── contexts/          # AuthContext, EstabelecimentoContext
│   ├── hooks/             # useAgendamentos, useServicos, useRelatorios
│   ├── pages/             # Dashboard, Agenda, Servicos, Relatorios, Configuracoes, Login
│   ├── services/          # firebase.js (inicialização e helpers)
│   ├── App.jsx            # Rotas principais
│   └── main.jsx           # Entry point
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
└── firebase.json
```

## Licença

MIT
