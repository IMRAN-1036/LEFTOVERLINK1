const authRoutes = require("../modules/auth/auth.routes");
const foodRoutes = require("../modules/food/food.routes");
const locationRoutes = require("../modules/location/location.routes");
const analyticsRoutes = require("../modules/analytics/analytics.routes");

const { authRateLimiter } = require("../middleware/rateLimiter");

const registerRoutes = (app) => {
  app.use("/api/auth", authRateLimiter, authRoutes);
  app.use("/api/food", foodRoutes);
  app.use("/api/location", locationRoutes);
  app.use("/api/analytics", analyticsRoutes);

  // Placeholder modules for future expansion:
  // app.use("/api/pickups", pickupRoutes);
  // app.use("/api/wallet", walletRoutes);
  // app.use("/api/admin", adminRoutes);
};

module.exports = {
  registerRoutes,
};

