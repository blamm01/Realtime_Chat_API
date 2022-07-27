import { ws } from "../app";
import cookie from "cookie";
import utils from "../utils";

import roomSchema from "../models/rooms";
import userSchema from "../models/users";

ws.on("connection", async (socket) => {
    socket.on("auth", async (data) => {
        const { token } = data;
        const userData = await userSchema.findOne({ token: token });
        
        if (!userData) return socket.emit("failed", {
            redirect: "/login",
            error: "Không thể xác minh người dùng."
        })

        let rooms = await roomSchema.find();
        rooms = rooms.filter((r) => r.users.find(u => u.name == userData.username));

        rooms.map((r) => {
            socket.join(r._id)
        })
    });
})