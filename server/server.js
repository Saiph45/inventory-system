const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'DELETE', 'PUT'] }));
app.use(express.json());

// ==========================
// 🗄️ DATABASE MODELS
// ==========================

// 1. Product Model
const productSchema = new mongoose.Schema({ name: String, price: Number, quantity: Number });
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// 2. User Model
const userSchema = new mongoose.Schema({ 
    email: { type: String, required: true, unique: true }, 
    password: { type: String, required: true }, 
    role: { type: String, default: 'staff' } 
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

// 3. ✅ NEW: Order Model (To save address & history)
const orderSchema = new mongoose.Schema({
    customerName: String,
    address: String,
    items: Array, // Stores the list of products bought
    total: Number,
    date: { type: Date, default: Date.now }
});
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// ==========================
// ⚡ ROUTES
// ==========================

// Auth & Product Routes (Same as before)
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
        if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: "Invalid credentials" });
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: "1h" });
        res.json({ token, role: user.role });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

app.post('/api/products', async (req, res) => {
    const { name, price, quantity, stock } = req.body;
    const finalQty = Number(quantity) || Number(stock) || 0;
    const newProduct = new Product({ name, price: Number(price), quantity: finalQty });
    await newProduct.save();
    res.status(201).json(newProduct);
});

app.delete('/api/products/:id', async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
});

// ✅ UPDATED: ORDER ROUTE (Now saves Address!)
app.post('/api/orders', async (req, res) => {
    const { cart, customerName, address } = req.body;

    if (!customerName || !address || cart.length === 0) {
        return res.status(400).json({ message: "Name, Address and Cart are required" });
    }

    try {
        let total = 0;
        // 1. Deduct Stock
        for (const item of cart) {
            const product = await Product.findById(item._id);
            if (product) {
                if (product.quantity < 1) {
                    return res.status(400).json({ message: `Out of stock: ${product.name}` });
                }
                product.quantity -= 1;
                total += product.price;
                await product.save();
            }
        }

        // 2. Save Order to Database
        const newOrder = new Order({
            customerName,
            address,
            items: cart,
            total
        });
        await newOrder.save();

        res.json({ message: "Order placed successfully!", orderId: newOrder._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => res.send('✅ Server Running with Address Support!'));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Port ${PORT}`));