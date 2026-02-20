const authRoutes = require("../modules/auth/auth.routes");
const foodRoutes = require("../modules/food/food.routes");

const { authRateLimiter } = require("../middleware/rateLimiter");

const registerRoutes = (app) => {
  app.use("/api/auth", authRateLimiter, authRoutes);
  app.use("/api/food", foodRoutes);

  // Placeholder modules for future expansion:
  // app.use("/api/pickups", pickupRoutes);
  // app.use("/api/wallet", walletRoutes);
  // app.use("/api/admin", adminRoutes);
};

module.exports = {
  registerRoutes,
};

