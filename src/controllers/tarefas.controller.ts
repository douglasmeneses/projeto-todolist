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
