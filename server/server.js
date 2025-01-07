const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');  // Import jwt for generating the token
const User = require('./models/User'); // Import User model

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

// Register Route


app.use('/api', authRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
