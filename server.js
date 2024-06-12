import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import helmet from "helmet";

import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json" assert { type: "json" };

const app = express();
app.use(helmet());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// import api routes
import categoryRouter from "./routes/category.routes.js";
import bookRouter from "./routes/book.routes.js";

// user routes
app.use("/api/category", categoryRouter);
app.use("/api/book", bookRouter);

export default app;
