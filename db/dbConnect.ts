import mongoose from "mongoose";

const URI = process.env.MONGODB_URI;

if (!URI) throw new Error("MONGODB_URI missing");

const isDev = process.env.NODE_ENV === "development";

// In dev, cache the connection on the global object to survive HMR reloads
declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: typeof mongoose | undefined;
}

export const dbConnect = async () => {
  if (mongoose.connection.readyState >= 1) return;

  if (isDev) {
    if (global._mongooseConn) return;
    global._mongooseConn = await mongoose.connect(URI);
    return;
  }

  try {
    await mongoose.connect(URI);
  } catch (error) {
    console.error(error);
    throw error;
  }
};