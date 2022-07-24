import { Request, Response } from "express";
import crypto from "crypto";
import mongo from "mongoose";

import { ws, config } from "../../../app"

import roomSchema from "../../../models/rooms";
import userSchema from "../../../models/users";
import utils from "../../../utils";

export default class Room {
    // [GET] /api/rooms
    async listRooms(
        req: Request,
        res: Response
    ) {
        const userInfo = await utils.getUser(req, res, false);
        if (!userInfo) return res.status(401).send({
            error: utils.getResponse("NOT_LOGGED_IN")
        })
    
        let rooms = await roomSchema.find();
        rooms = rooms.filter((r) => r.users.find(u => u.name == userInfo.username));
    
        res.status(200).json({
            data: rooms
        })
    }

    // [GET] /api/rooms/:id
    async getSpecificRoom(
        req: Request,
        res: Response
    ) {
        const id = req.params.id;
    
        const userInfo = await utils.getUser(req, res, false);
        if (!userInfo) return res.status(401).send({
            error: utils.getResponse("NOT_LOGGED_IN")
        })
    
        if (!id) return res.json(400).send({
            error: utils.getResponse("INVALID_FORM")
        })
    
        let room = await roomSchema.findById(id);
        if (!room?.users.find(u => u.name == userInfo.username)) return res.status(403).send({
            error: utils.getResponse("REQUESTED_USER_NOT_FOUND")
        })
    
        res.status(200).json({
            data: room
        })
    }

    async createRoom(
        req: Request,
        res: Response
    ) {
        let id = utils.randomToken(20)
    
        let room = await roomSchema.findById(id);
    
        while (room) {
            id = utils.randomToken(20)
            room = await roomSchema.findById(id)
        }
    
        let name = req.body["name"];
        let description = req.body["description"];
        const userInfo = await utils.getUser(req, res, false);
    
        if (!userInfo) return res.status(401).send({
            error: utils.getResponse("NOT_LOGGED_IN")
        });
    
        if (!name) return res.status(400).send({
            error: utils.getResponse("INVALID_FORM")
        })
    
        if (!description) description = name
    
        room = new roomSchema({
            _id: id,
            info: {
                id: id,
                name: name,
                description: description
            },
            users: [
                {
                    name: userInfo.username
                }
            ]
        })
    
        await room.save();
    
        return res.status(201).send({
            data: room
        })
    }
}