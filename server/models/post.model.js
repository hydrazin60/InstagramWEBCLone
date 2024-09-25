 
import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    caption: {
      type: String,
      default: function () {
        return `Created on ${new Date().toLocaleDateString()}`;
      },
    },
    image: {
      type: String,
      required: true,
    },
    autherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", PostSchema);
export default Post;
