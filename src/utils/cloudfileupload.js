import dotenv from 'dotenv';
dotenv.config({ path: './.env' }); 

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.log("❌ No local file path received");
      return null;
    }

    console.log("⬆️ Uploading to Cloudinary:", localFilePath);

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("✅ File uploaded on Cloudinary:", response.secure_url);

    // ✅ delete local file AFTER successful upload
    fs.unlinkSync(localFilePath);

    return response;

  } catch (error) {
    console.error("❌ Cloudinary upload error:", error.message);

    // ✅ delete local file safely
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};

export { uploadOnCloudinary };
