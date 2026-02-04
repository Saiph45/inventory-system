const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const mongoose = require('mongoose');

// GET all products
router.get('/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// POST Create Order (Transactional)
router.post('/order', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items } = req.body; // Expects [{ productId, quantity }]

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      
      if (!product) throw new Error(`Product not found`);
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      // Deduct Stock 
      product.stock -= item.quantity;
      await product.save({ session });
    }

    // (Here you would typically save the Order model too)
    
    await session.commitTransaction();
    res.json({ message: 'Order Processed & Stock Deducted' });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ error: err.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;