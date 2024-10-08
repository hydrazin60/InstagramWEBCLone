import sharp from "sharp";
import cloudinary from "cloudinary";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Comment from "../models/comment.model.js";
import getDataUri from "../utils/datauri.js";
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

// export const editPost = async (req, res) => {
//   try {
//     const postId = req.params.id;
//     const { caption } = req.body;
//     const image = req.file;
//     const autherId = req.id;
//     const post = await Post.findById(postId);
//     const auther = await User.findById(autherId);
//     if (!post) {
//       return res.status(404).json({
//         success: false,
//         message: "Post not found",
//       });
//     }

//     if (!auther) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }
//     if (post.autherId.toString() !== autherId) {
//       return {
//         success: false,
//         message: "You are not authorized to edit this post",
//       };
//     } else {
//       let cloudResponse;
//       const optimizedImageBuffer = await sharp(image.buffer)
//         .resize({ width: 700, height: 700, fit: "inside" })
//         .toFormat("jpeg", { quality: 90 })
//         .toBuffer();
//       const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString(
//         "base64"
//       )}`;

//       cloudResponse = await cloudinary.uploader.upload(fileUri);

//       if (!cloudResponse) {
//         return res.status(500).json({
//           success: false,
//           message: "Failed to upload image",
//         });
//       }
//       post.image = cloudResponse.secure_url;

//       if (image) {
//         const imageUri = getDataUri(image[0]);
//         cloudResponse = await cloudResponse.uploader.upload(imageUri.content);
//         post.image = cloudResponse.secure_url;
//       }
//       if (caption) {
//         post.caption = caption;
//       }
//     }
//     await post.save();
//     return res.status(200).json({
//       success: true,
//       message: "Post updated successfully",
//       post: post,
//     });
//   } catch (error) {
//     console.log(`editPost error: ${error.message}`);
//     return res.status(500).json({
//       success: false,
//       message: `Failed to edit post! Please try again. Error: ${error.message}`,
//     });
//   }
// };

export const editPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { caption } = req.body;
    const image = req.file;
    const authorId = req.id;
    const post = await Post.findById(postId);
    const author = await User.findById(authorId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    if (!author) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (post.authorId && post.authorId.toString() !== authorId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this post",
      });
    }
    if (image) {
      const optimizedImageBuffer = await sharp(image.buffer)
        .resize({ width: 700, height: 700, fit: "inside" })
        .toFormat("jpeg", { quality: 90 })
        .toBuffer();

      const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString(
        "base64"
      )}`;

      const cloudResponse = await cloudinary.uploader.upload(fileUri);

      if (!cloudResponse) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload image",
        });
      }
      post.image = cloudResponse.secure_url;
    }
    if (caption) {
      post.caption = caption;
    }
    await post.save();
    return res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post: postData,
    });
  } catch (error) {
    console.log(`editPost error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: `Failed to edit post! Please try again. Error: ${error.message}`,
    });
  }
};

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

export const getsingleUserPost = async (req, res) => {
  try {
    const auther = req.id;
    const posts = await Post.find({ autherId: auther })
      .sort({ createdAt: -1, autherId: -1 })
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
      posts,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: `getSingleUserPost failed! ${error.message} `,
    });
  }
};

export const LikeAndUnLikePost = async (req, res) => {
  try {
    const Nisan = req.id;
    const PostId = req.params.id;
    const post = await Post.findById(PostId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    const isLikepost = post.likes.includes(Nisan);
    if (isLikepost) {
      await Post.updateOne({ _id: PostId }, { $pull: { likes: Nisan } });
      return res.status(200).json({
        success: true,
        message: "Post unliked successfully",
      });
    } else {
      await Post.updateOne({ _id: PostId }, { $push: { likes: Nisan } });
      return res.status(200).json({
        success: true,
        message: "Post liked successfully",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: `LikePost failed! ${error.message} `,
    });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const Jiban = req.id;
    const PostId = req.params.id;
    const { CommentText } = req.body;

    const post = await Post.findById(PostId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    if (!CommentText) {
      return res.status(404).json({
        success: false,
        message: "Text is required",
      });
    }
    const newComment = await Comment.create({
      CommentText,
      autherId: Jiban,
      postId: PostId,
    });
    const comment = await Comment.findById(newComment._id).populate({
      path: "autherId",
      select: "username profilePic",
    });
    post.comments.push(comment._id);
    await post.save();

    return res.status(200).json({
      success: true,
      message: "Comment uploaded successfully",
      comment,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: `Comment write failed! ${error.message}`,
    });
  }
};

export const editComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const { CommentText } = req.body;
    const autherId = req.id;
    console.log(commentId, CommentText, autherId);

    const comment = await Comment.findById(commentId);
    const auther = await User.findById(autherId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }
    if (!auther) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (autherId !== comment.autherId.toString()) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    } else {
      comment.CommentText = CommentText;
      await comment.save();
      return res.status(200).json({
        success: true,
        message: "Comment updated successfully",
        comment,
      });
    }
  } catch (error) {
    console.log(`editComment error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: `editComment error: ${error.message}`,
    });
  }
};

// export const deleteComment = async (req, res) => {
//   try {
//     const commentId = req.params.id;
//     const autherId = req.id;
//     const auther = await User.findById(autherId);
//     const comment = await Comment.findById(commentId);
//     if (!comment) {
//       return res.status(404).json({
//         success: false,
//         message: "Comment not found",
//       });
//     }
//     if (!auther) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     if (
//       autherId !== comment.autherId.toString() &&
//       autherId !== Post.autherId.toString()
//     ) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized",
//       });
//     } else {
//       await Comment.findByIdAndDelete(commentId);
//       return res.status(200).json({
//         success: true,
//         message: "Comment deleted successfully",
//       });
//     }
//   } catch (error) {
//     console.log(`deleteComment error: ${error.message}`);
//     return res.status(500).json({
//       success: false,
//       message: `deleteComment error: ${error.message}`,
//     });
//   }
// };

export const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const autherId = req.id;

    const auther = await User.findById(autherId);
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (!auther) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const post = await Post.findById(comment.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (
      autherId !== comment.autherId.toString() &&
      autherId !== post.autherId.toString()
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized to delete this comment",
      });
    }

    await Comment.findByIdAndDelete(commentId);
    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.log(`deleteComment error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: `deleteComment error: ${error.message}`,
    });
  }
};

export const getCommentSinglrPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const comment = await Comment.find({ postId }).populate({
      path: "autherId",
      select: "username profilePic",
    });
    if (!comment) {
      return res.status(201).json({
        success: true,
        message: "No comments found",
        comment: comment,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Comments fetched successfully",
      comment: comment,
    });
  } catch (error) {
    console.log(`getCommentSinglrPost error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: `Failed to get comments! Please try again.  `,
      error: ` getCommentSinglrPost error: ${error.message}`,
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.autherId.toString() !== authorId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    await Post.findByIdAndDelete(postId);
    let user = await User.findById(authorId);

    user.posts = user.posts.filter((id) => {
      return id.toString() !== postId;
    });
    await user.save();
    await Comment.deleteMany({ postId });

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.log(`deletePost error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: `Failed to delete post! Please try again.  `,
      error: ` deletePost error: ${error.message}`,
    });
  }
};

export const bookmarkPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id; // Assuming you are getting the authorId from some middleware or authentication method
    const user = await User.findById(authorId);
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.bookmarks.includes(post._id)) {
      await User.updateOne(
        { _id: authorId },
        { $pull: { bookmarks: post._id } }
      );
      return res.status(200).json({
        success: true,
        message: "Post unbookmarked successfully",
      });
    } else {
      await User.updateOne(
        { _id: authorId },
        { $push: { bookmarks: post._id } }
      );
      return res.status(200).json({
        success: true,
        message: "Post bookmarked successfully",
      });
    }
  } catch (error) {
    console.log(`bookmarkPost error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Failed to bookmark post! Please try again.",
      error: `bookmarkPost error: ${error.message}`,
    });
  }
};
