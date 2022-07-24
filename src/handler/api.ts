import express from "express";
import crypto from "crypto";
import mongo from "mongoose";

import { ws } from "../app";

import userSchema from "../models/users";
import roomSchema from "../models/rooms"
import utils from "../utils";

import Authentication from "../classes/routes/api/Authentication";
import Room from "../classes/routes/api/Room";
import Message from "../classes/routes/api/Message";

const Router = express.Router();

// Authentication
const auth = new Authentication();

Router.post("/login", auth.login)

Router.post("/register", auth.register)

Router.get("/logout/", auth.logout)

// Room
const room = new Room();

Router.get("/rooms/", room.listRooms)

Router.get("/rooms/:id", room.getSpecificRoom)

Router.post("/rooms/", room.createRoom)

// Message
const message = new Message();

Router.post("/messages/:roomId", message.sendMessage)

Router.delete("/messages/:roomId/:messageId", message.deleteMessage)

module.exports = Router