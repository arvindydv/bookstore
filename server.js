import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

export default app;
