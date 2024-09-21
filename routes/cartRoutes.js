import express from 'express';
import { 
  getUsers, 
  updateUser, 
  toggleUserStatus, 
  toggleLiveProduct, 
  updateOrderType,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getCart,
  addToCart,
  removeFromCart,
  // updateCartItem,
  clearCart
} from '../controllers/userController.js';

const router = express.Router();

// Existing routes
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.put('/users/:id/status', toggleUserStatus);
router.put('/users/:id/live-product', toggleLiveProduct);
router.put('/users/:id/order-type', updateOrderType);

// New wishlist routes
router.get('/users/:userId/wishlist', getWishlist);
router.post('/users/:userId/wishlist', addToWishlist);
router.delete('/users/:userId/wishlist', removeFromWishlist);

// New cart routes
router.get('/users/:userId/cart', getCart);
router.post('/users/:userId/cart', addToCart);
router.delete('/users/:userId/cart', removeFromCart);
// router.put('/users/:userId/cart', updateCartItem);
router.delete('/users/:userId/cart/clear', clearCart);

export default router;