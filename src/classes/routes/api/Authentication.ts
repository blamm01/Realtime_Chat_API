import { Request, Response } from "express";
import crypto from "crypto";
import mongo from "mongoose";
import bcrypt from "bcrypt";

import userSchema from "../../../models/users";
import utils from "../../../utils";

const saltRounds = 10;

export default class Authentication {
  // [POST] /api/login
  async login(req: Request, res: Response) {
    let token = req.cookies["token"];
    if (token) {
      var data = await userSchema.findOne({ token: token });
      if (data) {
        if (data.updatedAt + data.expires_in >= Date.now()) {
          return res.status(201).send({
            token: token,
          })
        }

        token = utils.randomToken(36);
        data.token = token;

        await data.save();

        res.cookie("token", token);
        return res.status(201).send({
            token: token,
        });
      }
    }

    const username = req.body["username"];
    const password = req.body["password"];

    if (!username || !password)
      return res.status(400).send({
        error: utils.getResponse("INVALID_FORM"),
      });

    var data = await userSchema.findOne({ username: username });
    if (!data)
      return res.status(401).send({
        error: utils.getResponse("INVALID_CREDENTIAL"),
      });

    const hashPassword = typeof data.password == "string" ? data.password : "";

    const authorized = bcrypt.compareSync(password, hashPassword);
    if (!authorized)
      return res.status(400).send({
        error: utils.getResponse("INVALID_CREDENTIAL"),
      });

    const userToken = data.token

    res.cookie("token", userToken);

    return res.status(201).send({
      token: userToken
    });
  }

  // [POST] /api/register
  async register(req: Request, res: Response) {
    const username = req.body["username"];
    const password = req.body["password"];
    const email = req.body["email"];

    if (!username || !password || !email)
      return res.status(400).send({
        error: utils.getResponse("INVALID_FORM"),
      });

    let data = await userSchema.findOne({ username: username });
    if (data)
      return res.status(401).send({
        error: utils.getResponse("USED_USERNAME"),
      });

    const token = utils.randomToken(36);

    const hashedPassword: string = hashPassword(password).hash;

    data = new userSchema({
      username: username,
      password: hashedPassword,
      email: email,
      token: token
    });

    await data.save();

    res.cookie("token", data.token)

    return res.status(201).send({
      data: {
        username: data.username,
        password: data.password,
        email: data.email,
      },
      token: token
    })
  }

  // [GET] /api/logout
  async logout(req: Request, res: Response) {
    res.clearCookie("token");
    res.redirect("/");
  }
}

function hashPassword(password: string) {
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);

  return {
    password: password,
    hash: hash,
  };
}
