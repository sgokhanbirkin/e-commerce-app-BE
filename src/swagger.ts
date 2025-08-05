export const swaggerOptions = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "E-Commerce API",
      version: "1.0.0",
      description: "Kayra Export E-Commerce Backend Swagger Docs",
    },
    servers: [
      { url: "http://localhost:8080", description: "Local dev server" },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"], // JSDoc yorumlarından spec üretilecek dosyalar
};
