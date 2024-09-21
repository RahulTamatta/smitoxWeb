import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    pincode: { type: String, required: true },
    role: { type: Number, default: 0 },
    status: { 
      type: String, 
      default: "active", 
      enum: ["active", "inactive", "pending"] // Added "pending" to allowed values
    },
    live_product: { type: Boolean, default: true },
    order_type: { 
      type: String, 
      default: "all", 
      enum: ["all", "cod", "online", "0"] // Added "0" to allowed values
    },
    products: [{ type: mongoose.ObjectId, ref: "Product" }],
    wishlist: [{ type: mongoose.ObjectId, ref: "Product" }],
    cart: [{
      product: { type: mongoose.ObjectId, ref: "Product" },
      quantity: Number,
      bulkProductDetails: {
        minimum: Number,
        maximum: Number,
        selling_price_set: Number,
      },
      totalPrice: Number,
    }],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);