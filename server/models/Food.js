const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    quantity: Number,
    expiry: Date,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, default: "available" },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    views: { type: Number, default: 0 },
    interested: { type: Number, default: 0 },
  },
  { timestamps: true },
);

foodSchema.index({ location: "2dsphere" });

// Transform GeoJSON back to { lat, lng } for frontend compatibility
foodSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    if (ret.location && ret.location.type === 'Point' && ret.location.coordinates) {
      ret.location = {
        lng: ret.location.coordinates[0],
        lat: ret.location.coordinates[1],
      };
    }
    return ret;
  }
});

module.exports = mongoose.model("Food", foodSchema);
