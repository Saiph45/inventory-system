const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1️⃣ FIX CORS: Allow your Frontend to talk to Backend
app.use(cors({
    origin: '*', // Allow ALL websites (easiest fix for now)
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 2️⃣ FIX ROUTES: Make sure the address matches!
// We are explicitly telling it to use '/api/products'
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);

// Test Route (To check if server is working)
app.get('/', (req, res) => {
    res.send('✅ Backend is Running!');
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ DB Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));