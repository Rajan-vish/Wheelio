import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => console.log("Database Connected"));
    const uri = process.env.MONGODB_URI || "";
    await mongoose.connect(uri, {
      dbName: "wheelio",
    });
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
  }
};

export default connectDB;
