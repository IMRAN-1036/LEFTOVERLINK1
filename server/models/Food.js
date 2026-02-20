const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    quantity: Number,
    expiry: Date,
    location: {
      lat: Number,
      lng: Number,
    },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, default: "available" },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    views: { type: Number, default: 0 },
    interested: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Food", foodSchema);
