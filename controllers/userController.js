import bcrypt from "bcrypt";
import User from "../models/User.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

// ================================================  ||  getUsers ||  ================================================
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
// ================================================  ||  createUser ||  ================================================

export const createUser = async (req, res) => {
  try {
    // const salt = await bcrypt.genSalt(); // generate a salt with 10 rounds
    //     // const hashedPassword = await bcrypt.hash(req.body.password, salt); // hash the password with the salt
    //     //  console.log("salt", salt);
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
// ================================================  ||  loginUser ||  ================================================

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

// ================================================  ||  updateUser ||  ================================================

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
// ================================================  ||  deleteUser ||  ================================================

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
// ================================================  ||  deleteAllUsers ||  ================================================

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
// ================================================  ||  forgetPassword ||  ================================================

// Nodemailer Transporter // responsible for sending email

// for mail trap
// const transporter = nodemailer.createTransport({
//   host: "sandbox.smtp.mailtrap.io",
//   port: 2525,
//   auth: {
//     user: "72008d7ceaf288",
//     pass: "ca143078fbe2d3",
//   },
// });

// Nodemailer Transporter // responsible for sending email

// Debugging environment variables
console.log("EMAIL:", process.env.EMAIL);
console.log("EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD);
console.log("Port:", process.env.PORT);
const e = process.env.EMAIL;
const p = process.env.EMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ status: 404, message: "User not found" });

    // Generate a 6-digit reset code
    const resetCode = crypto.randomInt(100000, 999999).toString();

    // Store reset code in memory for demonstration (in a real app, use a more secure method)
    user.resetCode = resetCode;
    user.resetCodeExpires = Date.now() + 300000; // 5 min expiration
    await user.save();

    //  Send the reset code to the user's email
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Password Reset Code",
      text: `Your password reset code is: ${resetCode}`,
    };
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      status: 200,
      message: "Reset code sent to email",
      user,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error sending reset code",
      error: err.message,
    });
  }
};
// ================================================  ||  resetCode ||  ================================================

export const resetCode = async (req, res) => {
  try {
    const { email, resetCode } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ status: 404, message: "User not found" });
    if (Date.now() > user.resetCodeExpires)
      return res
        .status(410)
        .json({ message: "ResetCode Expires, Try Once Again" });

    if (user.resetCode !== resetCode) {
      return res
        .status(400)
        .json({ status: 400, message: "Invalid reset code" });
    }

    res.status(200).json({
      status: 200,
      message: "Reset Code Verified Successfully ",
      user,
    });
    return;
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error sending reset code", error: err.message });
  }
};

// ================================================  ||  resetPassword ||  ================================================

export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          password: hashedPassword,
          resetCode: null,
          resetCodeExpires: null,
        },
      },
      { new: true }
    );
    if (!user)
      return res.status(404).json({ status: 404, message: "User not found" });

    res.status(200).json({
      status: 200,
      message: "Password updated successfully ",
      user,
    });
    return;
  } catch (err) {
    res.status(500).json({ message: "Reset Password", error: err.message });
  }
};
