import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}`, {});

    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error(`Error while connecting to DB`);
    process.exit(1);
  }
};

export default connectDB;
