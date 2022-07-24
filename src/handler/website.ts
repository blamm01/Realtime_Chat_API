import express from "express";
import crypto from "crypto";
import mongo from "mongoose";

import { ws, config } from "../app";
import axios from "axios";

import userSchema from "../models/users";
import roomSchema from "../models/rooms"
import utils from "../utils";

import Authentication from "../classes/routes/website/Authentication";
import Room from "../classes/routes/website/Room";
import User from "../classes/routes/website/User";

const domain = config["DOMAIN"];

const Router = express.Router();

// User
const user = new User();
Router.get("/", user.main)

// Authentication
const auth = new Authentication();
Router.post("/login", auth.postLogin)

Router.post("/register", auth.postRegister)

Router.get("/login", auth.loginPage)

Router.get("/register", auth.registerPage)

// Room
const room = new Room();
Router.post("/rooms/create", room.postNewRoom)

Router.get("/rooms", room.roomsPage)

Router.get("/rooms/create", room.createRoomPage)

Router.get("/rooms/:id", room.specificRoomPage)

module.exports = Router