import { Router } from "express";
import {
  login,
  signup,
  getAllUsers,
  auth,
} from "../controllers/authController";

const router = Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/", auth, getAllUsers);

export default router;
