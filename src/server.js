import mongoose from 'mongoose';
import {DB_NAME} from './constants.js';
import dotenv from 'dotenv';
import { app } from './app.js';
import express from 'express'
import connectDB from './db/server.connect.js';
import { asyncHandler } from './utils/asyncHandler.js';

dotenv.config({
    quiet:true,
    path:'./.env'
});


// ( async()=>{
//     try {
//        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)

//        app.on("error",(error)=>{
//         console.log("ERROR",error);
//             throw error
//        })

//        app.listen(process.env.PORT , () =>{
//         console.log(`App is listening on port ${process.env.PORT}`);
//        })
//     } catch (error) {
//         console.error("Error:",error);
//         throw err
//     }
// })()
connectDB().then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running on port :${process.env.PORT}`);
    })
}).catch((error)=>{
    console.error("Problem in connection with server",error);
    process.exit(1);
})

