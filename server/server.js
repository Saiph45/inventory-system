const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
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
    console.log(`📡 ${req.method} ${req.url}`, req.body);
    next();
});

// 1. ✅ UPDATE SCHEMA: Tell Mongoose about the SKU field
const productSchema = new mongoose.Schema({ 
    name: String, 
    price: Number, 
    quantity: Number,
    sku: { type: String, unique: true } // Ensure it's unique
});
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// ROUTES
app.get('/', (req, res) => res.send('✅ Backend Fixed & Ready'));

app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        console.log("📝 Adding Product...");
        const { name, price, quantity, stock } = req.body;
        
        const finalQty = Number(quantity) || Number(stock) || 0;
        const finalPrice = Number(price) || 0;

        if (!name) return res.status(400).json({ message: "Name is required" });

        // 2. ✅ GENERATE UNIQUE SKU
        // This creates a unique ID like "SKU-174000123" based on the current time
        const uniqueSku = `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const newProduct = new Product({ 
            name, 
            price: finalPrice, 
            quantity: finalQty,
            sku: uniqueSku // Save the unique ID
        });
        
        await newProduct.save();
        console.log("✅ Saved with SKU:", uniqueSku);
        res.status(201).json(newProduct);
    } catch (err) {
        console.error("❌ ADD Error:", err);
        // Better error message for duplicate keys
        if (err.code === 11000) {
            res.status(400).json({ message: "Error: Product already exists (Duplicate SKU)" });
        } else {
            res.status(500).json({ message: "Server Error", error: err.message });
        }
    }
});

// Database
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ DB Connection Failed:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));