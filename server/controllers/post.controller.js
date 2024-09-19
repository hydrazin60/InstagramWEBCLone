import sharp from "sharp";
import cloudinary from "cloudinary";

import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Comment from "../models/comment.model.js";

export const createNewPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const autherId = req.id;
    const image = req.file;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    const optimizedImageBuffer = await sharp(image.buffer)
      .resize({ width: 700, height: 700, fit: "inside" })
      .toFormat("jpeg", { quality: 90 })
      .toBuffer();

    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString(
      "base64"
    )}`;

    const cloudResponse = await cloudinary.uploader.upload(fileUri);

    const newPost = await Post.create({
      caption,
      image: cloudResponse.secure_url,
      autherId,
    });

    const user = await User.findById(autherId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.posts.push(newPost._id);
    await user.save();

    await newPost.populate({ path: "autherId", select: "-password" });

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: newPost,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Failed to create post! Please try again. Error: ${error.message}`,
    });
  }
};

// export const getAllPosts = async (req, res) => {
//   try {
//     const AllPost = await Post.find()
//       .sort({ createdAt: -1 })
//       .populate({ path: "autherId", select: "username profilePic" })
//       .populate({
//         path: "comments",
//         sort: { createdAt: -1 },
//         populate: { path: "autherId", select: "username  profilePic" },
//       });

//     return res.status(200).json({
//       success: true,
//       message: "Posts fetched successfully",
//       posts: AllPost,
//     });
//   } catch (error) {
//     console.log(`getAllPosts error: ${error.message}`);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to get posts! Please try again.",
//     });
//   }
// };

export const getAllPosts = async (req, res) => {
  try {
    const AllPost = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "autherId",
        select: "username profilePic",
      })
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 } },
        populate: { path: "autherId", select: "username profilePic" },
      });

    return res.status(200).json({
      success: true,
      message: "Posts fetched successfully",
      posts: AllPost,
    });
  } catch (error) {
    console.log(`getAllPosts error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Failed to get posts! Please try again.",
    });
  }
};
