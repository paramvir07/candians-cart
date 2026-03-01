import mongoose from "mongoose";

const URI= process.env.MONGODB_URI;

if(!URI) throw new Error('MONGODB_URI missing');

export const dbConnect = async() =>{
    if(mongoose.connection.readyState >= 1) return;
    try {
        await mongoose.connect(URI);
    } catch (error) {
        console.error(error);
        throw error;
    }
}
