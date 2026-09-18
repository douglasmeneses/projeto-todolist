import express, { type Application } from "express";
import dotenv from "dotenv";
import { db } from "./banco.js";

dotenv.config();

const app: Application = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

interface Tarefa {
  id: number;
  titulo: string;
  feito: boolean;
  criadoEm: string;
}

/*
Req http =>
-Método HTTP (GET, POST, PUT/PATCH, DELETE)
-URL (endpoint)
-Cabeçalhos (headers)?
-Dados? [path variable, req/query params, body(json)]
*/

/*
Res http =>
-Status code [200, 201, 204, 400, 404, 500...]
-Headers?
-Dados? [body(json)]
*/

const tarefas: Tarefa[] = [];

app.get("/tarefas", (req, res) => {
  const tarefas = db.prepare("SELECT * FROM tarefas").all();
  res.json(tarefas); //status code 200 [OK]
});

app.get("/tarefas/:id", (req, res) => {
  const idTarefa: number = Number(req.params.id);
  const tarefaProcurada: Tarefa | undefined = tarefas.find(
    (tarefa) => tarefa.id === idTarefa,
  );
  return tarefaProcurada ? res.json(tarefaProcurada) : res.status(404).send();
});

app.put("/tarefas/:id", (req, res) => {
  const idTarefa: number = Number(req.params.id);
  const tarefaProcurada: Tarefa | undefined = tarefas.find(
    (tarefa) => tarefa.id === idTarefa,
  );
  if (!tarefaProcurada) return res.status(404).send();

  const { titulo, feito } = req.body;

  if (titulo) tarefaProcurada.titulo = titulo;
  if (feito) tarefaProcurada.feito = feito;

  return res.json(tarefaProcurada);
});

app.delete("/tarefas/:id", (req, res) => {
  const idTarefa: number = Number(req.params.id);
  const tarefaProcurada: Tarefa | undefined = tarefas.find(
    (tarefa) => tarefa.id === idTarefa,
  );
  if (!tarefaProcurada) return res.status(404).send();
  const indice: number = tarefas.findIndex((tarefa) => tarefa.id === idTarefa);
  tarefas.splice(indice, 1);
  return res.status(204).send(); //204 -> NO CONTENT
});

let proximoId: number = 2;

app.post("/tarefas", (req, res) => {
  const { titulo } = req.body; //const titulo = req.body.titulo;
  const tarefa: Tarefa = {
    id: proximoId,
    titulo: titulo,
    feito: false,
    criadoEm: new Date().toISOString(),
  };

  proximoId++;
  tarefas.push(tarefa);

  res.status(201).json(tarefa); //201 - CREATED
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
