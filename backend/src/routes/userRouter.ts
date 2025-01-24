import { Router } from "express";
import {
  login,
  signup,
  auth,
  isAdmin,
  forgotPassword,
  resetPassword,
} from "../controllers/authController";
import {
  getUser,
  getAllUsers,
  deleteUser,
  updateUser,
  uploadProfileImage,
} from "../controllers/userController";

const router = Router();
router.post("/login", login);
router.post("/signup", signup);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/", auth, getAllUsers);
router
  .route("/:id")
  .get(auth, getUser)
  .delete(auth, isAdmin, deleteUser)
  .patch(auth, uploadProfileImage, updateUser);

export default router;
