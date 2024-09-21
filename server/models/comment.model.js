import mongoose from "mongoose";
const CommentSchema = new mongoose.Schema(
  {
    CommentText: {
      type: String,
      required: true,
    },
    autherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  { timestamps: true }
);
const Comment = mongoose.model("Comment", CommentSchema);
export default Comment;
 