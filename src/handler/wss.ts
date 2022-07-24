import { ws } from "../app";
import cookie from "cookie";
import utils from "../utils";

import roomSchema from "../models/rooms";
import userSchema from "../models/users";

ws.on("connection", async (socket) => {
    socket.on("auth", async (data) => {
        const { refreshToken, accessToken } = data;
        const userData = await userSchema.findOne({ refreshToken: refreshToken });
        
        if (!userData) return socket.emit("failed", {
            redirect: "/login",
            error: "Không thể xác minh người dùng."
        })

        let rooms = await roomSchema.find();
        rooms = rooms.filter((r) => r.users.find(u => u.name == userData.username));

        rooms.map((r) => {
            ws.in(r._id).emit("announce", {
                user: "Console",
                content: `${userData.username} đã trực tuyến!`
            })
        })

        rooms.map((r) => {
            socket.join(r._id)
        })

        socket.on("disconnect", (reason) => {
            rooms.map((r) => {
                ws.in(r._id).emit("announce", {
                    user: "Console",
                    content: `${userData.username} đã ngoại tuyến!`
                })
            })
        })
    });
})