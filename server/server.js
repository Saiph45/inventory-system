const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// 1. CORS - Allow Frontend to connect
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 2. Define Models DIRECTLY (Safety check)
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    quantity: Number
});
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'staff' }
});

// Prevent "OverwriteModelError"
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);

// ==========================
// 🔐 AUTH ROUTES (Login/Register)
// ==========================

// REGISTER
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, role: 'staff' });
        await user.save();
        res.status(201).json({ message: "User created" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) return res.status(400).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: "1h" });

        res.json({ token, role: user.role, user: { role: user.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================
// 📦 PRODUCT ROUTES
// ==========================

// GET ALL
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ADD PRODUCT
app.post('/api/products', async (req, res) => {
    try {
        const { name, price, quantity, stock } = req.body;
        const finalQuantity = Number(quantity) || Number(stock) || 0;

        const newProduct = new Product({
            name,
            price: Number(price),
            quantity: finalQuantity
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(400).json({ message: "Error adding product", error: err.message });
    }
});

// DELETE PRODUCT
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Test Route
app.get('/', (req, res) => {
    res.send('✅ Backend is Running! (Auth + Products Fixed)');
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ DB Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));