const cors = require("cors");
const { config } = require("./env");

const buildCorsMiddleware = () => {
  const { allowedOrigins } = config.cors;

  return cors({
    origin(origin, callback) {
      // Allow non-browser tools (like curl/Postman) with no origin
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });
};

module.exports = {
  buildCorsMiddleware,
};

