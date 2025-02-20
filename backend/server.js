const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const connectDB = require('./dbconection.js');
const GuestBookEntry = require('./models/GuestbookEntry.js');
const User = require('./models/User.js');
const {protect, admin} = require('./middleware/authMiddleware.js');

dotenv.config();
//C:\Users\deva pradana\Videos\project\pembukuan-tamu\src\api\.env
const app = express();
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:5173', // Ganti dengan URL frontend Anda
  // origin: 'https://komdigi-project-khh6.vercel.app/', // Ganti dengan URL frontend Anda
}));

// Koneksi ke MongoDB
connectDB();

app.get('/api/test-token', (req, res) => {
  const token = generateToken('test_id'); // Replace 'test_id' with a valid ID
  res.json({ token });
});

// Generate JWT Token
const generateToken = (id) => {
  console.log('Input ID:', id);
  console.log('JWT Secret:', process.env.JWT_SECRET);
  
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
  
  console.log('Generated Token:', token);
  
  return token;
};

// Auth Routes
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Cek apakah user sudah ada
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    // Buat user baru
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    console.error('Error registrasi:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat registrasi' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Cari user berdasarkan email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Email atau password salah' });
    }
  } catch (error) {
    console.error('Error login:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat login' });
  }
});

// Protected Routes
app.get('/api/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error mendapatkan profile' });
  }
});

// Existing Routes
app.post('/api/register-guest', async (req, res) => {
  const { nama, instansi, tanggal, tujuan, kategori, tandaTangan } = req.body;

  if (!nama || !instansi || !tanggal || !tujuan || !kategori || !tandaTangan) {
    return res.status(400).json({ message: 'Semua field harus diisi' });
  }

  try {
    const newEntry = new GuestBookEntry(req.body);
    await newEntry.save();
    res.status(200).json({ message: 'Pendaftaran berhasil', data: req.body });
  } catch (error) {
    console.error('Error menyimpan data:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menyimpan data' });
  }
});

// Protected Admin Route
app.get('/api/entries', protect, admin, async (req, res) => {
  try {
    const entries = await GuestBookEntry.find();
    res.status(200).json(entries);
  } catch (error) {
    console.error('Error mendapatkan data:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mendapatkan data' });
  }
});

app.delete('/api/entries/:id', protect, admin, async (req, res) => {
  try {
    const entry = await GuestBookEntry.findByIdAndDelete(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    res.status(200).json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting entry:', error);
    res.status(500).json({ message: 'Error deleting entry' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
