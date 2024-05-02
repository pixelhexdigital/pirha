import mongoose, { Schema } from "mongoose";

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
  discount: {
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

// Methods for managing categories
menuSchema.methods.addCategory = function (newCategory) {
  this.categories.push(newCategory);
  return this.save();
};

menuSchema.methods.updateCategory = function (categoryId, updatedCategory) {
  const category = this.categories.id(categoryId);
  if (!category) {
    throw new Error("Category not found");
  }
  Object.assign(category, updatedCategory);
  return this.save();
};

menuSchema.methods.deleteCategory = function (categoryId) {
  const category = this.categories.id(categoryId);
  if (!category) {
    throw new Error("Category not found");
  }
  category.remove();
  return this.save();
};

// Methods for managing items within categories
menuSchema.methods.addItemToCategory = function (categoryId, newItem) {
  const category = this.categories.id(categoryId);
  if (!category) {
    throw new Error("Category not found");
  }
  category.items.push(newItem);
  return this.save();
};

menuSchema.methods.updateItemInCategory = function (
  categoryId,
  itemId,
  updatedItem
) {
  const category = this.categories.id(categoryId);
  if (!category) {
    throw new Error("Category not found");
  }
  const item = category.items.id(itemId);
  if (!item) {
    throw new Error("Item not found");
  }
  Object.assign(item, updatedItem);
  return this.save();
};

menuSchema.methods.removeItemFromCategory = function (categoryId, itemId) {
  const category = this.categories.id(categoryId);
  if (!category) {
    throw new Error("Category not found");
  }
  category.items.id(itemId).remove();
  return this.save();
};

export const Menu = mongoose.model("Menu", menuSchema);
