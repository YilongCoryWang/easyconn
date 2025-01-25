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
  addFriend,
  getUser,
  getAllUsers,
  deleteUser,
  updateUser,
  uploadProfileImage,
  resizeProfileImage,
} from "../controllers/userController";

const router = Router();
router.post("/login", login);
router.post("/signup", signup);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.use(auth);
router.get("/", getAllUsers);
router
  .route("/:id")
  .get(getUser)
  .delete(isAdmin, deleteUser)
  .patch(uploadProfileImage, resizeProfileImage, updateUser);
router.post("/add-friend", addFriend);

export default router;
