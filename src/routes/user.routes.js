import { Router } from "express";
import { loginUser, logoutUser, registerUser,refreshAccessToken} from "../controllers/user.controller.js";
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
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
export default router;
