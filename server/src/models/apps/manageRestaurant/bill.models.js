import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const taxSchema = new Schema({
  taxName: {
    type: String,
    required: true,
  },
  taxPercentage: {
    type: Number,
    required: true,
  },
});

const billSchema = new Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
        required: true,
      },
    ],
    taxes: [taxSchema], // Array of tax objects
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "Online"],
      required: true,
    },
  },
  { timestamps: true }
);

billSchema.plugin(mongooseAggregatePaginate);

export const Bill = mongoose.model("Bill", billSchema);
