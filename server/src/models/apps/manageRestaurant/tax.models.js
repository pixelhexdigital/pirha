import mongoose, { Schema } from "mongoose";
import { ENUMS } from "../../../controllers/apps/constants/enum.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const taxSchema = new Schema({
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  taxName: {
    type: String,
    enum: ENUMS.taxName,
    required: true,
  },
  taxPercentage: {
    type: Number,
    required: true,
  },
});

taxSchema.plugin(mongooseAggregatePaginate);

export const Tax = mongoose.model("Tax", taxSchema);
