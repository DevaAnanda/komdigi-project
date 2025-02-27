const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Inisialisasi Firebase Admin
//const serviceAccount = require('./firebase-service-account.json');

//const firebaseApp = initializeApp({
//  credential: cert(serviceAccount)
//});

const firebaseApp = initializeApp({
  credential: cert({
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  })
});

// Inisialisasi Firestore
const db = getFirestore();

// Cek koneksi dengan Firestore
db.collection('users').get()
  .then(snapshot => {
    console.log('Connected to Firestore, users collection:', snapshot.size);
  })
  .catch(error => {
    console.error('Error connecting to Firestore:', error);
  });

// Collections references
const usersCollection = db.collection('users');
const entriesCollection = db.collection('guestbook-entries');

// Generate JWT Token
const generateToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
  return token;
};

// Auth Middleware
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userDoc = await usersCollection.doc(decoded.id).get();
      
      if (!userDoc.exists) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      
      req.user = { _id: userDoc .id, ...userDoc.data() };
      next();
    } catch (error) {
      console.error('Auth error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as admin' });
  }
};

// Auth Routes
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userSnapshot = await usersCollection.where('email', '==', email).get();
    
    if (!userSnapshot.empty) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      createdAt: FieldValue.serverTimestamp()
    };

    const userRef = await usersCollection.add(userData);
    
    const { password: _, ...userDataWithoutPassword } = userData;
    
    res.status(201).json({
      _id: userRef.id,
      ...userDataWithoutPassword,
      token: generateToken(userRef.id),
    });
  } catch (error) {
    console.error('Error registrasi:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat registrasi' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userSnapshot = await usersCollection.where('email', '==', email).get();
    
    if (userSnapshot.empty) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const userDoc = userSnapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };

    if (await bcrypt.compare(password, user.password)) {
      const { password, ...userWithoutPassword } = user;
      
      res.json({
        _id: userDoc.id,
        ...userWithoutPassword,
        token: generateToken(userDoc.id),
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
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
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
    const entryData = {
      ...req.body,
      createdAt: FieldValue.serverTimestamp()
    };
    
    const docRef = await entriesCollection.add(entryData);
    
    res.status(200).json({ 
      message: 'Pendaftaran berhasil', 
      data: {
        id: docRef.id,
        ...entryData
      } 
    });
  } catch (error) {
    console.error('Error menyimpan data:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menyimpan data' });
  }
});

// Protected Admin Route
app.get('/api/entries', protect, admin, async (req, res) => {
  try {
    const entriesSnapshot = await entriesCollection.orderBy('createdAt', 'desc').get();
    const entries = entriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json(entries);
  } catch (error) {
    console.error('Error mendapatkan data:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mendapatkan data' });
  }
});

app.delete('/api/entries/:id', protect, admin, async (req, res) => {
  try {
    await entriesCollection.doc(req.params.id).delete ();
    res.status(200).json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting entry:', error);
    res.status(500).json({ message: 'Error deleting entry' });
  }
});

app.get('/api/test-token', (req, res) => {
  const token = generateToken('test_id'); // Replace 'test_id' with a valid ID
  res.json({ token });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});