const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); 

// ✅ CORRECT: Just use '/' because server.js already adds '/api/products'
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ✅ CORRECT: Add Product
router.post('/', async (req, res) => {
    const { name, price, quantity } = req.body;
    
    const product = new Product({
        name,
        price,
        quantity: quantity || 0 
    });

    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ✅ CORRECT: Delete Product
router.delete('/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;