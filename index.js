import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { userRouter } from "./DB/Router/userRouter.js";

const app = express();

dotenv.config();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json({ message: "Hello World!" });
});

app.use("/user", userRouter);

mongoose
  .connect(process.env.mongourl)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.log("Error Connecting to MongoDB", error.message));

app.listen(process.env.PORT || 5000, () =>
  console.log(`Server started in the port localhost:${process.env.PORT || 5000}`)
);
