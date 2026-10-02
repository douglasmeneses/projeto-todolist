import type { Request, Response } from "express";
import type { Tarefa, AtualizarTarefaDTO } from "../types/tarefa.js";
import * as service from "../services/tarefas.service.js";

export function listarTarefas(req: Request, res: Response): void {
  const tarefas = service.listarTarefas();
  res.json(tarefas); //status code 200 [OK]
}
