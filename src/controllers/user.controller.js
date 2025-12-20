import { Apierror } from "../utils/Apierror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudfileupload.js";
import { APIResponse } from "../utils/APIResonse.js";
const registerUser=asyncHandler( async (req,res) => {
   
    const {fullName,email,username,password}=req.body
    console.log("req.files:", req.files);
    console.log("req.body:", req.body);

    if(
        [fullName,username,email,password].some((field)=>
        field?.trim()==="")
    ){
        throw new Apierror(400,"All fields are compulsory")
    }

  const existedUser= await User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new Apierror(409,"User with this email and username already exists")
    }
    
   const avatarLocalPath= req.files?.avatar[0]?.path;
   const coverImageLocalPath=req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new Apierror(400,"Avatar file is mandatory")
    }
  const avatar= await uploadOnCloudinary(avatarLocalPath)
  const coverImage=await uploadOnCloudinary(coverImageLocalPath)


   if(!avatar){
     throw new Apierror(400,"Avatar file is always mandatory")
   }


 const user =await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase(),

   })
  const createdUser=await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if(!createdUser) {
    throw new Apierror(500,"Registered user's entry doesn't exist!!")
  }
  return res.status(201).json(
    new APIResponse(200,createdUser,"User successfully registered")
  )
})

export {registerUser}