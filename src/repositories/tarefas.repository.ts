import { db } from "../banco.js";
import type { Tarefa } from "../types/tarefa.js";

export function listarTarefas(): Tarefa[] {
  const tarefas: Tarefa[] = db
    .prepare("SELECT * FROM tarefas")
    .all() as Tarefa[];
  return tarefas;
}
