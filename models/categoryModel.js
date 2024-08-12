import mongoose from "mongoose";

// Define the Category schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  photo: {
    type: String,  // This will store the base64 string
  },
  slug: {
    type: String,
    lowercase: true,
  },
  subcategories: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'SubCategory' 
  },

});

const Category = mongoose.model("Category", categorySchema);

export default Category;
