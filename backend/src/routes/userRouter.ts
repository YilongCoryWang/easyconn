import { Router } from "express";
import { login, signup, auth } from "../controllers/authController";
import { getUser, getAllUsers } from "../controllers/userController";

const router = Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/", auth, getAllUsers);
router.get("/:id", auth, getUser);

export default router;
