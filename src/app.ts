import express from "express";
import { Server } from "socket.io";

import cookieParser from "cookie-parser";
import path from "path";
import methodOverride from "method-override"

import config from "../config";

const port: number = config.PORT || 5000;

const app: express.Express = express();
const ws = new Server(config.SOCKET_PORT || 12201);

app.use(express.static("public"));
app.use(cookieParser())
app.use(express.urlencoded());
app.use(express.json());
app.use(methodOverride("_method"))

app.set("view engine", "ejs");
app.set("views", path.join(__dirname + "/views/"));

app.listen(port, () => {
    console.log(`Listening to port ${port}`)
})

export {
    ws,
    app,
    config
}

app.use("/api", require("./handler/api"));
app.use("/", require("./handler/website"));

require('./handler/mongodb')
require("./handler/wss")