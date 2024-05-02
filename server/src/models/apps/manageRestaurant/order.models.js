import mongoose, { Schema } from "mongoose";

const orderItemSchema = new Schema({
  menuItemId: {
    type: Schema.Types.ObjectId,
    ref: "MenuItem",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
  },
});

const orderSchema = new Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
    paymentMethod: {
      type: String,
      default: "cash",
    },
  },
  { timestamps: true }
);

// Methods for managing orders
orderSchema.methods.addItemToOrder = function (newItem) {
  this.items.push(newItem);
  this.totalAmount += newItem.price * newItem.quantity;
  return this.save();
};

orderSchema.methods.updateItemInOrder = function (itemId, updatedItem) {
  const item = this.items.id(itemId);
  if (!item) {
    throw new Error("Item not found in order");
  }
  // Update item details
  item.quantity = updatedItem.quantity;
  item.price = updatedItem.price;
  this.totalAmount = this.calculateTotalAmount();
  return this.save();
};

orderSchema.methods.removeItemFromOrder = function (itemId) {
  const item = this.items.id(itemId);
  if (!item) {
    throw new Error("Item not found in order");
  }
  this.totalAmount -= item.price * item.quantity;
  item.remove();
  return this.save();
};

orderSchema.methods.calculateTotalAmount = function () {
  return this.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
};

export const Order = mongoose.model("Order", orderSchema);
