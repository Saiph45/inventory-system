const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Make sure this path matches your folder structure

// ✅ GET All Products
// The URL is already '/api/products', so we just use '/'
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ✅ ADD Product
router.post('/', async (req, res) => {
    const { name, price, quantity } = req.body; // Using 'quantity' as discussed
    
    // Basic Validation
    if (!name || !price) {
        return res.status(400).json({ message: "Name and Price are required" });
    }

    const product = new Product({
        name,
        price,
        quantity: quantity || 0 // Default to 0 if missing
    });

    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ✅ DELETE Product
router.delete('/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;