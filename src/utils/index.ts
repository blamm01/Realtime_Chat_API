import userSchema from "../models/users";
import cookie from "cookie";
import crypto from "crypto";

import { Request, Response } from "express";

import responses from "../../responses"

export default {
    randomToken: function(length: number) {
        return crypto.randomBytes(length).toString("hex");
    },
    parseCookies: function(string: string) {
        return cookie.parse(string);
    },
    serializeCookies: function(array: Array<{name: string, value: string}>) {
        let newArray = array.map((v) => {
            return cookie.serialize(v["name"], v["value"])
        }).join("; ");
        return newArray;
    },
    getUser: async function (req: Request, res: Response, redirect: boolean = true) {
        let cookies: object | any = (req.headers["cookie"]
        ? this.parseCookies(req.headers["cookie"])
        : { refreshToken: "", accessToken: "" }) || req.cookies

        const refreshToken = cookies?.refreshToken || req.headers?.["refreshToken"];
        if (refreshToken) {
            let accessToken = cookies?.accessToken || req.headers?.["accessToken"];
            var data = await userSchema.findOne({ refreshToken: refreshToken });
            if (data) {
                if (data.accessToken == accessToken) {
                    if (data.updatedAt + data.expires_in >= Date.now()) {
                        return {
                            username: data.username,
                            email: data.email
                        }
                    }
                }

                accessToken = this.randomToken.call(this, 32)
                data.accessToken = accessToken;

                await data.save();

                return {
                    username: data.username,
                    email: data.email
                }
            }
        }

        if (redirect) res.redirect("/login");
        return null;
    },
    getResponse: function (code: string, replaces: Array<{
        match: any,
        replaceWith: string
    }> = []) {
        const response = responses[code];
        if(replaces.length) {
            replaces.map((v) => {
                response.replace(v.match, v.replaceWith)
            })
        }
        return response;
    }
}