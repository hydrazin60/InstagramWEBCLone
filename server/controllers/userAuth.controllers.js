import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const Register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(401).json({
        success: false,
        message: "Please enter all the fields",
      });
    }
    const isRegisteredUser = await User.findOne({ email });
    if (isRegisteredUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email! Please login",
      });
    }
    const isPasswordHas = await bcrypt.hash(password, 4);
    const newUser = new User({
      username,
      email,
      password: isPasswordHas,
    });
    await newUser.save();
    return res.status(200).json({
      success: true,
      message: `Welcome ${newUser.username} in our platform`,
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        profilePic: newUser.profilePic,
      },
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Registeration failed! Please try again",
    });
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: "Please enter all the fields",
      });
    }
    const isUserRegistered = await User.findOne({ email });
    if (!isUserRegistered) {
      return res.status(404).json({
        success: false,
        message: "User doesn't exist with this email! Please register",
      });
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      isUserRegistered.password
    );
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password! Please try again",
      });
    }

    const userData = isUserRegistered.toObject();
    delete userData.password;

    const token = await jwt.sign(
      { userId: isUserRegistered._id },
      process.env.JWT_SECRET,
      { expiresIn: "10d" }
    );

    return res
      .cookie("Token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 10 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: `Welcome back ${isUserRegistered.username} in our platform`,
        user: userData,
      });
  } catch (error) {
    console.log(`Login error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Login failed! Please try again",
    });
  }
};
