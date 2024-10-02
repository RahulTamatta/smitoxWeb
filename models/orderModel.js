import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
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
    buyer: {
      type: mongoose.ObjectId,
      ref: "users",
    },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Confirmed", "Accepted", "Cancelled", "Rejected", "Dispatched","Delivered","Returned"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);