import { Request, Response } from "express";
import crypto from "crypto";
import mongo from "mongoose";

import { ws } from "../../../app";

import userSchema from "../../../models/users";
import utils from "../../../utils";

export default class User {
    // [GET] /
    async main(
        req: Request,
        res: Response
    ) {
        const userInfo = await utils.getUser(req, res);
        if (!userInfo) return;
        const args = {
            page: {
                title: "Trang chủ"
            },
            query: req.query,
            req: req,
            res: res,
            userInfo: userInfo
        }
    
        res.render("index", args)
    }
}