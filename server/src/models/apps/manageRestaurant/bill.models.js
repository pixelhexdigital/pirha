import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { ENUMS } from "../../../constants/enum.js";

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
    grossTotal: {
      type: String,
    },
    serviceCharge: {
      type: String,
    },
    vatAlcohol: {
      type: String,
    },
    vatFood: {
      type: String,
    },
    serviceTax: {
      type: String,
    },
    netAmount: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ENUMS.paymentStatus,
      default: ENUMS.paymentStatus[0],
    },
    paymentMethod: {
      type: String,
      enum: ENUMS.paymentMethod,
      required: true,
      default: ENUMS.paymentMethod[0],
    },
  },
  { timestamps: true }
);

billSchema.plugin(mongooseAggregatePaginate);

export const Bill = mongoose.model("Bill", billSchema);
