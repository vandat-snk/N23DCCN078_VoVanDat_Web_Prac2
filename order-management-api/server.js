const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

require('dotenv').config();
const app = express();
// Middleware
app.use(cors());
app.use(express.json()); // Cho phep server doc JSON tu request body
app.use(morgan('dev'));

const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);
// Ket noi MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected!'))
  .catch(err => console.error('❌ Connection error:', err));
// Khoi chay server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
console.log(`🚀 Server is running on port ${PORT}`);
});