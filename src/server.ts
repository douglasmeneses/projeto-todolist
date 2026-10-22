import "dotenv/config";
import app from "./app.js";

const PORT: number = Number(process.env.PORT) || 3000;

app.listen(PORT, (): void => {
  console.log(`Server running on port ${PORT}`);
});
