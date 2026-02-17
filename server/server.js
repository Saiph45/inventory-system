const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// ==========================
// 1. MIDDLEWARE
// ==========================
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request Logging (Helps debugging)
app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.url}`);
    next();
});

// ==========================
// 2. DATABASE MODELS
// ==========================

// 👤 User Model
const userSchema = new mongoose.Schema({ 
    email: { type: String, required: true, unique: true }, 
    password: { type: String, required: true }, 
    role: { type: String, default: 'staff' } 
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

// 📦 Product Model
const productSchema = new mongoose.Schema({ 
    name: String, 
    price: Number, 
    quantity: Number,
    sku: { type: String, unique: true } 
});
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// 🛒 Order Model
const orderSchema = new mongoose.Schema({
    customerName: String,
    address: String,
    items: Array,
    total: Number,
    date: { type: Date, default: Date.now }
});
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// ==========================
// 3. AUTH ROUTES
// ==========================

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, role: 'staff' });
        await user.save();
        res.status(201).json({ message: "User created" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Login
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

// 🔐 Forgot Password (Master Key Reset)
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { email, newPassword, secretKey } = req.body;
        const MASTER_KEY = "mySuperSecretKey2026"; // 👈 You can change this

        if (secretKey !== MASTER_KEY) return res.status(403).json({ error: "Invalid Secret Key!" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: "Password Reset Successfully!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 🔑 Change Password (Logged In User)
app.post('/api/auth/change-password', async (req, res) => {
    try {
        const { email, oldPassword, newPassword } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ error: "Incorrect Old Password!" });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: "Password updated successfully!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================
// 4. PRODUCT ROUTES
// ==========================

// Get All
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ✅ Smart Add / Restock
app.post('/api/products', async (req, res) => {
    try {
        const { name, price, quantity, stock } = req.body;
        const finalQty = Number(quantity) || Number(stock) || 0;
        
        if (!name) return res.status(400).json({ message: "Name is required" });

        // Check if exists (Case Insensitive)
        let product = await Product.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });

        if (product) {
            // Restock
            product.quantity += finalQty; 
            if (price) product.price = Number(price); 
            await product.save();
            res.json({ message: "Stock Updated!", product });
        } else {
            // Create New
            const uniqueSku = `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            product = new Product({ 
                name, 
                price: Number(price) || 0, 
                quantity: finalQty,
                sku: uniqueSku
            });
            await product.save();
            res.status(201).json(product);
        }
    } catch (err) { res.status(500).json({ message: "Server Error", error: err.message }); }
});

// Delete
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================
// 5. ORDER ROUTES
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

app.get('/', (req, res) => res.send('✅ Server Running (All Features Enabled)'));

// ==========================
// 6. START SERVER
// ==========================
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));