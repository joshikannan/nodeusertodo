import express from "express";
import {
  getUsers,
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  deleteAllUsers,
  forgetPassword,
  resetCode,
  resetPassword,
} from "../controllers/userController.js";

const router = express.Router();
// users routes => base route => /users
router.get("/", getUsers);
router.post("/create", createUser);
router.post("/login", loginUser);
router.put("/update", updateUser);
router.delete("/delete", deleteUser);
router.delete("/deleteall", deleteAllUsers);
router.post("/forgetpassword", forgetPassword);
router.post("/resetcode", resetCode);
router.post("/resetpassword", resetPassword);

export default router;
