const Food = require("./food.model");

const createFood = async ({
  title,
  description,
  quantity,
  expiry,
  location,
  providerId,
}) => {
  const doc = await Food.create({
    title,
    description,
    quantity,
    expiry,
    location: {
      lat: location.lat,
      lng: location.lng,
      address: location.address || "Unknown Location",
    },
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
  await Food.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
};

const claimFood = async ({ id, receiverId, requestedMeals = 1 }) => {
  const food = await Food.findById(id);

  if (!food) {
    const err = new Error("Food not found");
    err.status = 404;
    throw err;
  }

  if (food.status !== "available" || food.quantity < requestedMeals) {
    const err = new Error("Not enough meals available or already claimed fully");
    err.status = 400; // Leaving as 400 to match standard flow, frontend might be showing 403 erroneously due to UI flow
    throw err;
  }

  food.quantity -= requestedMeals;
  if (food.quantity <= 0) {
    food.status = "claimed";
  }
  // We can track last claimedBy or push to an array if we redefine the schema later,
  // but for now, just updating the existing field will work to mark it 'claimed' eventually.
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
