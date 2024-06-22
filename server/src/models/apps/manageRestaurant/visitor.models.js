import mongoose, { Schema } from "mongoose";
const visitorSchema = new Schema({
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  visitDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  ips: [
    {
      ip: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

export const Visitor = mongoose.model("Visitor", visitorSchema);
