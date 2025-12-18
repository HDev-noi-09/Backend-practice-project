import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { Apierror } from "../utils/Apierror.js";
const router= Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCounts:1
        },
        {
            name:"coverImage",
            maxCounts:1
        }
    ]),
    registerUser)

export default router