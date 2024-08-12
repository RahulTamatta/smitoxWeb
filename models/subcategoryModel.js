import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  
  name: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true
  },
  photo: {
    type: String,  // This will store the base64 string
  },
  slug: {
    type: String,
    lowercase: true,
  },
}, { timestamps: true });

export default mongoose.model("SubCategory", subCategorySchema);
