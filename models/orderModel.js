import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.ObjectId,
      ref: "User",
    },
    products: [
      {
        type: mongoose.ObjectId,
        ref: "Product",
      },
    ],
    payment: {
      paymentMethod: {
        type: String,
        enum: ["COD", "Braintree"],
        required: true,
      },
      transactionId: String,
      status: {
        type: String,
        enum: ["Pending", "Completed"],
        default: "Pending",
      },
  
    },
    amount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    },
    deliveryCharges: {
      type: Number,
      default: 0,
    },
    codCharges: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    amountPending: {
      type: Number,
      default: 0,
    },
    tracking: {
      company: String,
      id: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);