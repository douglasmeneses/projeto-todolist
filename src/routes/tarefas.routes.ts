import { Router, type Request, type Response } from "express";
import { db } from "../banco.js";
import type { Tarefa, AtualizarTarefaDTO } from "../types/tarefa.js";
import * as controller from "../controllers/tarefas.controller.js";

const router = Router();

router.get("/tarefas", controller.listarTarefas);

export default router;
