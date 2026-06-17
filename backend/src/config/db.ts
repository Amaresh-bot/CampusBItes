import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error("❌ MONGODB_URI environment variable is missing!");
      process.exit(1);
    }
    
    const conn = await mongoose.connect(mongoURI);
    console.log(`Connected to MongoDB Atlas: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${(error as Error).message}`);
    process.exit(1);
  }
};
