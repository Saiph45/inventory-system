const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// LOGGING
app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.url}`);
    next();
});

// ==========================
// 🗄️ DATABASE MODELS
// ==========================

// 1. User Model (Restored!)
const userSchema = new mongoose.Schema({ 
    email: { type: String, required: true, unique: true }, 
    password: { type: String, required: true }, 
    role: { type: String, default: 'staff' } 
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

// 2. Product Model (With SKU Fix)
const productSchema = new mongoose.Schema({ 
    name: String, 
    price: Number, 
    quantity: Number,
    sku: { type: String, unique: true } // ✅ Unique ID
});
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// 3. Order Model
const orderSchema = new mongoose.Schema({
    customerName: String,
    address: String,
    items: Array,
    total: Number,
    date: { type: Date, default: Date.now }
});
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// ==========================
// 🔐 AUTH ROUTES (Restored!)
// ==========================

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, role: 'staff' });
        await user.save();
        res.status(201).json({ message: "User created" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) return res.status(400).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: "1h" });

        res.json({ token, role: user.role, user: { role: user.role } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================
// 📦 PRODUCT ROUTES
// ==========================

app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/products', async (req, res) => {
    try {
        const { name, price, quantity, stock } = req.body;
        const finalQty = Number(quantity) || Number(stock) || 0;
        
        if (!name) return res.status(400).json({ message: "Name is required" });

        // ✅ Generate Unique SKU
        const uniqueSku = `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const newProduct = new Product({ 
            name, 
            price: Number(price), 
            quantity: finalQty,
            sku: uniqueSku
        });
        
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        console.error("Add Error:", err);
        if (err.code === 11000) {
            res.status(400).json({ message: "Duplicate SKU Error - Try again" });
        } else {
            res.status(500).json({ message: "Server Error", error: err.message });
        }
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================
// 🛒 ORDER ROUTES
// ==========================

app.post('/api/orders', async (req, res) => {
    const { cart, customerName, address } = req.body;
    if (!customerName || !address || cart.length === 0) return res.status(400).json({ message: "Details missing" });

    try {
        let total = 0;
        for (const item of cart) {
            const product = await Product.findById(item._id);
            if (product) {
                if (product.quantity < 1) return res.status(400).json({ message: `Out of stock: ${product.name}` });
                product.quantity -= 1;
                total += product.price;
                await product.save();
            }
        }
        const newOrder = new Order({ customerName, address, items: cart, total });
        await newOrder.save();
        res.json({ message: "Order placed!", orderId: newOrder._id });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/', (req, res) => res.send('✅ Server Running (Login + Products + Orders)'));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));