import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import Wishlist from '../models/wishlistModel.js';


export const getUsers = async (req, res) => {
  try {
    const users = await userModel.find().populate('products').populate('wishlist').populate('cart.product');
    res.json({ status: 'success', list: users });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await userModel.findByIdAndUpdate(id, req.body, { new: true })
      .populate('products')
      .populate('wishlist')
      .populate('cart.product');
    res.json({ status: 'success', user: updatedUser });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedUser = await userModel.findByIdAndUpdate(id, { status }, { new: true })
      .populate('products')
      .populate('wishlist')
      .populate('cart.product');
    res.json({ status: 'success', user: updatedUser });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const toggleLiveProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);
    user.live_product = !user.live_product;
    await user.save();
    res.json({ status: 'success', user });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateOrderType = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_type } = req.body;
    const updatedUser = await userModel.findByIdAndUpdate(id, { order_type }, { new: true })
      .populate('products')
      .populate('wishlist')
      .populate('cart.product');
    res.json({ status: 'success', user: updatedUser });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};



// Get Wishlist for a User


export const getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find the wishlist for the user and populate the products
    const wishlist = await Wishlist.findOne({ user: userId }).populate('products.product');
    
    if (!wishlist) {
      return res.status(404).json({ status: 'error', message: 'Wishlist not found' });
    }
    
    res.json({ status: 'success', wishlist: wishlist.products }); // Return the populated products
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
export const addToWishlist = async (req, res) => {
  try {
    const { userId } = req.params; // User ID from the request params
    const { productId } = req.body; // Product ID from the request body

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      { $addToSet: { products: { product: productId } } }, // Use 'products' instead of 'items'
      { new: true, upsert: true } // upsert: true will create a new wishlist if it doesn't exist
    )
      .populate('products.product') // Correct path for populating product details
      .populate('user'); // Optionally populate the user details

    res.json({ status: 'success', wishlist });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Remove Product from Wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      { $pull: { products: { product: productId } } }, // Use 'products' instead of 'items'
      { new: true }
    )
      .populate('products.product') // Correct path for populating product details
      .populate('user'); // Optionally populate the user details

    if (!wishlist) {
      return res.status(404).json({ status: 'fail', message: "Wishlist not found" });
    }

    res.json({ status: 'success', wishlist });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};



export const addToCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, quantity, bulkProductDetails } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, products: [] });
    }

    const existingProductIndex = cart.products.findIndex(
      item => item.product.toString() === productId
    );

    if (existingProductIndex > -1) {
      cart.products[existingProductIndex].quantity = quantity;
      cart.products[existingProductIndex].bulkProductDetails = bulkProductDetails;
    } else {
      cart.products.push({ product: productId, quantity, bulkProductDetails });
    }

    const totalPrice = quantity * (bulkProductDetails ? bulkProductDetails.selling_price_set : product.price);

    await cart.save();
    await cart.populate('products.product');

    res.json({ 
      status: 'success', 
      message: 'Cart updated successfully', 
      cart: cart.products,
      totalPrice
    });
  } catch (error) {
    console.error('Error in addToCart:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ user: userId }).populate('products.product');
    
    if (!cart) {
      return res.json({ status: 'success', cart: [] });
    }
    
    res.json({ status: 'success', cart: cart.products });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId } = req.body;
    
    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Cart not found' });
    }
    
    cart.products = cart.products.filter(item => item.product.toString() !== productId);
    await cart.save();
    
    res.json({ status: 'success', message: 'Product removed from cart' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Cart not found' });
    }
    
    cart.products = [];
    await cart.save();
    
    res.json({ status: 'success', message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};