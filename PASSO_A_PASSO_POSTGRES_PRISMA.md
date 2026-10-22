# 🐘 Passo a passo — Do SQLite ao PostgreSQL com Prisma

> **Fase 3 do projeto To-Do List.** Até aqui a API guardava as tarefas num arquivo
> SQLite, com SQL escrito à mão. Agora ela passa a usar um **PostgreSQL** de verdade,
> e quem escreve o SQL é o **Prisma**.
>
> A regra do jogo continua a mesma da aula de camadas: **as rotas e o JSON de resposta
> não mudam.** Quem usa a API não percebe a troca. O que muda é o miolo: o arquivo
> `banco.ts` e a camada `repositories`.

---

## 📦 Versões usadas (testadas)

Este passo a passo foi executado do começo ao fim, e as respostas mostradas aqui saíram
dessa execução. Só a porta do Postgres foi trocada para a padrão (`5432`), e datas e
horários vão ser os do momento em que você rodar. Se você usar outras versões, principalmente outra
versão major do Prisma, os nomes de arquivo e as mensagens podem ser diferentes.

| Ferramenta | Versão |
| :--- | :--- |
| Node.js | 24.18.0 |
| npm | 12.0.1 |
| PostgreSQL | 16.15 |
| `prisma` (CLI) | 7.10.1 |
| `@prisma/client` | 7.10.1 |
| `@prisma/adapter-pg` | 7.10.1 (traz o `pg` 8.23.1) |
| `express` | 5.2.1 |
| `typescript` | 7.0.2 |
| `tsx` | 4.23.13 |
| `dotenv` | 18.0.0 |

> ℹ️ O PostgreSQL do teste rodou num container com a imagem `postgres:16` (16.15), a
> mesma versão que o `apt` instala no Ubuntu 24.04 (`16.15-0ubuntu0.24.04.1`). Os
> comandos de instalação local da Etapa 1 não foram executados no teste.

---

## Etapa 1 — Instalar o PostgreSQL na sua máquina

O SQLite era **um arquivo**: a biblioteca lia e escrevia nele direto. O PostgreSQL é
**um programa que fica rodando** (um servidor), esperando conexões numa porta, por
padrão a `5432`. Ele tem usuário e senha. Pense num restaurante: com o SQLite você
cozinhava em casa; com o Postgres você faz o pedido no balcão e a cozinha prepara.

### Ubuntu / WSL

```bash
sudo apt update
sudo apt install -y postgresql
```

A instalação cria um usuário chamado `postgres`, ainda sem senha. Defina uma:

```bash
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
```

Confira se o servidor está de pé:

```bash
sudo -u postgres psql -c "SELECT version();"
```

### Windows e macOS

Baixe o instalador da versão 16 em <https://www.postgresql.org/download/>. Durante a
instalação, ele pede a senha do usuário `postgres`: **anote essa senha**, você vai
precisar dela na Etapa 5.

> 💡 Você **não precisa criar o banco `todolist` na mão**. O Prisma cria o banco
> sozinho na Etapa 8, se ele ainda não existir.

---

## Etapa 2 — Criar uma branch para a mudança

```bash
git checkout -b feat/postgres-prisma
```

Se algo der errado, a versão com SQLite continua intacta na branch anterior.

---

## Etapa 3 — Tirar o SQLite do projeto

```bash
npm uninstall better-sqlite3 @types/better-sqlite3
git rm schema.sql
```

O `schema.sql` sai porque, a partir de agora, quem descreve a tabela é o arquivo
`prisma/schema.prisma`, e o SQL é gerado nas *migrations* do Prisma.

---

## Etapa 4 — Instalar o Prisma

```bash
npm install -E @prisma/client@7.10.1 @prisma/adapter-pg@7.10.1
npm install -D -E prisma@7.10.1
```

O `-E` (`--save-exact`) grava a versão exata no `package.json` (`"7.10.1"` em vez de
`"^7.10.1"`), para todo mundo da turma rodar a mesma versão.

| Pacote | Para que serve |
| :--- | :--- |
| `prisma` | A ferramenta de linha de comando: cria migrations e gera o código do client. Só é usada em desenvolvimento, por isso o `-D`. |
| `@prisma/client` | O código que a API usa para conversar com o banco. |
| `@prisma/adapter-pg` | A "tomada" entre o Prisma e o PostgreSQL. No Prisma 7, ela é obrigatória. |

> ⚠️ **Aviso que vai aparecer no npm 12:**
>
> ```
> npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
> ```
>
> O npm 12 bloqueia, por segurança, scripts que os pacotes rodam na instalação. No teste
> deste passo a passo, **tudo funcionou sem aprovar nada**. Pode seguir.

---

## Etapa 5 — Inicializar o Prisma

```bash
npx prisma init --datasource-provider postgresql --output ../src/generated/prisma --no-skills
```

Isso cria:

- `prisma/schema.prisma`: onde a gente descreve as tabelas;
- `prisma7.config.ts`: a configuração do Prisma (sim, no Prisma 7.10 o nome é esse);
- uma linha `DATABASE_URL` no seu `.env`;
- a linha `/src/generated/prisma` no `.gitignore`. O código gerado não vai para o Git,
  cada um gera o seu.

Abra o `.env` e troque a `DATABASE_URL` pelo endereço do **seu** Postgres:

```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/todolist?schema=public"
```

Lendo a URL por partes:

```
postgresql://  postgres  :  postgres  @  localhost  :  5432  /  todolist
  protocolo    usuário      senha        máquina      porta    nome do banco
```

> 🔒 O `.env` tem senha. Ele já está no `.gitignore` e **nunca** vai para o GitHub.

---

## Etapa 6 — Corrigir o `prisma7.config.ts` para o TypeScript estrito

O arquivo gerado usa `process.env["DATABASE_URL"]`. Com o nosso `tsconfig` estrito, o
`npx tsc --noEmit` reclama:

```
prisma7.config.ts(11,3): error TS2375: Type '{ url: string | undefined; }' is not assignable to type '{ url?: string; shadowDatabaseUrl?: string; }' with 'exactOptionalPropertyTypes: true'.
```

O TypeScript está certo: se a variável não existir, o valor é `undefined`, e o Prisma
espera uma `string`. O próprio Prisma tem a função `env()`, que devolve `string` ou
para tudo com um erro claro. Deixe o arquivo assim:

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

---

## Etapa 7 — Descrever a tabela no `schema.prisma`

No fim de `prisma/schema.prisma`, acrescente o model:

```prisma
model Tarefa {
  id       Int      @id @default(autoincrement())
  titulo   String
  feito    Int      @default(0)
  criadoEm DateTime

  @@map("tarefas")
}
```

O que cada linha diz:

- `@id @default(autoincrement())`: o mesmo `INTEGER PRIMARY KEY AUTOINCREMENT` do SQLite.
- `feito Int @default(0)`: continua `0`/`1`, para o JSON de resposta não mudar.
- `criadoEm DateTime` **sem** `@default(now())`: na aula de camadas a gente decidiu que
  a data de criação é **regra de negócio**, então quem a define é o service, não o banco.
- `@@map("tarefas")`: no código o model se chama `Tarefa` (singular); no banco, a tabela
  continua `tarefas`.

---

## Etapa 8 — Criar a tabela (migration) e gerar o client

```bash
npx prisma migrate dev --name criar_tabela_tarefas
```

Saída esperada (trecho):

```
Loaded Prisma config from prisma7.config.ts.
Datasource "db": PostgreSQL database "todolist", schema "public" at "localhost:5432"

PostgreSQL database todolist created at localhost:5432

Applying migration `<data_e_hora>_criar_tabela_tarefas`

Your database is now in sync with your schema.
```

O Prisma escreveu o SQL por você. Abra `prisma/migrations/<data>_criar_tabela_tarefas/migration.sql`:

```sql
-- CreateTable
CREATE TABLE "tarefas" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "feito" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tarefas_pkey" PRIMARY KEY ("id")
);
```

Compare com o `schema.sql` que vocês escreveram na mão na aula do SQLite: é a mesma
tabela, agora no "sotaque" do PostgreSQL (`SERIAL`, `TIMESTAMP`).

Agora gere o client:

```bash
npx prisma generate
```

```
✔ Generated Prisma Client (7.10.1) to ./src/generated/prisma
```

> ⚠️ **No Prisma 7, o `migrate dev` não roda mais o `generate` sozinho.** Esqueceu o
> `generate`? A API nem sobe. Sempre que mexer no `schema.prisma`: `migrate dev` e
> depois `generate`.

---

## Etapa 9 — Trocar a conexão em `src/banco.ts`

Antes o arquivo abria o `todolist.db` e rodava o `schema.sql`. Agora ele cria o Prisma
Client conectado ao Postgres:

```ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";

const urlBanco: string | undefined = process.env.DATABASE_URL;

if (!urlBanco) {
  throw new Error("DATABASE_URL não definida no .env");
}

const adapter: PrismaPg = new PrismaPg(urlBanco);

export const prisma: PrismaClient = new PrismaClient({ adapter });
```

O `if` existe pelo mesmo motivo da Etapa 6: sem ele, o TypeScript não deixa passar um
`string | undefined` para o `PrismaPg`. E, se o `.env` estiver errado, a mensagem de
erro já diz exatamente o quê.

---

## Etapa 10 — Ajustar o tipo `Tarefa`

O Postgres guarda `criadoEm` como data de verdade, e o Prisma devolve um objeto `Date`.
Em `src/types/tarefa.ts`, troque só uma linha:

```ts
export interface Tarefa {
  id: number;
  titulo: string;
  feito: number;
  criadoEm: Date;
}

export interface CriarTarefaDTO {
  titulo?: string | undefined;
}

export interface AtualizarTarefaDTO {
  // Data Transfer Object
  titulo?: string | undefined;
  feito?: number | undefined;
}
```

> No JSON de resposta nada muda: o Express transforma o `Date` em texto no mesmo
> formato que o `toISOString()` gerava antes (`"2026-10-22T22:41:08.023Z"`).

---

## Etapa 11 — Reescrever o repository

É aqui que o SQL some. Cada função do repository troca uma query por um método do Prisma:

| Antes (SQL à mão) | Agora (Prisma) |
| :--- | :--- |
| `SELECT * FROM tarefas` | `prisma.tarefa.findMany()` |
| `SELECT * FROM tarefas WHERE id = ?` | `prisma.tarefa.findUnique({ where: { id } })` |
| `INSERT INTO tarefas ... RETURNING *` | `prisma.tarefa.create({ data })` |
| `UPDATE tarefas SET ... RETURNING *` | `prisma.tarefa.update({ where, data })` |
| `DELETE FROM tarefas WHERE id = ?` | `prisma.tarefa.delete({ where })` |

**A grande diferença:** o `better-sqlite3` era *síncrono*, a resposta vinha na hora. O
Prisma conversa com um servidor pela rede, então toda chamada é *assíncrona*: devolve
uma `Promise` e precisa de `await`. Pense na diferença entre pegar um copo d'água na
sua cozinha (síncrono) e pedir uma pizza (assíncrono: você faz o pedido e espera chegar).

`src/repositories/tarefas.repository.ts`:

```ts
import { prisma } from "../banco.js";
import type { Tarefa } from "../types/tarefa.js";

export async function buscarTodas(): Promise<Tarefa[]> {
  const tarefas: Tarefa[] = await prisma.tarefa.findMany({
    orderBy: { id: "asc" },
  });
  return tarefas;
}

export async function buscarPorId(id: number): Promise<Tarefa | undefined> {
  const tarefa: Tarefa | null = await prisma.tarefa.findUnique({
    where: { id },
  });
  return tarefa ?? undefined;
}

export async function criar(titulo: string, criadoEm: Date): Promise<Tarefa> {
  const novaTarefa: Tarefa = await prisma.tarefa.create({
    data: { titulo, criadoEm },
  });
  return novaTarefa;
}

export async function atualizar(
  id: number,
  titulo: string,
  feito: number,
): Promise<Tarefa> {
  const tarefaAtualizada: Tarefa = await prisma.tarefa.update({
    where: { id },
    data: { titulo, feito },
  });
  return tarefaAtualizada;
}

export async function deletar(id: number): Promise<void> {
  await prisma.tarefa.delete({ where: { id } });
}
```

Dois detalhes:

- **`orderBy: { id: "asc" }`**: sem ele, o PostgreSQL não garante a ordem da lista.
  Depois de um `UPDATE`, a tarefa editada pode aparecer no fim. O SQLite costumava
  devolver na ordem de inserção; o Postgres não promete isso.
- **`tarefa ?? undefined`**: o Prisma devolve `null` quando não acha nada, mas as
  camadas de cima já combinaram que "não achei" é `undefined`. O repository traduz, e
  ninguém acima dele precisa mudar.

---

## Etapa 12 — O `async` sobe pelas camadas

Se o repository devolve `Promise`, quem chama o repository também passa a esperar. O
service só ganha `async`, `await` e `Promise<...>` nos tipos; **nenhuma regra muda**.

`src/services/tarefas.service.ts`:

```ts
import * as tarefaRepository from "../repositories/tarefas.repository.js";
import type { Tarefa, AtualizarTarefaDTO } from "../types/tarefa.js";

export async function listarTarefas(): Promise<Tarefa[]> {
  const tarefas: Tarefa[] = await tarefaRepository.buscarTodas();
  return tarefas;
}

export async function buscarTarefaPorId(
  id: number,
): Promise<Tarefa | undefined> {
  const tarefaProcurada: Tarefa | undefined =
    await tarefaRepository.buscarPorId(id);
  return tarefaProcurada;
}

export async function criarTarefa(titulo: string): Promise<Tarefa> {
  const criadoEm: Date = new Date();
  const novaTarefa: Tarefa = await tarefaRepository.criar(titulo, criadoEm);
  return novaTarefa;
}

export async function atualizarTarefa(
  id: number,
  dados: AtualizarTarefaDTO,
): Promise<Tarefa | undefined> {
  const tarefaExistente: Tarefa | undefined =
    await tarefaRepository.buscarPorId(id);

  if (!tarefaExistente) {
    return undefined;
  }

  const tituloFinal: string = dados.titulo ?? tarefaExistente.titulo;
  const feitoFinal: number = dados.feito ?? tarefaExistente.feito;

  const tarefaAtualizada: Tarefa = await tarefaRepository.atualizar(
    id,
    tituloFinal,
    feitoFinal,
  );

  return tarefaAtualizada;
}

export async function deletarTarefa(id: number): Promise<boolean> {
  const tarefaExistente: Tarefa | undefined =
    await tarefaRepository.buscarPorId(id);

  if (!tarefaExistente) {
    return false;
  }

  await tarefaRepository.deletar(id);
  return true;
}
```

---

## Etapa 13 — O controller também vira `async`

Mesma coisa: `async`, `await` e retorno `Promise<void>`. O Express 5 entende funções
`async` e, se uma delas lançar erro, responde `500` sozinho.

Tem **uma novidade**: validar o `id`. No SQLite, `GET /tarefas/abc` virava
`WHERE id = NaN`, não achava nada e respondia `404`. O Prisma é mais rígido: recusa o
`NaN` e a API responde **500 com o erro na tela**. Para manter o contrato (`404`), o
controller confere o id antes de seguir.

`src/controllers/tarefas.controller.ts`:

```ts
import type { Request, Response } from "express";
import type { Tarefa, CriarTarefaDTO, AtualizarTarefaDTO } from "../types/tarefa.js";
import * as tarefasService from "../services/tarefas.service.js";

export async function listarTarefas(req: Request, res: Response): Promise<void> {
  const tarefas: Tarefa[] = await tarefasService.listarTarefas();
  res.json(tarefas); // status code 200 [OK]
}

export async function buscarTarefaPorId(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const idTarefa: number = Number(req.params.id);

  if (!Number.isInteger(idTarefa)) {
    // "abc" vira NaN, e o Prisma recusa NaN com erro 500
    res.status(404).send();
    return;
  }

  const tarefaProcurada: Tarefa | undefined =
    await tarefasService.buscarTarefaPorId(idTarefa);

  if (!tarefaProcurada) {
    // falsy values: undefined, null, 0, "", false, NaN
    res.status(404).send();
    return;
  }

  res.json(tarefaProcurada);
}

export async function criarTarefa(
  req: Request<{}, {}, CriarTarefaDTO>,
  res: Response,
): Promise<void> {
  const titulo: string | undefined = req.body.titulo;

  if (!titulo) {
    // undefined ou ""
    // corner/edge cases
    res.status(400).json("O título não foi enviado"); // 400 -> BAD REQUEST
    return;
  }

  const tituloFormatado: string = titulo.trim();

  if (!tituloFormatado) {
    res.status(400).json("O título não pode ser vazio"); // 400 -> BAD REQUEST
    return;
  }

  const novaTarefa: Tarefa = await tarefasService.criarTarefa(tituloFormatado);

  res.status(201).json(novaTarefa); // 201 -> CREATED
}

export async function atualizarTarefa(
  req: Request<{ id: string }, {}, AtualizarTarefaDTO>,
  res: Response,
): Promise<void> {
  const idTarefa: number = Number(req.params.id);

  if (!Number.isInteger(idTarefa)) {
    // "abc" vira NaN, e o Prisma recusa NaN com erro 500
    res.status(404).send();
    return;
  }

  const { titulo, feito }: AtualizarTarefaDTO = req.body;

  const tarefaAtualizada: Tarefa | undefined =
    await tarefasService.atualizarTarefa(idTarefa, { titulo, feito });

  if (!tarefaAtualizada) {
    res.status(404).send();
    return;
  }

  res.json(tarefaAtualizada);
}

export async function deletarTarefa(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const idTarefa: number = Number(req.params.id);

  if (!Number.isInteger(idTarefa)) {
    // "abc" vira NaN, e o Prisma recusa NaN com erro 500
    res.status(404).send();
    return;
  }

  const foiDeletado: boolean = await tarefasService.deletarTarefa(idTarefa);

  if (!foiDeletado) {
    res.status(404).send();
    return;
  }

  res.status(204).send(); // 204 -> NO CONTENT
}
```

---

## Etapa 14 — Carregar o `.env` antes de tudo, em `src/server.ts`

```ts
import "dotenv/config";
import app from "./app.js";

const PORT: number = Number(process.env.PORT) || 3000;

app.listen(PORT, (): void => {
  console.log(`Server running on port ${PORT}`);
});
```

**Por que mudou?** Antes era assim:

```ts
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();
```

Os `import` rodam **antes** de qualquer linha de código do arquivo. O `app.js` importa
as rotas, as rotas importam o controller... até chegar no `banco.ts`, que lê a
`DATABASE_URL`. Só depois de tudo isso o `dotenv.config()` roda, tarde demais. Com o
código antigo, a API não sobe:

```
Error: DATABASE_URL não definida no .env
```

O `import "dotenv/config"` na **primeira linha** carrega o `.env` antes dos outros imports.

---

## Etapa 15 — Conferir os tipos e subir a API

```bash
npx tsc --noEmit    # não pode aparecer nenhum erro
npm run dev
```

```
Server running on port 3000
```

---

## Etapa 16 — Testar por fora (o contrato não mudou)

Em outro terminal:

```bash
curl -s -X POST http://localhost:3000/tarefas \
  -H "Content-Type: application/json" -d '{"titulo":"Comprar pão"}'
# {"id":1,"titulo":"Comprar pão","feito":0,"criadoEm":"2026-10-22T22:41:08.023Z"}   → 201

curl -s -X POST http://localhost:3000/tarefas \
  -H "Content-Type: application/json" -d '{"titulo":"Estudar SQL"}'
# {"id":2,"titulo":"Estudar SQL","feito":0,"criadoEm":"..."}                          → 201

curl -s -X PUT http://localhost:3000/tarefas/1 \
  -H "Content-Type: application/json" -d '{"feito":1}'
# {"id":1,"titulo":"Comprar pão","feito":1,"criadoEm":"..."}                          → 200

curl -s -X DELETE -o /dev/null -w '%{http_code}\n' http://localhost:3000/tarefas/2
# 204

curl -s http://localhost:3000/tarefas
# [{"id":1,"titulo":"Comprar pão","feito":1,"criadoEm":"..."}]                        → 200
```

Resultado da bateria completa que rodou no teste:

| Requisição | Status |
| :--- | :--- |
| `POST /tarefas` com título | `201` |
| `POST /tarefas` com título só de espaços | `400` "O título não pode ser vazio" |
| `POST /tarefas` sem título | `400` "O título não foi enviado" |
| `GET /tarefas/1` | `200` |
| `GET /tarefas/999` | `404` |
| `GET /tarefas/abc` | `404` |
| `PUT /tarefas/1` com `{"feito":1}` | `200` |
| `PUT /tarefas/999` e `PUT /tarefas/abc` | `404` |
| `DELETE /tarefas/2` | `204` |
| `DELETE /tarefas/2` de novo, e `DELETE /tarefas/abc` | `404` |

**A prova de que o dado está no banco:** pare o servidor (`Ctrl+C`), suba de novo com
`npm run dev` e liste: a tarefa continua lá. Para ver direto no Postgres:

```bash
sudo -u postgres psql -d todolist -c 'SELECT * FROM tarefas;'
```

```
 id |   titulo    | feito |        criadoEm
----+-------------+-------+-------------------------
  1 | Comprar pão |     1 | 2026-10-22 22:41:08.023
```

---

## 🧯 Problemas comuns

| Sintoma | Causa | Solução |
| :--- | :--- | :--- |
| `Error: DATABASE_URL não definida no .env` | Falta a linha no `.env`, ou o `import "dotenv/config"` não é a primeira linha do `server.ts` | Etapas 5 e 14 |
| `Cannot find module '.../src/generated/prisma/client.js'` | Faltou o `npx prisma generate`, comum logo depois de clonar | `npx prisma generate` |
| `P1000: Authentication failed against database server` no `migrate dev`, ou `500` com "Authentication failed against the database server" na API | Senha errada na `DATABASE_URL` | Confira a senha do usuário `postgres` (Etapa 1) |
| `PUT` com `{"feito":"sim"}` responde `500` | O Prisma recusa texto num campo `Int` | Veja o desafio abaixo |

---

## 🎯 Exercício final — Criar um endpoint novo, de ponta a ponta

Agora é com você. Crie a rota abaixo passando por **todas as camadas**, como as outras
cinco foram feitas: route → controller → service → repository → Prisma.

### O que a rota faz

```
DELETE /tarefas/concluidas
```

Apaga **todas** as tarefas com `feito = 1` e responde quantas foram removidas.

| Situação | Resposta esperada |
| :--- | :--- |
| Havia 2 tarefas concluídas | `200 OK` + `{"removidas":2}` |
| Não havia nenhuma concluída | `200 OK` + `{"removidas":0}` |

Foque no **caminho feliz**: a rota funcionando para quem a usa do jeito certo.

### Como conferir

```bash
# cria três tarefas
curl -s -X POST http://localhost:3000/tarefas -H "Content-Type: application/json" -d '{"titulo":"A"}'
curl -s -X POST http://localhost:3000/tarefas -H "Content-Type: application/json" -d '{"titulo":"B"}'
curl -s -X POST http://localhost:3000/tarefas -H "Content-Type: application/json" -d '{"titulo":"C"}'

# marca a primeira e a terceira como feitas (use os ids que voltaram acima)
curl -s -X PUT http://localhost:3000/tarefas/1 -H "Content-Type: application/json" -d '{"feito":1}'
curl -s -X PUT http://localhost:3000/tarefas/3 -H "Content-Type: application/json" -d '{"feito":1}'

curl -s -X DELETE http://localhost:3000/tarefas/concluidas
# {"removidas":2}

curl -s -X DELETE http://localhost:3000/tarefas/concluidas
# {"removidas":0}

curl -s http://localhost:3000/tarefas
# só a tarefa "B" sobrou
```

### Checklist da entrega

- [ ] **Repository:** uma função nova que fala com o Prisma. Procure na documentação do
      Prisma um método parecido com o `delete`, mas que apague **vários** registros de
      uma vez. Olhe o que ele devolve: tem um campo com a contagem.
- [ ] **Service:** uma função que chama o repository e devolve o número.
- [ ] **Controller:** uma função `async` que chama o service e responde o JSON.
- [ ] **Route:** a linha nova no `tarefas.routes.ts`.
- [ ] `npx tsc --noEmit` sem erros, e **nada de `any`**.
- [ ] Um commit com mensagem clara, por exemplo `feat: rota para apagar tarefas concluidas`.

### 💡 Dica, se a rota responder `404`

Se o seu `DELETE /tarefas/concluidas` responder `404` mesmo com tudo escrito certo,
olhe **a ordem das linhas** no `tarefas.routes.ts`. O Express testa as rotas de cima
para baixo e para na primeira que combina. Para o Express, `/:id` combina com
**qualquer** texto, inclusive `concluidas`... e aí, para qual controller a requisição foi?

### Extra (opcional)

- Hoje `PUT` com `{"feito":"sim"}` derruba a requisição com `500`, e `{"titulo":""}`
  grava uma tarefa sem título. Em qual camada essa validação deve ficar, e qual status
  HTTP o cliente deveria receber?

---

## 📁 Resumo: o que mudou em cada arquivo

| Arquivo | Mudança |
| :--- | :--- |
| `package.json` | Sai `better-sqlite3`; entram `prisma`, `@prisma/client`, `@prisma/adapter-pg` |
| `schema.sql` | Removido; a tabela agora vive em `prisma/schema.prisma` + `prisma/migrations/` |
| `prisma7.config.ts` | Novo: configuração do Prisma |
| `src/banco.ts` | Cria o Prisma Client em vez de abrir o arquivo SQLite |
| `src/types/tarefa.ts` | `criadoEm` passa de `string` para `Date` |
| `src/repositories/` | SQL vira chamadas do Prisma; tudo `async` |
| `src/services/` | Só ganha `async`/`await` |
| `src/controllers/` | `async`/`await` + validação do `id` |
| `src/server.ts` | `import "dotenv/config"` na primeira linha |
| `src/routes/`, `src/app.ts` | **Nada.** As rotas não perceberam a troca de banco. |
