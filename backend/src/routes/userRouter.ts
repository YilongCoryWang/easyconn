import { Router } from "express";
import { login, signup, auth, isAdmin } from "../controllers/authController";
import {
  getUser,
  getAllUsers,
  deleteUser,
} from "../controllers/userController";

const router = Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/", auth, getAllUsers);
router.route("/:id").get(auth, getUser).delete(auth, isAdmin, deleteUser);

export default router;
