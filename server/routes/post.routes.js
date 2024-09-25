import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  bookmarkPost,
  commentOnPost,
  createNewPost,
  deletePost,
  editComment,
  editPost,
  getAllPosts,
  getCommentSinglrPost,
  getsingleUserPost,
  LikeAndUnLikePost,
} from "../controllers/post.controller.js";
import upload from "../middlewares/multer.js";

const postRouter = express.Router();
postRouter.post(
  "/createNewPost",
  upload.single("image"),
  isAuthenticated,
  createNewPost
);
postRouter.post(
  "/editPost/:id",
  isAuthenticated,
  upload.single("image"),
  editPost
);
postRouter.get("/getAllpost", isAuthenticated, getAllPosts);
postRouter.get("/yourposts", isAuthenticated, getsingleUserPost);
postRouter.get("/like/:id", isAuthenticated, LikeAndUnLikePost);
postRouter.post("/writecomment/:id", isAuthenticated, commentOnPost);
postRouter.put("/edit_comment/:id", isAuthenticated, editComment);
postRouter.get("/showcomment/:id", isAuthenticated, getCommentSinglrPost);
postRouter.delete("/delete_post/:id", isAuthenticated, deletePost);
postRouter.get("/bookmark/:id", isAuthenticated, bookmarkPost);
export default postRouter;
