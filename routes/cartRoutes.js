import express from 'express';
import { getUsers, updateUser, toggleUserStatus, toggleLiveProduct, 
    updateOrderType }from '../controllers/userController.js'

const router = express.Router();

router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.put('/users/:id/status', toggleUserStatus);
router.put('/users/:id/live-product', toggleLiveProduct);
router.put('/users/:id/order-type', updateOrderType);

export default router;