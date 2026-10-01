import express, { type Application } from "express";
import tarefasRoutes from "./routes/tarefas.routes.js";

const app: Application = express();

app.use(express.json());
app.use("/tarefas", tarefasRoutes);

export default app;
