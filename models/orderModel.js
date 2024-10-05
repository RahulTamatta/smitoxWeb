import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.ObjectId,
      ref: "User",
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: Number,
        price: Number
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
        enum: ["Pending", "Completed", "Cash on Delivery"],
        default: "Pending",
      },
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "Not Processed",
      enum: ["Not Processed", "Processing", "Shipped", "Delivered", "Cancelled"],
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