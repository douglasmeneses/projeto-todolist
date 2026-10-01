import { Router } from "express";
import {
  listarTarefas,
  buscarTarefaPorId,
  criarTarefa,
  atualizarTarefa,
  deletarTarefa,
} from "../controllers/tarefas.controller.js";

const router: Router = Router();

router.get("/", listarTarefas);
router.get("/:id", buscarTarefaPorId);
router.post("/", criarTarefa);
router.put("/:id", atualizarTarefa);
router.delete("/:id", deletarTarefa);

export default router;
