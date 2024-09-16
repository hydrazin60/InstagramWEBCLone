import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

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
