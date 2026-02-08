import mongoose from "mongoose";

const URI= process.env.MONGODB_URI;

if(!URI) throw new Error('MONGODB_URI missing');

export const dbConnect = async() =>{
    if(mongoose.connection.readyState >= 1) return console.log('DB Already Connected');
    try {
        await mongoose.connect(URI);
        console.log('DB Connected');
    } catch (error) {
        console.error(error);
        throw error;
    }
}
