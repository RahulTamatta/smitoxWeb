import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: {},
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  role: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'blocked'],
    default: 'pending'
  },
  b_form_status: {
    type: Number,
    default: 0
  },
  live_product: {
    type: Boolean,
    default: false
  },
  order_type: {
    type: String,
    enum: ['0', '1', '2'],
    default: '0'
  },
}, { timestamps: true });

export default mongoose.model("User", userSchema);