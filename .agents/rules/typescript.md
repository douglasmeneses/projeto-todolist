# Boas Práticas de TypeScript no Repositório

Sempre escreva o código neste repositório seguindo boas práticas estritas de TypeScript:

1. **Tipagem Explícita de Variáveis**:
   - Sempre tipar variáveis locais (`const idTarefa: number = ...`, `const criadoEm: string = ...`).
   - Evitar variáveis sem tipo quando o tipo adiciona clareza ou documentação.

2. **Tipagem de Handlers e Funções**:
   - Tipar parâmetros de requisição e resposta do Express (`req: Request`, `res: Response`).
   - Definir os tipos genéricos de rota e body (`Request<{ id: string }>`, `Request<{}, {}, CriarTarefaDTO>`).
   - Declarar explicitamente os tipos de retorno das funções e callbacks (ex: `: void`).

3. **DTOs e Interfaces**:
   - Criar interfaces para payloads de entrada (`CriarTarefaDTO`, `AtualizarTarefaDTO`) e entidades de domínio (`Tarefa`).
