# 📝 Projeto To-Do List — API REST

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)

API RESTful para gerenciamento de tarefas (*To-Do List*) desenvolvida em **Node.js** com **TypeScript** e **Express**. O projeto foi concebido durante a **Mentoria Mithril (Turma Condado)** para demonstrar na prática o desacoplamento arquitetural e a evolução da camada de persistência.

---

## 💡 A Lição Arquitetural do Projeto

O objetivo principal desta API é ilustrar que **a camada onde os dados residem é uma decisão independente da interface HTTP**:
- As rotas permanecem idênticas.
- As respostas JSON e status HTTP permanecem idênticos.
- Quem consome a API não percebe se os dados estão em memória, num banco SQLite ou gerenciados por um ORM.

### Evolução da Persistência

| Etapa | Tema | Estratégia de Persistência |
| :--- | :--- | :--- |
| **Fase 1** | API em Memória | Array volátil em tempo de execução |
| **Fase 2** | Banco Relacional Embutido | **SQLite** com SQL nativo via `better-sqlite3` |
| **Fase 3** | Mapeamento Objeto-Relacional | **PostgreSQL** + **Prisma ORM** (passo a passo em [`PASSO_A_PASSO_POSTGRES_PRISMA.md`](PASSO_A_PASSO_POSTGRES_PRISMA.md)) |

---

## 📌 Modelo de Dados (Tarefa)

A estrutura da tabela `tarefas` é concisa e objetiva:

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` | Identificador único numérico |
| `titulo` | `TEXT NOT NULL` | Descrição da tarefa |
| `feito` | `INTEGER DEFAULT 0` (Boolean) | Status de conclusão (0 = pendente, 1 = concluída) |
| `criadoEm` | `TEXT NOT NULL` | Data e hora de criação |

---

## 📡 Contrato da API (Endpoints)

| Método | Rota | Descrição | Resposta de Sucesso | Casos de Erro |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/tarefas` | Lista todas as tarefas | `200 OK` + Array de tarefas | — |
| `POST` | `/tarefas` | Cria uma nova tarefa | `201 Created` + Tarefa criada | `400 Bad Request` (título ausente) |
| `PATCH` | `/tarefas/:id` | Alterna status (feita/não feita) | `200 OK` + Tarefa atualizada | `404 Not Found` (id inexistente) |
| `DELETE` | `/tarefas/:id` | Remove uma tarefa | `204 No Content` | `404 Not Found` (id inexistente) |

---

## 🛠️ Tecnologias Utilizadas

- **Linguagem & Runtime:** [Node.js](https://nodejs.org/) (v22+) e [TypeScript](https://www.typescriptlang.org/)
- **Servidor HTTP:** [Express](https://expressjs.com/) (v5)
- **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/) 16
- **ORM:** [Prisma](https://www.prisma.io/) 7.10.1 com o driver adapter `@prisma/adapter-pg`
- **Execução em Desenvolvimento:** [tsx](https://github.com/privatenumber/tsx)
- **Configuração de Ambiente:** `dotenv`

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- [Node.js](https://nodejs.org/) (v22 ou superior; testado com v24.18.0)
- [npm](https://www.npmjs.com/)
- [PostgreSQL](https://www.postgresql.org/download/) 16 instalado e rodando na máquina

### 1. Clonar o repositório
```bash
git clone https://github.com/douglasmeneses/projeto-todolist.git
cd projeto-todolist
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz, trocando a senha pela do seu usuário `postgres`:
```env
PORT=3000
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/todolist?schema=public"
```

### 4. Criar a tabela e gerar o Prisma Client
```bash
npx prisma migrate dev
npx prisma generate
```
O `migrate dev` cria o banco `todolist` se ele não existir e aplica as migrations de `prisma/migrations`.

### 5. Iniciar o servidor em modo de desenvolvimento
```bash
npm run dev
```

A API estará respondendo em `http://localhost:3000`.

---

## 👨‍💻 Autor

Desenvolvido por **Douglas Meneses** na Mentoria Mithril.

- 💼 GitHub: [@douglasmeneses](https://github.com/douglasmeneses)
- ✉️ Email: [meneses.doug@gmail.com](mailto:meneses.doug@gmail.com)
