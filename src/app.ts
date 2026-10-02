import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { db } from "./banco.js";
import type { Tarefa, AtualizarTarefaDTO } from "./types/tarefa.js";

import routerTarefas from "./routes/tarefas.routes.js";

const app: Application = express();
app.use(express.json());
app.use(routerTarefas);

function encontraTarefa(id: number): Tarefa | undefined {
  const tarefaProcurada: Tarefa | undefined = db
    .prepare("SELECT * FROM tarefas WHERE id = ?")
    .get(id) as Tarefa | undefined;
  return tarefaProcurada;
}

// DUPLA 1
app.get("/tarefas/:id", (req: Request, res: Response): void => {
  const idTarefa: number = Number(req.params.id);

  const tarefaProcurada: Tarefa | undefined = encontraTarefa(idTarefa);

  if (!tarefaProcurada) {
    // falsy values: undefined, null, 0, "", false, NaN
    res.status(404).send();
    return;
  }

  res.json(tarefaProcurada);
});

app.post("/tarefas", (req: Request, res: Response): void => {
  const titulo: string | undefined = req.body.titulo;

  if (!titulo) {
    //undefined ou ""
    //corner/edge cases
    res.status(400).json("O título não foi enviado"); //400 -> BAD REQUEST
    return;
  }

  const tituloFormatado: string = titulo.trim();

  if (!tituloFormatado) {
    res.status(400).json("O título não pode ser vazio"); //400 -> BAD REQUEST
    return;
  }

  const criadoEm: string = new Date().toISOString();
  const novaTarefa: Tarefa = db
    .prepare("INSERT INTO tarefas (titulo, criadoEm) VALUES (?, ?) RETURNING *")
    .get(tituloFormatado, criadoEm) as Tarefa;

  res.status(201).json(novaTarefa); //201 -> CREATED
});

// DUPLA 2

app.put("/tarefas/:id", (req: Request, res: Response): void => {
  const idTarefa: number = Number(req.params.id);
  const tarefaProcurada: Tarefa | undefined = encontraTarefa(idTarefa);

  if (!tarefaProcurada) {
    res.status(404).send();
    return;
  }

  const { titulo, feito }: AtualizarTarefaDTO = req.body;

  const tituloFinal: string = titulo ?? tarefaProcurada.titulo;
  const feitoFinal: number = feito ?? tarefaProcurada.feito;

  const tarefaAtualizada: Tarefa = db
    .prepare(
      "UPDATE tarefas SET titulo = ?, feito = ? WHERE id = ? RETURNING *",
    )
    .get(tituloFinal, feitoFinal, idTarefa) as Tarefa;

  res.json(tarefaAtualizada);
});

app.delete("/tarefas/:id", (req: Request, res: Response): void => {
  const idTarefa: number = Number(req.params.id);
  const tarefaDeletada: Tarefa | undefined = encontraTarefa(idTarefa);
  if (!tarefaDeletada) {
    res.status(404).send();
    return;
  }

  db.prepare("DELETE FROM tarefas WHERE id = ?").run(idTarefa);

  res.status(204).send(); //204 -> NO CONTENT
});

export default app;
