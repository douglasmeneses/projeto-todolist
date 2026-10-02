import type { AtualizarTarefaDTO, Tarefa } from "../types/tarefa.js";
import { db } from "../banco.js";
import * as repository from "../repositories/tarefas.repository.js";

export function listarTarefas(): Tarefa[] {
  return repository.listarTarefas();
}
