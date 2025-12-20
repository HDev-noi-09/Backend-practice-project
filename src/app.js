import express, { urlencoded } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app=express() 
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit: "18kb"}));
app.use(express.urlencoded({extended:true, limit:"18kb"}));
app.use(express.static("public"))
app.use(cookieParser())

app.use((req, res, next) => {
  console.log("➡️ Incoming request:", req.method, req.url);
  next();
});

import userRouter from './routes/user.routes.js'

app.use("/api/v1/users",userRouter)
console.log("✅ User routes mounted");

export {app}