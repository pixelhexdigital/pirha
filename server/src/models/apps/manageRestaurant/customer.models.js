import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";

const customerSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    number: {
      type: String,
      required: true,
      unique: true,
    },
    restaurants: [
      {
        type: Schema.Types.ObjectId,
        ref: "Restaurant",
      },
    ],
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
  },
  { timestamps: true }
);

customerSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      number: this.number,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

export const Customer = mongoose.model("Customer", customerSchema);
