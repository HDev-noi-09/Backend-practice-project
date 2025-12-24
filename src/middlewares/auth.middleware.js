import { Apierror } from "../utils/Apierror";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models";
export const verifyJWT=asyncHandler(async(req,_,next)=>{
  
  
   try {
     const token= req.cookies?.accessTokens ||req.header("Authorization")?.replace("Bearer","")
 
     if(!token){
         throw new Apierror(401,"Unauthorized request")
     }
 
   const decodedToken=  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
 
 
  const user= await User.findById(decodedToken?._id).select("-password -refreshToken")
 
     if(!user){
         throw new Apierror(401,"Invalid access token...")
     }
 
     req.user=user;
     next()
   } catch (error) {
    throw new Apierror(401,error?.message || "Some error occured while accessing the tokens")
    
   }
})
