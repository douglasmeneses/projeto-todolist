import type { Request, Response } from "express";
import type { Tarefa, CriarTarefaDTO, AtualizarTarefaDTO } from "../types/tarefa.js";
import * as tarefasService from "../services/tarefas.service.js";

export function listarTarefas(req: Request, res: Response): void {
  const tarefas: Tarefa[] = tarefasService.listarTarefas();
  res.json(tarefas); // status code 200 [OK]
}

export function buscarTarefaPorId(
  req: Request<{ id: string }>,
  res: Response,
): void {
  const idTarefa: number = Number(req.params.id);
  const tarefaProcurada: Tarefa | undefined =
    tarefasService.buscarTarefaPorId(idTarefa);

  if (!tarefaProcurada) {
    // falsy values: undefined, null, 0, "", false, NaN
    res.status(404).send();
    return;
  }

  res.json(tarefaProcurada);
}

export function criarTarefa(
  req: Request<{}, {}, CriarTarefaDTO>,
  res: Response,
): void {
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

  const novaTarefa: Tarefa = tarefasService.criarTarefa(tituloFormatado);

  res.status(201).json(novaTarefa); // 201 -> CREATED
}

export function atualizarTarefa(
  req: Request<{ id: string }, {}, AtualizarTarefaDTO>,
  res: Response,
): void {
  const idTarefa: number = Number(req.params.id);
  const { titulo, feito }: AtualizarTarefaDTO = req.body;

  const tarefaAtualizada: Tarefa | undefined = tarefasService.atualizarTarefa(
    idTarefa,
    { titulo, feito },
  );

  if (!tarefaAtualizada) {
    res.status(404).send();
    return;
  }

  res.json(tarefaAtualizada);
}

export function deletarTarefa(
  req: Request<{ id: string }>,
  res: Response,
): void {
  const idTarefa: number = Number(req.params.id);
  const foiDeletado: boolean = tarefasService.deletarTarefa(idTarefa);

  if (!foiDeletado) {
    res.status(404).send();
    return;
  }

  res.status(204).send(); // 204 -> NO CONTENT
}
