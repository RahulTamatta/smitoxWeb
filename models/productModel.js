import mongoose from "mongoose";

const { Schema } = mongoose;

const productSchema = new Schema(
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
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
     
    },
    photo: {
      data: Buffer, // This assumes you store photo as Buffer (optional)
      contentType: String, // This assumes you store content type of photo (optional)
    },
    shipping: {
      type: Boolean,
    },
  hsn: {
      type: String,
    },
    unit: {
      type: String,
    },
    additionalUnit: {
      type: mongoose.Schema.Types.Mixed,
      default: ""
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
    totalsetPrice: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    unitSet: {
      type: Number,
    },
    gst: {
      type: String,
    },
    allowCOD: {
      type: Boolean,
    },
    returnProduct: {
      type: Boolean,
    },
  bulkProducts: [{
    minimum: Number,
    maximum: Number,
    discount_mrp: Number,
    selling_price_set: Number
  }]
  
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
