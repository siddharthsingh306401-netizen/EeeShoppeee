
import express from 'express';
import * as path from 'path';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import axios from 'axios';
import cookieparser from 'cookie-parser';
  
const app = express();

app.use(cors(
  {origin: 'http://localhost:3000', // Adjust this to your frontend's origin
    allowedHeaders : [ 'Authorization', " Content-Type "],
    credentials : true,
  }
));

app.use(morgan("dev"));
app.use(express.json( {limit: "100mb"} ));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieparser());
app.set('trust proxy', 1); // Trust first proxy for rate limiting

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: ( req: any ) => (req.user ? 1000 : 100), // Limit to 100 requests per window for authenticated users, 50 for others
  message: { error : 'Too many requests from this IP, please try again later.'},
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: true, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req: any) => req.ip,
});
app.use(limiter);
app.get("/gateway-health", (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});

app.use("/", createProxyMiddleware({ target: "http://localhost:6001" }));

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
