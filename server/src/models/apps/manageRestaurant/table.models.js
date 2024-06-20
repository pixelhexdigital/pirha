import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { ENUMS } from "../../../constants/enum.js";
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
      enum: ENUMS.tableStatus,
      default: ENUMS.tableStatus[0],
    },
  },
  { timestamps: true }
);
tableSchema.plugin(mongooseAggregatePaginate);
export const Table = mongoose.model("Table", tableSchema);
