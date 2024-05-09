import mongoose, { Schema } from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const orderItemSchema = new Schema({
  menuItemId: {
    type: Schema.Types.ObjectId,
    ref: "Menu",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  itemPrice: {
    type: Number,
    required: true,
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
      ref: "Customer",
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["new", "ready", "served", "cancelled"],
      default: "new",
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

// Define a pre-save hook to calculate totalAmount based on items
orderSchema.pre("save", async function (next) {
  try {
    // Check if the status or paymentMethod fields are modified
    if (this.isModified("status") || this.isModified("paymentMethod")) {
      // Skip the calculation of totalAmount if status or paymentMethod is modified
      return next();
    }

    // Calculate totalAmount based on items
    let totalAmount = 0;
    for (const item of this.items) {
      totalAmount += item.price; // Assuming item.price is the total price for the item
    }

    this.totalAmount = totalAmount;
    next();
  } catch (error) {
    next(error); // Pass any error to the next middleware
  }
});

orderSchema.plugin(mongooseAggregatePaginate);

export const Order = mongoose.model("Order", orderSchema);
