const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API APP TIN TUC RSS',
      version: '1.0.0',
      description: '',
    },
    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost:3000',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'], // chứa các comment Swagger
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerUiOptions = {
  swaggerOptions: {
    persistAuthorization: true, // giữ token khi refresh
    tryItOutEnabled: false,     // tắt tính năng "Try it out" tự động gọi API
  },
};

function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;
