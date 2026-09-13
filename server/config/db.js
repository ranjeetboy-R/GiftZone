import mongoose from 'mongoose';
import dns from 'dns';

dns.setServers(['1.1.1.1', '8.8.8.8'])

export async function connectDB() {
    if (!process.env.MONGODB_URI)
    throw new Error('MONGODB_URI is missing');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
}
