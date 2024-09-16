import express from "express";
import { Register } from "../controllers/userAuth.controllers.js";

const UserAuthRouter = express.Router();

UserAuthRouter.post("/register", Register);

export default UserAuthRouter;
