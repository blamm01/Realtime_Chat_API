import userSchema from "../models/users";
import cookie from "cookie";
import crypto from "crypto";

import { Request, Response } from "express";

import responses from "../../responses";

export default {
  randomToken: function (length: number) {
    return crypto.randomBytes(length).toString("hex");
  },
  parseCookies: function (string: string) {
    return cookie.parse(string);
  },
  serializeCookies: function (array: Array<{ name: string; value: string }>) {
    let newArray = array
      .map((v) => {
        return cookie.serialize(v["name"], v["value"]);
      })
      .join("; ");
    return newArray;
  },
  getUser: async function (
    req: Request,
    res: Response,
    redirect: boolean = true
  ) {
    let cookies: object | any =
      (req.headers["cookie"]
        ? this.parseCookies(req.headers["cookie"])
        : { token: "" }) || req.cookies;

    let token = cookies?.token || req.headers?.["token"];
    if (token) {
      var data = await userSchema.findOne({ token: token });
      if (data) {
        if (data.updatedAt + data.expires_in >= Date.now()) {
          return {
            username: data.username,
            email: data.email,
          };
        }

        token = this.randomToken.call(this, 36);
        data.token = token;

        await data.save();

        return {
          username: data.username,
          email: data.email,
        };
      }
    }

    if (redirect) res.redirect("/login");
    return null;
  },
  getResponse: function (
    code: string,
    replaces: Array<{
      match: any;
      replaceWith: string;
    }> = []
  ) {
    const response = responses[code];
    if (replaces.length) {
      replaces.map((v) => {
        response.replace(v.match, v.replaceWith);
      });
    }
    return response;
  },
};
