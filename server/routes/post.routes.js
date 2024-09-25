import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  commentOnPost,
  createNewPost,
  deletePost,
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
postRouter.get("/getAllpost", isAuthenticated, getAllPosts);
postRouter.get("/yourposts", isAuthenticated, getsingleUserPost);
postRouter.get("/like/:id", isAuthenticated, LikeAndUnLikePost);
postRouter.post("/writecomment/:id", isAuthenticated, commentOnPost);
postRouter.get("/showcomment/:id", isAuthenticated, getCommentSinglrPost);
postRouter.delete("/delete_post/:id", isAuthenticated, deletePost);
export default postRouter;
