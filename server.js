require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app'); 


const PORT = process.env.PORT || 5001;


// Only run this in non-test environments
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log(`✅ Connected to MongoDB`);
  app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error('MongoDB connection error:', err));
}



