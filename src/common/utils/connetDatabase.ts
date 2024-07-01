// Import Dependencies
import { authentication, database } from '@/config';
import mongoose from 'mongoose';
import User from '../models/User';

// Setup Additional Variables
const MONGO_URI = process.env.NODE_ENV === 'production' ? database.productionMongoURI : database.developmentMongoURI;

// Configure MongoDB and Mongoose
const connectDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB >> Connected!');
    const revenue = await User.findById(authentication.revenueId);
    if (!revenue) {
      const newRevenue = new User({ _id: authentication.revenueId });
      await newRevenue.save();
      console.log('MongoDB >> Revenue wallet created!');
    }
  } catch (error: any) {
    console.log(`MongoDB ERROR >> ${error.message}`);

    // Exit current process with failure
    process.exit(1);
  }
};

// Export the util
export default connectDatabase;
