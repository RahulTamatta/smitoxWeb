import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: mongoose.ObjectId,
      ref: "Category",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    photo: {
      data: Buffer,
      contentType: String,
    },
    shipping: {
      type: Boolean,
    },
    hsnCode: {
      type: String,
    },
    unit: {
      type: String,
    },
    purchaseRate: {
      type: Number,
    },
    mrp: {
      type: Number,
    },
    perPiecePrice: {
      type: Number,
    },
    setPrice: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    allowCOD: {
      type: Boolean,
    },
    returnProduct: {
      type: Boolean,
    },
    flexibleQuantity: [
      {
        minimum: {
          type: Number,
        },
        maximum: {
          type: Number,
        },
      },
    ],
    discounts: [
      {
        discount_mrp: {
          type: Number,
        },
        selling_price_set: {
          type: Number,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Products", productSchema);
