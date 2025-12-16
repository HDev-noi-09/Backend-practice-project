import mongoose , {Schema} from "mongoose"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
const UserSchema= new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        index:true,
        lowercase:true,
        trim:true,
    },  
  email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    avatar:{    
    type:String,
    required:true,
       
    },
    coveredImage:{
        type:String
    },
    watchHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true,'Password is required']
    },
    refreshTokens:{

    },
},
{timestamps:true}
)


UserSchema.pre("save",function (next) {
    if(!this.isModified("password")) return next();

    this.password=bcrypt.hash(this.password,10)
})

UserSchema.methods.isPasswordCorrect =async function(password) {
   return await bcrypt.compare(password,this.password)
}

UserSchema.methods.generateAccessTokens= function(){
   return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
UserSchema.methods.generateRefreshTokens= function(){
     return jwt.sign(
        {
            _id:this._id,
          
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
const User = mongoose.Model("User".UserSchema)

export {User}