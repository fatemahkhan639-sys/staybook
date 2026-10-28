// Database connection.
//
// The server prefers a real MongoDB when MONGO_URI is set
// (local mongod or a MongoDB Atlas cluster). When it is empty,
// an in-memory MongoDB is started instead, so the project runs
// on a fresh machine without installing anything first.
const mongoose = require('mongoose');

let memoryServer = null;

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (uri) {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
    return;
  }

  const { MongoMemoryServer } = require('mongodb-memory-server');
  memoryServer = await MongoMemoryServer.create();
  await mongoose.connect(memoryServer.getUri());
  console.log('In-memory MongoDB started (set MONGO_URI to use a real database)');
}

module.exports = connectDB;
