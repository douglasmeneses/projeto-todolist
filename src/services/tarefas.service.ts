import * as tarefaRepository from "../repositories/tarefa.repository.js";
import type { Tarefa, AtualizarTarefaDTO } from "../types/tarefa.js";

export function listarTarefas(): Tarefa[] {
  const tarefas: Tarefa[] = tarefaRepository.buscarTodas();
  return tarefas;
}

export function buscarTarefaPorId(id: number): Tarefa | undefined {
  const tarefaProcurada: Tarefa | undefined = tarefaRepository.buscarPorId(id);
  return tarefaProcurada;
}

export function criarTarefa(titulo: string): Tarefa {
  const criadoEm: string = new Date().toISOString();
  const novaTarefa: Tarefa = tarefaRepository.criar(titulo, criadoEm);
  return novaTarefa;
}

export function atualizarTarefa(
  id: number,
  dados: AtualizarTarefaDTO,
): Tarefa | undefined {
  const tarefaExistente: Tarefa | undefined = tarefaRepository.buscarPorId(id);

  if (!tarefaExistente) {
    return undefined;
  }

  const tituloFinal: string = dados.titulo ?? tarefaExistente.titulo;
  const feitoFinal: number = dados.feito ?? tarefaExistente.feito;

  const tarefaAtualizada: Tarefa = tarefaRepository.atualizar(
    id,
    tituloFinal,
    feitoFinal,
  );

  return tarefaAtualizada;
}

export function deletarTarefa(id: number): boolean {
  const tarefaExistente: Tarefa | undefined = tarefaRepository.buscarPorId(id);

  if (!tarefaExistente) {
    return false;
  }

  tarefaRepository.deletar(id);
  return true;
}
