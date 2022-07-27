import { Request, Response } from "express";
import crypto from "crypto";
import mongo from "mongoose";

import { ws, config } from "../../../app";
import axios from "axios"

import roomSchema from "../../../models/rooms";
import utils from "../../../utils";

const domain = config["DOMAIN"]

export default class Room {
    // [POST] /rooms/create
    async postNewRoom(
        req: Request,
        res: Response
    ) {
        const userInfo = utils.getUser(req, res);
        if(!userInfo) return;
    
        const name = req.body["name"];
        let description = req.body["description"];
    
        if(!name) return res.status(400).send({
            error: utils.getResponse("INVALID_FORM")
        })
    
        if(!description) description = name;
    
        axios.post(`${domain}/api/rooms`, {
            name: name,
            description: description
        }, {
            headers: {
                "cookie": utils.serializeCookies([
                    {
                        name: "refreshToken",
                        value: req.cookies["refreshToken"]
                    },
                    {
                        name: "accessToken",
                        value: req.cookies["accessToken"]
                    }
                ])
            }
        }).catch((err) => {
            console.log(err.response.data)
            if (err) return res.send(`
            <script>
                alert("Lỗi xảy ra: ${err?.response?.data?.error || err}. Vui lòng nhấn OK để chuyển hướng trang.");
                window.location.href = "/"
            </script>
        `)
            else res.redirect("/")
            return err;
        })
        .then((response) => {
            const data = response.data
            if (data?.error) return res.send(`
            <script>
                alert("Lỗi xảy ra: ${data.error}. Vui lòng nhấn OK để chuyển hướng trang.");
                window.location.href = "/"
            </script>
        `);
            res.redirect("/rooms")
        })
    }

    // [GET] /rooms
    async roomsPage(
        req: Request,
        res: Response
    ) {
        const userInfo = await utils.getUser(req, res);
        if (!userInfo) return;
    
        let rooms = await roomSchema.find();
        rooms = rooms.filter((r) => r.users.find(u => u.name == userInfo.username));
    
        res.render("rooms", {
            data: rooms,
            page: {
                title: "Chọn phòng"
            },
            query: req.query,
            req: req,
            res: res,
            userInfo: userInfo,
        })
    }

    // [GET] /rooms/create
    async createRoomPage(
        req: Request,
        res: Response
    ) {
        const userInfo = await utils.getUser(req, res, false);
        if (!userInfo) return res.redirect("/login");
        res.render("roomCreate.ejs", {
            page: {
                title: "Tạo phòng"
            }
        })
    }

    // [GET] /rooms/:id
    async specificRoomPage(
        req: Request,
        res: Response
    ) {
        const id = req.params.id;
        const userInfo = await utils.getUser(req, res);
        if (!userInfo) return;
    
        if (!id) return res.redirect("/rooms")
    
        let room = await roomSchema.findById(id);
        if (!room) return res.redirect("/");
    
        if (!room.users.find((u) => u.name == userInfo.username)) return res.redirect("/");
    
        res.render("room", {
            data: room,
            userInfo: {
                ...userInfo,
                token: req.cookies["token"]
            },
            page: {
                title: room?.info?.name,
            }
        })
    }
}