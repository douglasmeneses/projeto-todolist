import Database from "better-sqlite3";
import fs from "node:fs";

export const db: Database.Database = new Database("todolist.db");

const schemaSql: string = fs.readFileSync("schema.sql", "utf-8");
db.exec(schemaSql);
