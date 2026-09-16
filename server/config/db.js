import mongoose from 'mongoose';
import dns from 'dns';

dns.setServers(['1.1.1.1', '8.8.8.8']);

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing');

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected successfully');

  } catch (error) {
    console.log('Database connection error', error?.message);
  }
}
