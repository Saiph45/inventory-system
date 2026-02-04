const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ----------------------------------------------------
// 👇 THIS SECTION IS CRITICAL. DO NOT SKIP IT.
app.use(cors());
app.use(express.json()); // <--- This allows the server to read JSON body
// ----------------------------------------------------

// Routes
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/auth', require('./routes/auth'));

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));