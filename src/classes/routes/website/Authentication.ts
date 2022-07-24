import { Request, Response } from "express";
import crypto from "crypto";
import mongo from "mongoose";

import { ws, config } from "../../../app";
import axios from "axios";

import userSchema from "../../../models/users";
import utils from "../../../utils";

const domain = config["DOMAIN"];

export default class Authentication {
  // [POST] /login
  async postLogin(req: Request, res: Response) {
    const username = req.body["username"];
    const password = req.body["password"];

    if (!username || !password) return res.redirect("/login");

    axios
      .post(`${domain}/api/login`, {
        username: username,
        password: password,
      })
      .catch((err) => {
        console.log(err.response.data);
        if (err)
          return res.send(`
                <script>
                    alert("Lỗi xảy ra: ${
                      err?.response?.data?.error || err
                    }. Vui lòng nhấn OK để chuyển hướng trang.");
                    window.location.href = "/"
                </script>
            `);
        else res.redirect("/");
        return err;
      })
      .then((response) => {
        const data = response?.data;
        if (data?.error)
          return res.send(`
                <script>
                    alert("Lỗi xảy ra: ${data.error}. Vui lòng nhấn OK để chuyển hướng trang.");
                    window.location.href = "/"
                </script>
            `);
        if (!data?.accessToken || !data?.refreshToken) {
          try {
            res.redirect("/");
          } catch (err) {
            console.log("Unable to redirect user!");
          }
          return;
        }
        res.cookie("accessToken", data.accessToken);
        res.cookie("refreshToken", data.refreshToken);
        res.status(200).redirect("/");
      });
  }

  // [POST] /register
  async postRegister(req: Request, res: Response) {
    const username = req.body["username"];
    const password = req.body["password"];
    const email = req.body["email"];

    if (!username || !password || !email) return res.redirect("/register");

    axios
      .post(`${domain}/api/register`, {
        username: username,
        password: password,
        email: email,
      })
      .catch((err) => {
        console.log(err.response.data);
        if (err)
          return res.send(`
                <script>
                    alert("Lỗi xảy ra: ${
                      err?.response?.data?.error || err
                    }. Vui lòng nhấn OK để chuyển hướng trang.");
                    window.location.href = "/"
                </script>
            `);
        else res.redirect("/");
        return err;
      })
      .then((response) => {
        const data = response?.data;
        if (data?.error)
          return res.send(`
                <script>
                    alert("Lỗi xảy ra: ${data.error}. Vui lòng nhấn OK để chuyển hướng trang.");
                    window.location.href = "/"
                </script>
            `);
        if (!data?.accessToken || !data?.refreshToken) {
          try {
            res.redirect("/");
          } catch (err) {
            
          }
          return;
        }
        res.cookie("accessToken", data.accessToken);
        res.cookie("refreshToken", data.refreshToken);
        res.status(200).redirect("/");
      });
  }

  // [GET] /login
  async loginPage(req: Request, res: Response) {
    const userInfo = await utils.getUser(req, res, false);
    if (userInfo) return res.redirect("/");
    res.render("login.ejs", {
      page: {
        title: "Đăng nhập",
      },
    });
  }

  // [GET] /register
  async registerPage(req: Request, res: Response) {
    const userInfo = await utils.getUser(req, res, false);
    if (userInfo) return res.redirect("/");
    res.render("register.ejs", {
      page: {
        title: "Đăng ký",
      },
    });
  }
};
