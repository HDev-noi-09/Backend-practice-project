import mongoose, { Schema, Types } from "mongoose";

const subscriptionSchema=new Schema({
    Subscriber:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    Channel:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
    },
    {timestamps:true})

const Subscription=mongoose.model("Subscription",subscriptionSchema)
export {subscriptionSchema}