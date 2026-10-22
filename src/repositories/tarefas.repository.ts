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
