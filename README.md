# CashFlowProject

![.NET](https://img.shields.io/badge/.NET-10-512BD4?style=flat-square&logo=dotnet)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite)
![Entity Framework](https://img.shields.io/badge/EF%20Core-8-512BD4?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)

**Sistema de Gestão de Fluxo de Caixa Corporativo** — API REST (.NET 10) com frontend em React/TypeScript. Implementa cadastro de pessoas, lançamento de transações financeiras com validações de negócio, exclusão em cascata e relatórios consolidados em tempo real.

---

![Preview do Sistema](WIN.png)

---

## Requisitos Técnicos Atendidos

| Requisito | Implementação | Status |
|---|---|---|
| Validação de menores de idade | Bloqueio automático para lançamento de receitas por usuários com menos de 18 anos (`TransacoesController.cs`) | ✅ |
| Cascade delete | Exclusão em cascata de transações ao remover pessoa (`PessoasController.cs`, com `.Include()`) | ✅ |
| Relatório consolidado | Cálculo de totais por pessoa e saldo líquido geral (`RelatoriosController.cs`) | ✅ |
| API RESTful | 6 endpoints (GET/POST/DELETE) com respostas JSON tipadas | ✅ |
| Tipagem forte (TypeScript) | Interfaces `Pessoa`, `Transacao`, `PorPessoaItem`, `Relatorio`, sem uso de `any` | ✅ |
| Validação de entrada | Verificação de existência da pessoa e de tipo de transação válido | ✅ |
| UI corporativa | Design minimalista fintech, paleta sóbria e hierarquia visual | ✅ |
| Clean code | Sem comentários explicativos, nomes claros, separação de responsabilidades | ✅ |

---

## Arquitetura

### Back-end (.NET 10)

```
CashFlowAPI
├── Controllers/
│   ├── PessoasController.cs      → CRUD de pessoas + cascade delete
│   ├── TransacoesController.cs   → Validações e regras de negócio
│   └── RelatoriosController.cs   → Agregações e cálculos consolidados
├── Models/
│   ├── Pessoa.cs
│   ├── Transacao.cs
│   └── DataContext.cs            → EF Core
└── Program.cs                    → Configuração de CORS, DI e migrations
```

### Front-end (React + TypeScript)

```
cashflow-frontend/src
├── App.tsx          → Componente principal
├── main.tsx         → Entry point
├── index.css        → Reset e estilos base
└── vite.config.ts   → Configuração do Vite
```

---

## Como Executar

### Back-end

```bash
cd CashFlowAPI
dotnet build
dotnet run
```

API disponível em: `http://localhost:5007`

### Front-end

```bash
cd cashflow-frontend
npm install
npm run dev
```

Frontend disponível em: `http://localhost:5173`

---

## Endpoints da API

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/pessoas` | Lista todas as pessoas |
| `POST` | `/api/pessoas` | Cadastra uma nova pessoa |
| `DELETE` | `/api/pessoas/{id}` | Remove a pessoa e as transações vinculadas |
| `GET` | `/api/transacoes` | Lista todas as transações |
| `POST` | `/api/transacoes` | Registra uma nova transação com validações |
| `GET` | `/api/relatorios` | Retorna o relatório consolidado (receitas, despesas, saldos) |

---

## Regras de Negócio

1. **Restrição por idade** — usuários menores de 18 anos só podem registrar despesas; receitas são bloqueadas.
2. **Validação de pessoa** — toda transação deve referenciar uma pessoa existente.
3. **Tipos de transação válidos** — o sistema aceita apenas `Despesa` ou `Receita`.
4. **Exclusão em cascata** — remover uma pessoa apaga automaticamente todas as transações vinculadas a ela.
5. **Cálculo de saldo** — saldo individual = total de receitas − total de despesas.

---

## Banco de Dados

SQLite, com migrations gerenciadas via EF Core:

- Tabela `Pessoas` (`Id`, `Nome`, `Idade`)
- Tabela `Transacoes` (`Id`, `PessoaId`, `Descricao`, `Valor`, `Tipo`, `Data`)
- Relacionamento one-to-many com integridade referencial garantida por constraint

---

## Design & UX

- **Paleta corporativa:** tons sóbrios de fintech (`#1e293b`, `#059669`, `#dc2626`)
- **Tipografia:** fontes do sistema (SF Pro, Segoe UI, Roboto)
- **Layout:** grid responsivo em 2 colunas, com painel de extrato consolidado
- **Acessibilidade:** aria-labels, contraste WCAG AA, navegação por teclado

---

## Dependências Principais

**Backend**
- `Microsoft.EntityFrameworkCore` — ORM
- `Microsoft.AspNetCore.Mvc` — framework web

**Frontend**
- `react` — biblioteca de UI
- `axios` — cliente HTTP
- `typescript` — tipagem estática

---

## Destaques da Implementação

- Código autoexplicativo, sem comentários redundantes
- Tipagem rigorosa em TypeScript, sem uso de `any`
- Regras de negócio centralizadas no backend, com feedback claro ao usuário
- Uso de `Promise.all()` para paralelizar chamadas e índices no banco para performance
- Interface limpa: sombras mínimas, espaçamento consistente, sem gradientes desnecessários

---

## Licença

Projeto desenvolvido como exercício técnico de demonstração de competências.