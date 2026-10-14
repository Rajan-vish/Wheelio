import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => console.log("Database Connected"));
    let uri = process.env.MONGODB_URI || "";
    uri = uri.replace(/\/wheelio(?=[/?#]|$)/i, "/Wheelio");
    await mongoose.connect(uri, {
      dbName: "Wheelio",
    });
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
  }
};

export default connectDB;
