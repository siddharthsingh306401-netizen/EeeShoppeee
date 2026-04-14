import express from "express";
import cors from "cors";
import { errorMiddleware } from "../../../packages/error-handler/error-middleware";
import cookieParser from "cookie-parser";
import path from "path";
import router from "./routes/auth.router";
import swaggerUi from "swagger-ui-express";
const swaggerDocument = require(
  path.join(process.cwd(), "apps/auth-service/src/swagger-output.json"),
);
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000", // Adjust this to your frontend's origin
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  }),
);

app.get("/", (req, res) => {
  res.send({ message: "Hello API" });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/docs-json", (req, res) => {
  res.json(swaggerDocument);
});
// Routes
app.use("/api", router);

app.use(errorMiddleware);

const PORT = process.env.PORT || 6001;
const server = app.listen(PORT, () => {
  console.log(`Auth service is running at http://localhost:${PORT}/api`);
  console.log(`Swagger Docs available at http://localhost:${PORT}/docs`);
});
server.on("error", (err) => {
  console.log("Server error:", err);
});
