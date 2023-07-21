import { userModel } from "../Model/userModel.js";
import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

dotenv.config();

const router = express.Router();

const sender_mail = process.env.mailid;
const passkey = process.env.password;
const secret_key = process.env.secretKey;
const LINK = process.env.LINK;

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const find_user = await userModel.findOne({ email });
  if (find_user) {
    return res.status(400).json({ message: "User already Exsist" });
  }
  const salt = await bcrypt.genSalt(10);
  const hashpassword = await bcrypt.hash(password, salt);
  const add_user = await userModel({ email, password: hashpassword });
  await add_user.save();
  res.status(200).json({ message: "User added Successfully" });
});

router.put("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const find_user = await userModel.findOne({ email });
    if (!find_user) {
      return res.status(400).json({ message: "User Not Found" });
    }

    const tokenPayload = { userID: find_user._id };

    const token = jwt.sign(tokenPayload, secret_key, { expiresIn: "10m" });

    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 5);
    expiration.setMinutes(expiration.getMinutes() + 40);

    await userModel.findOneAndUpdate(
      { email },
      { $set: { SecurityCode: token, ExpirationTIme: expiration } }
    );

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      auth: {
        user: sender_mail,
        pass: passkey,
      },
    });
    async function main() {
      // send mail with defined transport object
      const link = `${LINK}/resetpassword?token=${token}&email=${email}`;
      const info = await transporter.sendMail({
        from: sender_mail, // sender address
        to: email, // list of receivers
        subject: "Forgot Password", // Subject line
        text: `Click the link below to reset your password. The link is valid for 10 minutes:\n${link}`, // plain text body
      });
    }
    main().catch((error) => {
      console.log(error.message);
      res.status(400).json({ Error: `${error.message}` });
    });
    res.status(200).json({
      message:
        "An mail has been sent to your mail , Please check your mail to reset the password",
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ Error: `${error.message}` });
  }
});

router.put("/reset-password", async (req, res) => {
  try {
    const { token, email, newpassword } = req.body;
    const find_user = await userModel.findOne({ email });
    if (!find_user) {
      return res.status(400).json({ message: "User Not Found" });
    }
    jwt.verify(token, secret_key, async function (err) {
      if (err) {
        return res.status(400).json({ message: `${err.message}` });
      } else {
        try {
          await userModel.findOneAndUpdate(
            { email },
            { $unset: { SecurityCode: 1, ExpirationTIme: 1 } }
          );
          const salt = await bcrypt.genSalt(10);
          const hashpassword = await bcrypt.hash(newpassword, salt);
          const update_password = await userModel.findOneAndUpdate(
            { email },
            { $set: { password: hashpassword } }
          );
          await update_password.save();
          return res
            .status(200)
            .json({ message: "Password Changed Successfully" });
        } catch (error) {
          console.log(error.message);
          res.status(400).json({ message: `${error.message}` });
        }
      }
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ Error: `${error.message}` });
  }
});

router.put("/login", async (req, res) => {
  const { email, password } = req.body;
  const find_user = await userModel.findOne({ email });
  if (!find_user) {
    return res.status(400).json({ message: "User Not Found" });
  }
  const verify_password = await bcrypt.compare(password, find_user.password);
  if (!verify_password) {
    return res.status(400).json({ message: "Invalid Password" });
  }
  res.status(200).json({ message: "User Logged in Successfully" });
});

export { router as userRouter };
