import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const menuItemSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  itemType: {
    type: String,
    required: true,
    enum: ["Food", "Alcoholic Drink", "Non-Alcoholic Drink"],
    default: "Food",
  },
  discount: {
    type: Number,
    default: 0,
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
