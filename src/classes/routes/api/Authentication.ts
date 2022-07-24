import { Request, Response } from "express";
import crypto from "crypto";
import mongo from "mongoose";
import bcrypt from "bcrypt";

import userSchema from "../../../models/users";
import utils from "../../../utils";

const saltRounds = 10;

export default class Authentication {
    // [POST] /api/login
    async login(
        req: Request,
        res: Response
    ) {
        let refreshToken = req.cookies["refreshToken"]
        if (refreshToken) {
            let accessToken = req.cookies;
            var data = await userSchema.findOne({ refreshToken: refreshToken });
            if (data) {
                if (data.accessToken == accessToken) {
                    if (data.updatedAt + data.expires_in >= Date.now()) {
                        return res.status(201).send({
                            accessToken: accessToken
                        })
                    }
                }

                accessToken = utils.randomToken(32);
                data.accessToken = accessToken;

                await data.save();

                res.cookie("accessToken", accessToken)
                return res.status(201).send({
                    accessToken: accessToken
                })
            }
        }

        const username = req.body["username"];
        const password = req.body["password"];

        if (!username || !password) return res.status(400).send({
            error: utils.getResponse("INVALID_FORM")
        })

        var data = await userSchema.findOne({ username: username });
        if (!data) return res.status(401).send({
            error: utils.getResponse("INVALID_CREDENTIAL")
        })

        const hashPassword = typeof data.password == "string" ? data.password : "1"

        const authorized = bcrypt.compareSync(password, hashPassword);
        if(!authorized) return res.status(400).send({
            error: utils.getResponse("INVALID_CREDENTIAL")
        })

        res.cookie("refreshToken", data.refreshToken);
        res.cookie("accessToken", data.accessToken);

        return res.status(201).send({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken
        })
    }

    // [POST] /api/register
    async register(
        req: Request,
        res: Response
    ) {
        const username = req.body["username"];
        const password = req.body["password"];
        const email = req.body["email"];

        if (!username || !password || !email) return res.status(400).send({
            error: utils.getResponse("INVALID_FORM")
        })

        let data = await userSchema.findOne({ username: username });
        if (data) return res.status(401).send({
            error: utils.getResponse("USED_USERNAME")
        })

        const accessToken = utils.randomToken(32);
        const refreshToken = utils.randomToken(36);

        const hashedPassword: string = hashPassword(password).hash;

        data = new userSchema({
            username: username,
            password: hashedPassword,
            email: email,
            accessToken: accessToken,
            refreshToken: refreshToken
        })

        await data.save();

        res.cookie("refreshToken", data.refreshToken);
        res.cookie("accessToken", data.accessToken)

        return res.status(201).send({
            data: {
                username: data.username,
                password: data.password,
                email: data.email
            },
            token: {
                refreshToken: data.refreshToken,
                accessToken: data.accessToken
            }
        })
    }

    // [GET] /api/logout
    async logout(
        req: Request,
        res: Response
    ) {
        res.clearCookie("refreshToken");
        res.clearCookie("accessToken");
        res.redirect("/")
    }
}

function hashPassword(password: string) {
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);

    return {
        password: password,
        hash: hash
    }
}