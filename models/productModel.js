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
    subcategory: {
      type: Schema.Types.ObjectId,
      ref: "Subcategory",
      required: true,
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      
    },
    quantity: {
      type: Number,
      // required: flase,
    },
    stock: {
      type: Number,
      default: 0,
    },
    photo: {
      data: Buffer,
      contentType: String,
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
      type: Number,
    },
    gstType: {
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
    }],
    isActive: {
      type: String,
      enum: ['0', '1', '2'],
      default: '1'
    },
    userId: {
      type: String,
      // required: flase,
    },
    // skuCode: {
    //   type: String,
    //   // required: false,
    //   unique: flase,
    // },
    images: [{
      type: String
    }],
    variants: [{
      variantId: Schema.Types.ObjectId,
      variantName: String,
      price: Number,
      stock: Number,
      image: String
    }],
    sets: [{
      setId: Schema.Types.ObjectId,
      setName: String,
      price: Number,
      quantity: Number
    }],
  },
  { timestamps: true }
);

// Index for faster queries
productSchema.index({ name: 'text' });

// Virtual for full image URL
productSchema.virtual('imageUrls').get(function() {
  return this.images.map(image => `${process.env.BASE_URL}/assets/images/product/${image}`);
});

// Method to check if SKU exists
productSchema.statics.checkSKU = async function(sku) {
  const count = await this.countDocuments({ skuCode: sku });
  return count > 0;
};

// Method to get the last SKU for a specific user
productSchema.statics.getLastSKU = async function(userId) {
  const product = await this.findOne({ userId: userId })
    .sort({ skuCode: -1 })
    .select('skuCode')
    .lean();
  return product ? product.skuCode : null;
};

export default mongoose.model("Product", productSchema);