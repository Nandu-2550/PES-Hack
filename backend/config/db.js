const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn("MONGO_URI not set in environment. Skipping database connection.");
      return;
    }
    let uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI environment variable is missing.");
    }
    // Strip accidental surrounding quotes and whitespace/newlines
    uri = uri.replace(/^['"]/, '').replace(/['"]$/, '').trim();
    uri = uri.replace(/\r?\n/g, '');

    if (uri.startsWith('your_mongodb_atlas') || uri.includes('your_mongodb_atlas')) {
      throw new Error("MONGO_URI is still using the placeholder value from .env.example. Replace it with a real MongoDB Atlas URI.");
    }

    // Auto-correct common mistake where 'db' is missing
    if (uri.startsWith('mongo+srv://')) {
      uri = uri.replace('mongo+srv://', 'mongodb+srv://');
    } else if (uri.startsWith('mongo://')) {
      uri = uri.replace('mongo://', 'mongodb://');
    }

    console.log(`[DEBUG] Attempting to connect to MongoDB using URI starting with: "${uri.substring(0, 20)}..."`);

    const conn = await mongoose.connect(uri, {
      dbName: 'AgriHub',
      serverSelectionTimeoutMS: 5000,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Don't crash the process immediately on database connectivity issues on cloud startup.
    // Allow the app to continue so Render can complete the deployment; production
    // monitoring should detect and surface DB connectivity problems.
    // Optionally, implement a retry strategy here.
    return;
  }
};

module.exports = connectDB;
