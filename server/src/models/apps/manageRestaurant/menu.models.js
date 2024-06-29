import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { ENUMS } from "../../../constants/enum.js";

const menuItemSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  itemType: {
    type: String,
    required: true,
    enum: ENUMS.menuItemType,
    default: ENUMS.menuItemType[0],
  },
  foodGroup: {
    type: String,
    required: true,
    enum: ENUMS.foodGroup,
    default: ENUMS.foodGroup[0],
  },
  discount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  image: {
    type: {
      url: String,
      public_id: String,
    },
    default: {
      url: null,
      public_id: null,
    },
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  estimatedPrepTime: {
    type: Number,
    default: 0,
  },
});

const menuCategorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: {
      url: String,
      public_id: String,
    },
    default: {
      url: null,
      public_id: null,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  items: [menuItemSchema],
});

const menuSchema = new Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    categories: [menuCategorySchema],
  },
  { timestamps: true }
);

menuSchema.plugin(mongooseAggregatePaginate);

export const Menu = mongoose.model("Menu", menuSchema);
