import { db } from "../banco.js";
import type { Tarefa } from "../types/tarefa.js";

export function buscarTodas(): Tarefa[] {
  const tarefas: Tarefa[] = db
    .prepare("SELECT * FROM tarefas")
    .all() as Tarefa[];
  return tarefas;
}

export function buscarPorId(id: number): Tarefa | undefined {
  const tarefa: Tarefa | undefined = db
    .prepare("SELECT * FROM tarefas WHERE id = ?")
    .get(id) as Tarefa | undefined;
  return tarefa;
}

export function criar(titulo: string, criadoEm: string): Tarefa {
  const novaTarefa: Tarefa = db
    .prepare("INSERT INTO tarefas (titulo, criadoEm) VALUES (?, ?) RETURNING *")
    .get(titulo, criadoEm) as Tarefa;
  return novaTarefa;
}

export function atualizar(
  id: number,
  titulo: string,
  feito: number,
): Tarefa {
  const tarefaAtualizada: Tarefa = db
    .prepare(
      "UPDATE tarefas SET titulo = ?, feito = ? WHERE id = ? RETURNING *",
    )
    .get(titulo, feito, id) as Tarefa;
  return tarefaAtualizada;
}

export function deletar(id: number): void {
  db.prepare("DELETE FROM tarefas WHERE id = ?").run(id);
}
