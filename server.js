require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');

const app = express();
connectDB();
app.use(express.json());
app.use(cors());


app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

app.listen(5000, () => console.log('Server running on port 5000'));
