import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

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

    const UsedData = newUser.toObject();
    delete UsedData.password;

    return res.status(200).json({
      success: true,
      message: `Welcome ${newUser.username} in our platform`,
      user: UsedData,
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
      .cookie("token", token, {
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

export const Logout = async (req, res) => {
  try {
    return res
      .cookie("token", "", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 0,
      })
      .json({
        success: true,
        message: "Logout successful",
      });
  } catch (error) {
    console.log(`Logout error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Logout failed! Please try again.",
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    if (userId.length !== 24) {
      return res.status(404).json({
        success: false,
        message: "userId not valid",
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const userData = user.toObject();
    delete userData.password;

    return res.status(200).json({
      success: true,
      message: `you are viewing ${userData.username}'s profile`,
      user: userData,
    });
  } catch (error) {
    console.log(`Get profile error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Get profile failed! Please try again.",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { username, bio, gender } = req.body;
    //const {profilePic} = req.files?.profilePic?.[0];
    const { profilePic } = req.files;
    let cloudResponse;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (profilePic) {
      const fileUri = getDataUri(profilePic[0]);
      cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      user.profilePic = cloudResponse.secure_url;
    }
    if (username) {
      user.username = username;
    }
    if (bio) {
      user.bio = bio;
    }
    if (gender) {
      user.gender = gender;
    }
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.log(`Update profile error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Update profile failed! Please try again.",
    });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const suggestedUsers = await User.find({ _id: { $ne: req.id } }) // req.id is come from isAuthenticated middleware
      .limit(6)
      .select("-password");
    if (suggestedUsers.length === 0) {
      return res.status(200).json({
        message: "No suggested users found",
        success: true,
        suggestedUsers: [],
      });
    }
    return res.status(200).json({
      success: true,
      message: "Suggested users",
      suggestedUsers,
    });
  } catch (error) {
    console.log(`Get suggested users error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Failed to get suggested users! Please try again.",
    });
  }
};

export const FollowOrUnfollow = async (req, res) => {
  try {
    const Jiban = req.id;
    const Karuna = req.params.id;
    if (Jiban === Karuna) {
      return res.status(401).json({
        success: false,
        message: "You can't follow yourself",
      });
    }
    const JibanUserdata = await User.findById(Jiban);
    const KarunaUserdata = await User.findById(Karuna);
    if (!KarunaUserdata || !JibanUserdata) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const isFollowing = JibanUserdata.following.includes(Karuna);
    if (isFollowing) {
      await Promise.all([
        User.updateOne({ _id: Jiban }, { $pull: { following: Karuna } }),
        User.updateOne({ _id: Karuna }, { $pull: { followers: Jiban } }),
      ]);

      return res.status(200).json({
        success: true,
        message: `You have unfollowed ${KarunaUserdata.username}`,
      });
    } else {
      await Promise.all([
        User.updateOne({ _id: Jiban }, { $push: { following: Karuna } }),
        User.updateOne({ _id: Karuna }, { $push: { followers: Jiban } }),
      ]);

      return res.status(200).json({
        success: true,
        message: `You have followed ${KarunaUserdata.username}`,
      });
    }
  } catch (error) {
    console.log(`Follow or unfollow error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Follow or unfollow failed! Please try again.",
    });
  }
};
