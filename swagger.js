// swagger.js
const swaggerJsDoc = require("swagger-jsdoc");

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "TERESA API Documentation",
      version: "1.0.0",
      description: "API documentation for Teresa App",
      contact: {
        name: "dNet",
      },
    },
    servers: [
      {
        url: "http://localhost:5300", // Change if using a different port
      },
    ],
  },
  apis: ["./Routes/*.js"], // Path to your route files
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
module.exports = swaggerDocs;
