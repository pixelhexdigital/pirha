// models/Analytics.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AnalyticSchema = new Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    date: { type: Date, required: true },
    visitCount: { type: Number, default: 0 },
    grossTotal: { type: Number, default: 0 },
    netAmount: { type: Number, default: 0 },
    mostSoldItem: {
      itemId: { type: Schema.Types.ObjectId, ref: "MenuItem", default: null },
      quantity: { type: Number, default: 0 },
    },
    tables: {
      free: { type: Number, default: 0 },
      occupied: { type: Number, default: 0 },
    },
    orderCount: { type: Number, default: 0 },
    billCount: { type: Number, default: 0 },
    canceledOrderCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Analytic", AnalyticSchema);
