import express from "express";
import {
  createProductController,
  deleteProductController,
  getProductController,
  getSingleProductController,
  productCategoryController,
  productCountController,
  productFiltersController,
  productListController,
  productPhotoController,
  realtedProductController,
  searchProductController,
  updateProductController,

  productSubcategoryController,
  processPaymentController, // Add this new controller
  braintreeTokenController, // Keep this for Braintree token generation
} from "../controllers/productController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import formidable from "express-formidable";

const router = express.Router();

// Existing routes
router.post(
  "/create-product",
  requireSignIn,
  isAdmin,
  formidable(),
  createProductController
);

router.put(
  "/update-product/:pid",
  requireSignIn,
  isAdmin,
  formidable(),
  updateProductController
);

router.get("/get-product", getProductController);
router.get("/get-product/:slug", getSingleProductController);
router.get("/product-photo/:pid", productPhotoController);
router.delete("/delete-product/:pid", deleteProductController);
router.post("/product-filters", productFiltersController);
router.get("/product-count", productCountController);
router.get("/product-list/:page", productListController);
router.get("/search/:keyword", searchProductController);
router.get("/related-product/:pid/:cid", realtedProductController);
router.get("/product-category/:slug", productCategoryController);
router.get("/product-subcategory/:subcategoryId", productSubcategoryController);
// Payment routes
router.get("/braintree/token", braintreeTokenController); // Keep this for Braintree token

// New route for processing payments (both COD and Braintree)
router.post("/process-payment", requireSignIn, processPaymentController);

export default router;