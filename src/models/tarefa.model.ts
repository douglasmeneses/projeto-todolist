import { db } from "../banco.js";
import type { Tarefa } from "../types/tarefa.js";

export function buscarTodasTarefas(): Tarefa[] {
  const tarefas: Tarefa[] = db
    .prepare("SELECT * FROM tarefas")
    .all() as Tarefa[];
  return tarefas;
}

export function buscarTarefaPorId(id: number): Tarefa | undefined {
  const tarefaProcurada: Tarefa | undefined = db
    .prepare("SELECT * FROM tarefas WHERE id = ?")
    .get(id) as Tarefa | undefined;
  return tarefaProcurada;
}

export function criarTarefa(titulo: string): Tarefa {
  const criadoEm: string = new Date().toISOString();
  const novaTarefa: Tarefa = db
    .prepare("INSERT INTO tarefas (titulo, criadoEm) VALUES (?, ?) RETURNING *")
    .get(titulo, criadoEm) as Tarefa;
  return novaTarefa;
}

export function atualizarTarefa(
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

export function deletarTarefa(id: number): void {
  db.prepare("DELETE FROM tarefas WHERE id = ?").run(id);
}
