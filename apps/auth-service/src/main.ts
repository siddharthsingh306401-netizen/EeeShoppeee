import express from "express";
import cors from "cors";
import { errorMiddleware } from "../../../packages/error-handler/error-middleware";
import cookieParser from "cookie-parser";
import path from "path";
import router from "./routes/auth.router";
import swaggerUi from "swagger-ui-express";
const rawSwaggerDocument = require(
  path.join(process.cwd(), "apps/auth-service/src/swagger-output.json"),
);
const swaggerDocument = {
  ...rawSwaggerDocument,
  basePath: "/api",
  paths: Object.fromEntries(
    Object.entries(rawSwaggerDocument.paths || {}).map(([route, value]) => [
      route.trim(),
      value,
    ]),
  ),
};
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:6001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:6001",
      ];

      // Allow non-browser clients (curl, Postman) with no origin header.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS: Origin not allowed"));
    },
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
