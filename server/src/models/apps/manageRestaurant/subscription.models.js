import mongoose, { Schema } from "mongoose";
import { ENUMS } from "../../../constants/enum.js";

// Define the subscription plan schema
const subscriptionPlanSchema = new Schema({
  name: {
    type: String,
    enum: ENUMS.subscriptionPlan,
    default: ENUMS.subscriptionPlan[0],
    required: true,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    default: 0,
    required: true,
  },
  tableLimit: {
    type: Number,
    default: 0,
    required: true,
  },
  dailyCustomerLimit: {
    type: Number,
    required: true,
  },
  monthlyCustomerLimit: {
    type: Number,
    required: true,
  },
  menuCategoryLimit: {
    type: Number,
    required: true,
  },
  menuItemLimit: {
    type: Number,
    required: true,
  },
});

// Define the subscription schema
const subscriptionSchema = new Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    plan: {
      type: subscriptionPlanSchema,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isTrial: {
      type: Boolean,
      default: false,
    },
    trialEndDate: {
      type: Date,
    },
    active: {
      type: Boolean,
      default: true,
    },
    dailyCustomerCount: {
      type: Number,
      default: 0,
    },
    monthlyCustomerCount: {
      type: Number,
      default: 0,
    },
    lastMonthlyReset: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Middleware to reset daily and monthly customer counts
subscriptionSchema.methods.resetDailyCustomerCount = function () {
  this.dailyCustomerCount = 0;
  this.save();
};

subscriptionSchema.methods.resetMonthlyCustomerCount = function () {
  this.monthlyCustomerCount = 0;
  this.lastMonthlyReset = Date.now();
  this.save();
};

// Create and export the Subscription model
export const Subscription = mongoose.model("Subscription", subscriptionSchema);
