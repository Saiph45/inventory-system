const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// MIDDLEWARE
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));
app.use(express.json({ limit: '10mb' })); // Increased limit for bulk uploads

// MODELS
const userSchema = new mongoose.Schema({ 
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, 
    password: { type: String, required: true }, 
    role: { type: String, default: 'staff' } // Roles: 'admin', 'manager', 'staff'
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

const productSchema = new mongoose.Schema({ name: String, price: Number, quantity: Number, sku: String });
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const orderSchema = new mongoose.Schema({ customerName: String, address: String, items: Array, total: Number, date: { type: Date, default: Date.now } });
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// ROUTES

// 1. AUTH
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body; // Added role support for creating Managers
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword, role: role || 'staff' });
        await user.save();
        res.status(201).json({ message: "User created" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: "Invalid credentials" });
        const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET || 'secret', { expiresIn: "1h" });
        res.json({ token, role: user.role, name: user.name });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/reset-password', async (req, res) => {
    const { email, newPassword, secretKey } = req.body;
    if (secretKey !== "mySuperSecretKey2026") return res.status(403).json({ error: "Invalid Secret Key" });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password reset!" });
});

app.post('/api/auth/change-password', async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(oldPassword, user.password))) return res.status(400).json({ error: "Incorrect Old Password" });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password updated!" });
});

// 2. PRODUCTS
app.get('/api/products', async (req, res) => { const products = await Product.find(); res.json(products); });

app.post('/api/products', async (req, res) => {
    const { name, price, quantity, stock } = req.body;
    const finalQty = Number(quantity) || Number(stock) || 0;
    let product = await Product.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (product) { product.quantity += finalQty; if(price) product.price = Number(price); await product.save(); res.json({ message: "Stock Updated", product }); } 
    else { const uniqueSku = `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`; product = new Product({ name, price: Number(price), quantity: finalQty, sku: uniqueSku }); await product.save(); res.status(201).json(product); }
});

// ✅ NEW: BULK UPLOAD ROUTE (Satisfies Checklist Item: Bulk Upload)
app.post('/api/products/bulk', async (req, res) => {
    try {
        const products = req.body; // Expects array: [{name, price, quantity}, ...]
        let count = 0;
        for (const item of products) {
            if (!item.name) continue;
            let product = await Product.findOne({ name: { $regex: new RegExp(`^${item.name}$`, 'i') } });
            if (product) {
                product.quantity += Number(item.quantity || 0);
                await product.save();
            } else {
                const uniqueSku = `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                await new Product({ name: item.name, price: Number(item.price), quantity: Number(item.quantity), sku: uniqueSku }).save();
            }
            count++;
        }
        res.json({ message: `Successfully processed ${count} items!` });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/products/:id', async (req, res) => { await Product.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); });

// 3. ORDERS
app.get('/api/orders', async (req, res) => { const orders = await Order.find().sort({ date: -1 }); res.json(orders); });

app.post('/api/orders', async (req, res) => {
    const { cart, customerName, address } = req.body;
    try {
        let total = 0;
        for (const item of cart) { const product = await Product.findById(item._id); if (product) { product.quantity -= 1; total += product.price; await product.save(); } }
        const newOrder = new Order({ customerName, address, items: cart, total }); await newOrder.save(); res.json({ message: "Order placed!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ROOT
app.get('/', (req, res) => { res.send(`<h1>🚀 Inventory Server Running!</h1>`); });

mongoose.connect(process.env.MONGO_URI).then(() => console.log('✅ MongoDB Connected'));
app.listen(process.env.PORT || 5000, () => console.log(`🚀 Running`));