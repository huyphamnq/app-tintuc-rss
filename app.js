require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth.routes');
const setupSwagger = require('./docs/swagger');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Routes
app.use('/', authRoutes);

// Swagger
setupSwagger(app);

app.listen(port, () => {
  console.log(`🚀 Server chạy tại http://localhost:${port}`);
  console.log(`📘 Swagger UI: http://localhost:${port}/api-docs`);
});