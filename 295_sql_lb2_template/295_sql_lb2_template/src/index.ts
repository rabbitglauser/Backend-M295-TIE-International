import express from "express";
import path from "path";
import { Users, Files } from "./db_connection";
import logger from "./logger";

const app = express();

const port = 3002;
app.use(express.static(path.resolve(__dirname, "../client/build")));
logger.info("Hello From Server");

/* YOUR CODE HERE*/

app.listen(port, () => console.log(`Running on port ${port}`));
