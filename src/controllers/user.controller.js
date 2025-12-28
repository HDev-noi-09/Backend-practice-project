import { Apierror } from "../utils/Apierror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudfileupload.js";
import { APIResponse } from "../utils/APIResonse.js";
import jwt from 'jsonwebtoken'

const generateAccessAndRefreshTokens= async(userId)=>{
  try {
   const user= await User.findById(userId)
  const accessTokens= user.generateAccessTokens()
  const refreshTokens=user.generateRefreshTokens()

user.refreshTokens=refreshTokens
await user.save({validateBeforeSave:false})

return {accessTokens,refreshTokens}

  } catch (error) {
    console.error("TOKEN ERROR 👉", error);
    throw new Apierror(500, error.message || "Token generation failed");
   
  }
}
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

const loginUser =asyncHandler(async(req,res)=>{
const {email,username,password}=req.body
console.log("BODY:", req.body);

if(!username && !email){
  throw new Apierror(400,"Username or password is required")
}
  const user =await User.findOne({
    $or:[{email},{username}]
  })

if(!user){
  throw new Apierror(404,"User does not exist")
}
const IsPasswordValid = await user.isPasswordCorrect(password)

if(!IsPasswordValid){
  throw new Apierror(401,"password entered is not valid")
}

const {accessTokens,refreshTokens}=await generateAccessAndRefreshTokens(user._id )

const loggedInUser=await User.findById(user._id).select("-password -refreshTokens")
const options={
  httpOnly:true,
  secure:true
}

return res.status(200).
cookie("accessTokens",accessTokens,options).
cookie("refreshTokens",refreshTokens,options).
json(
  new APIResponse(200,{user:loggedInUser,accessTokens,refreshTokens})
)

})

const logoutUser=asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshTokens:undefined
      }
    },{
    new:true,
    }
  )


  const options={
  httpOnly:true,
  secure:true
}

return res.status(200).clearCookie("accessTokens",options).
clearCookie("refreshTokens").json(new APIResponse(200,{},"User logged Out successfully"))
})

try {
  const refreshAccessToken=asyncHandler(async(req,res)=>{
  const incomingAccessToken= await req.cookies.refreshTokens || req.body.refreshTokens
  
    if(!incomingAccessToken){
      throw new Apierror(401,"Unauthorized request")
    }
  
    const decodedToken =await jwt.verify(
      incomingAccessToken,process.env.REFRESH_TOKEN_SECRET 
    )
  
   const user =await User.findById(decodedToken?._id)
  })
  
    if(!user){
      throw new Apierror(401,"Invalid refresh token sent ")
    }
  
    if(incomingAccessToken!==user?.refreshTokens){
       throw new Apierror(401,"Tokens mismatch(expired or used)!!")
    }
  
    const {accessTokens,newRefreshTokens}= await  generateAccessAndRefreshTokens(user._id)
  
      return res.status(200).cookie("accessToken",accessTokens,options).cookie("refreshToken",newRefreshTokens,options).json(
        new APIResponse(200,{
          accessTokens,refreshTokens:newRefreshTokens
        }
      ,"Access Token generated successfully")
      )
} catch (error) {
  throw new Apierror(401,error?.message ||"Invalid refresh token")
}

const changeCurrentUserPassword=asyncHandler( async(req,res)=>{
  const {oldPassword , newPassword}=req.body
  const user= await User.findById(req.user?._id)
 const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)

if(!isPasswordCorrect){
  throw new Apierror(400,"Invalid old password.Try again")
}

user.password=newPassword;
 await user.save({validateBeforeSave:false})
return res
.status(200)
.json(new APIResponse(200),{},"New Password set successfully")
})

const getCurrentUser=asyncHandler(async(req,res)=>{
  return res
  .status(200)
  .json(new APIResponse(200,req.user,"Current user fetched successfully"))
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
  const {fullName,email}=req.body
  if(!fullName ||!email){
    throw new Apierror(400,"All fields are required")
  }

 const user =await User.findByIdAndUpdate(req.user?._id,
  {
    $set:{
      fullName,
      email:email
    }
  },
  {new :true}
 ).select("-password")
 return res.status(200).json(new APIResponse(200,user,"Account details updated successfully"))
})

const updateUserAvatar=asyncHandler(async(req,res)=>{
  const avatarLocalPath=req.file?.path
  if(!avatarLocalPath){
    throw new Apierror(400,"Problem occurred.Avatar file missing")
  }

  const avatar=uploadOnCloudinary(avatarLocalPath)
  if(!avatar.url){
    throw new Apierror(400,"Error while uploading avatar file!")
  }

  const user=await User.findByIdAndUpdate(req.user?._id,
    {
      $set:{
        avatar:avatar.url
      }
    },
    {new:true}
  ).select("-password -refreshToken")
  return res.status(200).json(
    new APIResponse(200,user,"Avatar updated successfully")
  )
})

const updateUserCoverImage=asyncHandler(async(req,res)=>{
  const coverImageLocalPath=req.file?.path
  if(!coverImageLocalPath){
    throw new Apierror(400,"Problem occurred.Cover image file missing")
  }

  const avatar=uploadOnCloudinary(coverImageLocalPath)
  if(!coverImage.url){
    throw new Apierror(400,"Error while uploading cover image file!")
  }

  const user=await User.findByIdAndUpdate(req.user?._id,
    {
      $set:{
        coverImage:coverImage.url
      }
    },
    {new:true}
  ).select("-password -refreshToken")

   return res.status(200).json(
    new APIResponse(200,user,"Cover Image updated successfully")
  )
})



export {registerUser
  ,loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentUserPassword,
  getCurrentUser,
 updateAccountDetails,
 updateUserAvatar,
 updateUserCoverImage
}