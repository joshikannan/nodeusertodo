import bcrypt from "bcrypt";
import User from "../models/User.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json({ status: 200, message: "Successful", users });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: err.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
    await user.save();
    res
      .status(201)
      .json({ status: 201, message: "User created successfully", user });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Error creating user",
      error: err.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(400).json({ status: 400, message: "User Not Found" });

    const isValidPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (isValidPassword) {
      res.status(200).json({ status: 200, message: "Login Successful", user });
    } else {
      res.status(401).json({ status: 401, message: "Incorrect Password" });
    }
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { email } = req.query;
    const updateData = req.body;
    const user = await User.findOneAndUpdate(
      { email },
      { $set: updateData },
      { new: true }
    );

    if (!user) res.status(401).json({ status: 401, message: "User Not Found" });

    res.status(200).json({
      status: 200,
      message: "User updated successfully",
      updateduser: user,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Error updating user",
      error: err.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ email: req.body.email });
    if (!user)
      return res.status(404).json({ status: 404, message: "User Not Found" });

    res
      .status(200)
      .json({ status: 200, message: "User deleted successfully", user });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
};

export const deleteAllUsers = async (req, res) => {
  try {
    const result = await User.deleteMany({});
    res.status(200).json({
      status: 200,
      message: "All users deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Error deleting users",
      error: err.message,
    });
  }
};
