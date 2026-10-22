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
