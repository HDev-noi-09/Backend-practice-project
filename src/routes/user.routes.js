import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";


const router = Router();

router.post(
  "/register",

  // 1️⃣ prove request reaches router
  (req, res, next) => {
    console.log("🔥 Route hit");
    next();
  },

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

export default router;
