// db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://devapradana94:Devpran_124@komdigi-klaten.5pqbv.mongodb.net/', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB terhubung');
  } catch (error) {
    console.error('Error menghubungkan ke MongoDB:', error.message);
    process.exit(1); // Keluar dari proses jika gagal terhubung
  }
};

module.exports = connectDB;