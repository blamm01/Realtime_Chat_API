import mongo from "mongoose";
import { config } from "../app"

mongo.connect(config.MONGO)
    .then(() => {
        console.log("Connected to MongoDB!")
    })