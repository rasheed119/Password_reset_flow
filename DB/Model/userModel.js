import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  SecurityCode: {
    type: String,
    required: false,
  },
  ExpirationTIme: {
    type: Date,
    required: false
  }
});

export const userModel = mongoose.model("user", userSchema);
