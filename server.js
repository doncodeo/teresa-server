// Import Swagger dependencies
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./swagger");

// Existing imports
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const connectDb = require('./config/db');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5300;

// MongoDB Configuration
const uri = process.env.MONGO_CONNECTION_STRING;

// Connect to MongoDB
connectDb()
  .then(() => {
    const allowedOrigins = [
      'http://localhost:5174',
    ]; 

    app.use(cors({ origin: allowedOrigins }));

    // Middleware for JSON and URL-encoded data
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Swagger documentation route
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

    // Routes
    app.use('/api/user', require('./Routes/userRoute'));
    app.use('/api/families', require('./Routes/familyRoute'));
    app.use('/api/message', require('./Routes/messageRoute'));

    // Serve index.html for any other route (excluding OPTIONS method)
    app.get('*', (req, res) => {
      if (req.method !== 'OPTIONS') {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
      }
    });

    // Handling Preflight OPTIONS requests
    app.options('*', cors());

    // Start the server
    app.listen(port, () => console.log(`Server started on port ${port}`));
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  });













