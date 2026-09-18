# Projeto Todolist — Turma Condado

> Primeiro projeto de backend da turma. Construído ao vivo, em aula, do zero.

## O que a gente constrói

Uma API de tarefas. Você cria uma tarefa, lista as suas tarefas, marca como
feita e apaga. Sem tela, sem login, sem prazo — uma coisa só, bem feita.

O que muda de um encontro para o outro é **só onde os dados moram**. As rotas
são as mesmas, as respostas são as mesmas, quem usa a API não percebe nada. É
essa a lição do projeto: guardar dado é uma decisão separada do resto do
programa.

## Os encontros

| # | Data | Tema | Onde os dados moram |
| --- | --- | --- | --- |
| 1 | 03/09/2026 | [A API que esquece tudo](../encontros/2026-09-03_api_em_memoria/roteiro_ao_vivo.md) | Array em memória |
| 2 | 10/09/2026 | [O banco que lembra](../encontros/2026-09-10_persistencia_sqlite/roteiro_ao_vivo.md) | SQLite, com SQL escrito à mão |
| 3 | a definir | Prisma | O mesmo banco, sem escrever SQL |
| 4 | a definir | Tela em React | A API ganha uma interface |

## A tarefa

Uma tabela só, quatro campos:

| Campo | O que é |
| --- | --- |
| `id` | número que identifica a tarefa |
| `titulo` | o texto da tarefa |
| `feito` | se já foi concluída |
| `criado_em` | quando foi criada |

## O contrato da API

Esse contrato **não muda** entre os encontros 1, 2 e 3.

| Método | Rota | O que faz | Resposta |
| --- | --- | --- | --- |
| `GET` | `/tarefas` | lista todas | `200` + lista |
| `POST` | `/tarefas` | cria uma | `201` + a tarefa criada (`400` se faltar o título) |
| `PATCH` | `/tarefas/:id` | marca feita ou não feita | `200` + a tarefa (`404` se o id não existe) |
| `DELETE` | `/tarefas/:id` | apaga | `204` (`404` se o id não existe) |

## Antes da primeira aula

Confira na sua máquina, com antecedência:

```bash
node --version   # precisa ser 22 ou maior
npm --version
```

Se o Node estiver desatualizado ou faltando, instale antes do encontro — não dá
para gastar aula com isso.

Instale também um cliente HTTP para testar a API. Qualquer um serve:
[Insomnia](https://insomnia.rest/download), Postman, ou a extensão REST Client
do VS Code.

## Como acompanhar

Cada aluno cria o próprio repositório e digita junto. Os roteiros linkados na
tabela acima têm o passo a passo completo do encontro — use-os para revisar
depois ou para se recuperar se perder o fio durante a aula.
