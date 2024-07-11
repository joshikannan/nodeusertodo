import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: { type: String, required: true },
  todos: { type: mongoose.Schema.Types.ObjectId, ref: "Todo" }, // todo id
});

const User = mongoose.model("User", userSchema);
export default User;
