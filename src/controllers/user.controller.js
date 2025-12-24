import { Apierror } from "../utils/Apierror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudfileupload.js";
import { APIResponse } from "../utils/APIResonse.js";


const generateAccessAndRefreshTokens= async(userId)=>{
  try {
   const user= await User.findById(userId)
  const accessTokens= user.generateAccessTokens()
  const refreshTokens=user.generateRefreshTokens()

user.refreshTokens=refreshTokens
await user.save({validateBeforeSave:false})

return {accessTokens,refreshTokens}

  } catch (error) {
    throw new Apierror(500,"Something went wrong while generating both tokens")
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
if(!username && !email){
  throw new Apierror(400,"Username or password is required")
}
  const user =await User.findOne({
    $or:[{email},{username}]
  })

if(!user){
  throw new Apierror(404,"User does not exist")
}
IsPasswordValid = await user.isPasswordCorrect(password)

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

export {registerUser
  ,loginUser,logoutUser
}