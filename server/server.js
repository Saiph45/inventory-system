const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. Allow Frontend to Connect (CORS)
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 2. Define Product Model DIRECTLY here (Safety check)
// If you already have models/Product.js, this just ensures it works
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    quantity: Number
});
// Check if model exists before defining to avoid overwrite errors
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// 3. API ROUTES (Written directly here so they can't be lost)

// ✅ GET ALL PRODUCTS
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ✅ ADD PRODUCT
app.post('/api/products', async (req, res) => {
    try {
        const { name, price, quantity, stock } = req.body;
        
        // Handle "stock" vs "quantity" confusion automatically
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

// ✅ DELETE PRODUCT
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. Test Route
app.get('/', (req, res) => {
    res.send('✅ Backend is Running & Routes are Fixed!');
});

// 5. Connect to Database
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ DB Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));