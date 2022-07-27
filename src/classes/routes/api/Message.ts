import { Request, Response } from "express";
import crypto from "crypto";
import mongo from "mongoose";

import { ws, config } from "../../../app"

import roomSchema from "../../../models/rooms";
import utils from "../../../utils";

export default class Message {
    // [GET] /api/messages/:roomId
    async sendMessage(
        req: Request,
        res: Response
    ) {
        const id = req.params.roomId;
        if (!id) return res.status(400).send({
            error: utils.getResponse("INVALID_FORM")
        })
    
        const message = `${req.body["message"]}`;
    
        const userInfo = await utils.getUser(req, res, false);
        if (!userInfo) return res.status(401).send({
            error: utils.getResponse("NOT_LOGGED_IN")
        })
    
        if (!message) return res.status(400).send({
            error: utils.getResponse("INVALID_FORM")
        });
    
        const roomData = await roomSchema.findOne({ _id: id });
        if (!roomData) return res.status(403).send({
            error: utils.getResponse("ROOM_NOT_FOUND")
        })
    
        if (!roomData.users.find((u) => u.name == userInfo.username)) return res.status(403).send({
            error: utils.getResponse("REQUESTED_USER_NOT_FOUND")
        });
    
        const maximumMessages = config.MAX_MESSAGES;
    
        if (roomData.messages?.length >= maximumMessages) return res.status(403).send({
            error: utils.getResponse("LIMITED_MAX_MESSAGES")
                .replace("{max_messages}", `${maximumMessages}`)
        })
    
        const data = {
            message: {
                content: message,
                id: utils.randomToken(8)
            },
            user: {
                name: userInfo.username
            }
        }
    
        if (Array.isArray(roomData.messages)) {
            roomData.messages.push(data)
        } else {
            roomData.messages = [
                data
            ]
        }
    
        await roomData.save();
    
        ws.sockets.in(roomData._id).emit("message", data)
    
        return res.status(201).send({
            data: data
        })
    }

    // [DELETE] /api/messages/:roomId/:messageId
    async deleteMessage(
        req: Request,
        res: Response
    ) {
        const roomId = req.params["roomId"];
        const messageId = req.params["messageId"];
        
        const userInfo = await utils.getUser(req, res, false);
        if (!userInfo) return res.status(401).send({
            error: utils.getResponse("NOT_LOGGED_IN")
        })
    
        if (!roomId || !messageId) return res.status(400).send({
            error: utils.getResponse("INVALID_FORM")
        });
    
        let roomData = await roomSchema.findOne({ _id: roomId });
        if (!roomData) return res.status(403).send({
            error: utils.getResponse("ROOM_NOT_FOUND")
        })
    
        if (!roomData.users.find((u) => u.name == userInfo.username)) return res.status(403).send({
            error: utils.getResponse("REQUESTED_USER_NOT_FOUND")
        });
    
        const message = roomData.messages.find((m) => m.message.id == messageId);
        if (!message) return res.status(403).send({
            error: utils.getResponse("MESSAGE_NOT_FOUND")
        })
    
        if (message.user.name !== userInfo.username) return res.status(403).send({
            error: utils.getResponse("NOT_SENDER")
        })
    
        roomData.messages = roomData.messages.filter(m => m.message.id !== message.message.id);
        await roomData.save();
    
        await ws.sockets.in(roomData._id).emit("announce", {
            user: "Console",
            content: `A message sent by ${userInfo.username} was deleted!`
        })
    
        return res.status(200).send({
            data: null,
        })
    
    }
}