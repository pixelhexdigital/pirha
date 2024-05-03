import mongoose, { Schema } from "mongoose";
import QRCode from "qrcode";

const tableSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    baseUrl: {
      type: String,
      required: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    status: {
      type: String,
      enum: ["free", "occupied"],
      default: "free",
    },
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    billAmount: {
      type: Number,
      default: 0,
    },
    currentOrderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    currentCustomerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
  },
  { timestamps: true }
);

export const Table = mongoose.model("Table", tableSchema);
