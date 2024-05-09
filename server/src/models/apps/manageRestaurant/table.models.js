import mongoose, { Schema } from "mongoose";
import QRCode from "qrcode";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
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
tableSchema.plugin(mongooseAggregatePaginate);
export const Table = mongoose.model("Table", tableSchema);
