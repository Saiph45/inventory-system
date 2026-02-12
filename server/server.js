const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Product = require('./models/Product'); // Import Product Model directly
require('dotenv').config();

const app = express();

// 1️⃣ FIX CORS (Allow Frontend to connect)
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 2️⃣ LOGGING (Helps us see requests in Render logs)
app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    next();
});

// 3️⃣ INLINE PRODUCT ROUTES (So they can't get lost)

// GET All Products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ADD Product
app.post('/api/products', async (req, res) => {
    console.log("Adding Product:", req.body); // Debug log
    const { name, price, quantity, stock } = req.body;
    
    // Support BOTH 'quantity' and 'stock' to be safe
    const finalStock = Number(quantity) || Number(stock) || 0;

    const product = new Product({
        name,
        price: Number(price),
        quantity: finalStock
    });

    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        console.error("Add Error:", err);
        res.status(400).json({ message: err.message });
    }
});

// DELETE Product
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4️⃣ KEEP AUTH SEPARATE (Since login works fine)
// Make sure this file exists in server/routes/authRoutes.js
try {
    const authRoutes = require('./routes/authRoutes');
    app.use('/api/auth', authRoutes);
} catch (error) {
    console.error("Auth Routes Error:", error);
}

// Root Route
app.get('/', (req, res) => {
    res.send('✅ Backend is Running & Products are Loaded!');
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ DB Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));