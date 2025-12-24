import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.post(
  "/register",


  // 2️⃣ multer parses multipart/form-data
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
  ]),

  // 3️⃣ debug AFTER multer
  (req, res, next) => {
    console.log("🔥 After multer");
    console.log("FILES:", req.files);
    console.log("BODY:", req.body);
    next();
  },

  // 4️⃣ controller
  registerUser
);
router.route("/login").post(loginUser)
router.roure("/logout").post(verifyJWT,logoutUser)
export default router;
