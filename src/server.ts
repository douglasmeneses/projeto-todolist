import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const PORT: number = Number(process.env.PORT) || 3000;

app.listen(PORT, (): void => {
  console.log(`Server running on port ${PORT}`);
});
