import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import Wishlist from '../models/wishlistModel.js';

// Get all users with populated products, wishlist, and cart
export const getUsers = async (req, res) => {
  try {
    const users = await userModel.find().populate('products').populate('wishlist').populate('cart.product');
    res.json({ status: 'success', list: users });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Update user information by ID
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

// Toggle user status (active/inactive) by ID
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

// Toggle the live product status for a user
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

// Update the order type for a user by ID
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
    const wishlist = await Wishlist.findOne({ user: userId }).populate('products.product');

    if (!wishlist) {
      return res.status(404).json({ status: 'error', message: 'Wishlist not found' });
    }

    res.json({ status: 'success', wishlist: wishlist.products });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};


// Get the user's cart
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

// Clear all items from the user's cart
export const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { products: [] } },
      { new: true }
    );
    
    if (!result) {
      return res.status(404).json({ status: 'error', message: 'Cart not found' });
    }
    
    res.json({ status: 'success', message: 'Cart cleared' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};


export const removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Cart not found' });
    }
    
    const initialLength = cart.products.length;
    cart.products = cart.products.filter(item => item.product.toString() !== productId);
    
    if (cart.products.length === initialLength) {
      return res.status(404).json({ status: 'error', message: 'Product not found in cart' });
    }

    await cart.save();
    
    res.json({ status: 'success', message: 'Product removed from cart' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};


// Add a product to the wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { userId } = req.params; // User ID from the request params
    const { productId } = req.body; // Product ID from the request body

    // Check if the wishlist already exists
    const wishlist = await Wishlist.findOne({ user: userId });

    if (wishlist) {
      // Check if the product is already in the wishlist
      const productExists = wishlist.products.some(item => item.product.toString() === productId);
      if (productExists) {
        // If product exists, remove it from the wishlist
        const updatedWishlist = await Wishlist.findOneAndUpdate(
          { user: userId },
          { $pull: { products: { product: productId } } },
          { new: true }
        ).populate('products.product');

        return res.json({ status: 'success', message: 'Product removed from wishlist', wishlist: updatedWishlist });
      } else {
        // If product doesn't exist, add it to the wishlist
        const updatedWishlist = await Wishlist.findOneAndUpdate(
          { user: userId },
          { $addToSet: { products: { product: productId } } },
          { new: true }
        ).populate('products.product');

        return res.json({ status: 'success', message: 'Product added to wishlist', wishlist: updatedWishlist });
      }
    } else {
      // Create a new wishlist if it doesn't exist
      const newWishlist = new Wishlist({ user: userId, products: [{ product: productId }] });
      await newWishlist.save();
      const populatedWishlist = await newWishlist.populate('products.product');

      return res.json({ status: 'success', message: 'Wishlist created and product added', wishlist: populatedWishlist });
    }
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
      { $pull: { products: { product: productId } } },
      { new: true }
    ).populate('products.product');

    if (!wishlist) {
      return res.status(404).json({ status: 'fail', message: "Wishlist not found" });
    }

    res.json({ status: 'success', message: 'Product removed from wishlist', wishlist });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Check if product exists in wishlist
export const checkWishlistStatus = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const wishlist = await Wishlist.findOne({ user: userId });

    const productExists = wishlist ? wishlist.products.some(item => item.product.toString() === productId) : false;

    res.json({ status: 'success', exists: productExists });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Add a product to the user's cart
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

    // Check if the product is already in the cart
    const productIndex = cart.products.findIndex(item => item.product.toString() === productId);
    if (productIndex > -1) {
      // If the product is already in the cart, update the quantity
      cart.products[productIndex].quantity += quantity;
      cart.products[productIndex].bulkProductDetails.push(bulkProductDetails);
    } else {
      // If the product is not in the cart, add it
      cart.products.push({ product: productId, quantity, bulkProductDetails: [bulkProductDetails] });
    }

    await cart.save();
    res.json({ status: 'success', cart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
