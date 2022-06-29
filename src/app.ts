import express, { Application, Request, Response} from "express";
import * as dotenv from "dotenv";
import router from "./router";

dotenv.config();

const app: Application = express();

const PORT = process.env.SERVER_PORT || 5000;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello");
});

app.use(express.json());
app.use(router);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
