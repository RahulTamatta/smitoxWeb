import express from 'express';
import {
  registerController,
  loginController,
  testController,
  forgotPasswordController,
  updateProfileController,
  updateOrderController,
  getOrdersController,
  getAllOrdersController,
  addProductToOrderController,
  orderStatusController,
  deleteProductFromOrderController,addTrackingInfo // Import your delete controller here
} from '../controllers/authController.js';
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js';
import orderModel from '../models/orderModel.js'; // Changed to import
import generateInvoicePDF from '../client/src/pages/Admin/Admin order/pdf.js'; // Changed to import
// import { addTrackingInfo } from "../controllers/orderController.js";

//router object
const router = express.Router();

//routing
//REGISTER || METHOD POST
router.post("/register", registerController);

//LOGIN || POST
router.post("/login", loginController);

//Forgot Password || POST
router.post("/forgot-password", forgotPasswordController);

//test routes
router.get("/test", requireSignIn, isAdmin, testController);
router.put("/order/:orderId/tracking", requireSignIn, isAdmin, addTrackingInfo);

//protected User route auth
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});
//protected Admin route auth
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

//update profile
router.put("/profile", requireSignIn, updateProfileController);

//orders
router.get("/orders", requireSignIn, getOrdersController);

//all orders
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController);
router.post("/order/:orderId/add-product", requireSignIn, isAdmin, addProductToOrderController);
router.get("/order/:orderId/invoice", requireSignIn, async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.orderId).populate('buyer').populate('products');
    if (!order) {
      return res.status(404).send('Order not found');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);

    generateInvoicePDF(order, res);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating invoice');
  }
});
// order status update
router.put("/order-status/:orderId", requireSignIn, isAdmin, orderStatusController);

// update order
router.put("/order/:orderId", requireSignIn, isAdmin, updateOrderController);

// remove product from order
router.delete("/order/:orderId/remove-product/:productId", requireSignIn, isAdmin, deleteProductFromOrderController);

export default router;
