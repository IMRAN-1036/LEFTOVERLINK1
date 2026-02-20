const Food = require("./food.model");

const createFood = async ({ title, description, quantity, expiry, location, providerId }) => {
  const doc = await Food.create({
    title,
    description,
    quantity,
    expiry,
    location,
    provider: providerId,
  });

  return doc;
};

// For now this mirrors the earlier getFoods controller, with hooks for
// pagination and geo-based filtering in future iterations.
const listFood = async ({ status }) => {
  const query = {};
  if (status) {
    query.status = status;
  }

  const foods = await Food.find(query).populate("provider", "name");
  return foods;
};

const incrementViews = async (id) => {
  await Food.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } },
    { new: true },
  );
};

const claimFood = async ({ id, receiverId }) => {
  const food = await Food.findById(id);
  if (!food || food.status !== "available") {
    const err = new Error("Food is not available");
    err.status = 400;
    throw err;
  }

  food.status = "claimed";
  food.claimedBy = receiverId;
  await food.save();

  return food;
};

const deleteFood = async ({ id, providerId }) => {
  const food = await Food.findById(id);
  if (!food) {
    const err = new Error("Food not found");
    err.status = 404;
    throw err;
  }
  if (String(food.provider) !== String(providerId)) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }
  await Food.findByIdAndDelete(id);
};

module.exports = {
  createFood,
  listFood,
  incrementViews,
  claimFood,
  deleteFood,
};


