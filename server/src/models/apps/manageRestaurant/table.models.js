import mongoose, { Schema } from "mongoose";
import QRCode from "qrcode";

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
      enum: ["free", "occupied"],
      default: "free",
    },
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    billAmount: {
      type: Number,
      default: 0,
    },
    currentOrderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    currentCustomerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
    qrCode: {
      type: String,
      default: "", // Store QR code data as a string
    },
  },
  { timestamps: true }
);

// Pre-save middleware to generate and store QR code before saving a new table document
tableSchema.pre("save", async function (next) {
  if (!this.isNew) {
    // Only generate QR code for new table documents
    return next();
  }

  try {
    const qrCodeData = `${this.baseUrl}/?table=${this._id}`;
    const qrCodeImageBuffer = await QRCode.toBuffer(qrCodeData);
    this.qrCode = qrCodeImageBuffer.toString("base64"); // Store QR code as base64 string
    next();
  } catch (error) {
    next(error); // Pass any errors to the next middleware or error handler
  }
});

export const Table = mongoose.model("Table", tableSchema);
