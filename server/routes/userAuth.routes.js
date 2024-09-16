import express from "express";
import { Login, Register } from "../controllers/userAuth.controllers.js";

const UserAuthRouter = express.Router();

UserAuthRouter.post("/register", Register);
UserAuthRouter.post("/login", Login);

export default UserAuthRouter;
