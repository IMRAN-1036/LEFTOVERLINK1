const { z } = require("zod");
const {
  createFood,
  listFood,
  incrementViews,
  claimFood,
  deleteFood,
} = require("./food.service");

const createFoodSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  quantity: z.number().int().min(1),
  expiry: z.coerce.date(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
  }),
});

const listFoodQuerySchema = z.object({
  status: z.string().optional(),
});

const createFoodHandler = async (req, res, next) => {
  try {
    const parsed = createFoodSchema.parse(req.body);
    const doc = await createFood({
      ...parsed,
      providerId: req.user.id,
    });

    // Match existing API: return the created document directly
    return res.status(201).json(doc);
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: err.errors,
      });
    }
    return next(err);
  }
};

const listFoodHandler = async (req, res, next) => {
  try {
    const parsed = listFoodQuerySchema.parse(req.query);

    const results = await listFood({
      status: parsed.status,
    });

    // Match existing API: return array of foods
    return res.json(results);
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: err.errors,
      });
    }
    return next(err);
  }
};

const incrementViewsHandler = async (req, res, next) => {
  try {
    const updated = await incrementViews(req.params.id);
    return res.json(updated || { ok: true });
  } catch (err) {
    return next(err);
  }
};

const claimFoodHandler = async (req, res, next) => {
  try {
    const requestedMeals = req.body.requestedMeals ? parseInt(req.body.requestedMeals, 10) : 1;
    const food = await claimFood({ 
        id: req.params.id, 
        receiverId: req.user.id,
        requestedMeals
    });
    // For compatibility, respond with a simple message
    return res.json({ message: "Food claimed successfully", food });
  } catch (err) {
    return next(err);
  }
};

const deleteFoodHandler = async (req, res, next) => {
  try {
    await deleteFood({ id: req.params.id, providerId: req.user.id });
    return res.json({ message: "Food deleted" });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createFoodHandler,
  listFoodHandler,
  incrementViewsHandler,
  claimFoodHandler,
  deleteFoodHandler,
};


