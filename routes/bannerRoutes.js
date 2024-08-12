import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  createBannerController,
  getBannersController,updateBannerController,
  bannerImageController,deleteBannerController
 
} from "../controllers/bannerController.js";
import formidable from "express-formidable";

const router = express.Router();

// Create banner
router.post(
  "/create-banner",
  requireSignIn,
  isAdmin,
  formidable(),
  createBannerController,

);

// Update banner
router.put(
  "/update-banner/:id",
  requireSignIn,
  isAdmin,
  formidable(),
  updateBannerController
);

// Get all banners
router.get("/get-banners", getBannersController);

// Get single banner
router.get("/single-banner/:id", bannerImageController);

// Delete banner
router.delete(
  "/delete-banner/:id",
  requireSignIn,
  isAdmin,
  deleteBannerController
);

export default router;