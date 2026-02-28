require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app'); 

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('Connected to MongoDB');
    console.log('Database name in use:', mongoose.connection.name);

    app.listen(PORT, () => {
      console.log(`Server running on localhost: ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Stop app if DB fails
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}