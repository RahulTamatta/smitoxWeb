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
      default: "Not Process",
      enum: ["Not Process", "Processing", "Shipped", "Delivered", "Cancelled"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);