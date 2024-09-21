import mongoose from "mongoose";
import productModel from "../models/productModel.js";
import subcategoryModel from "../models/subcategoryModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";

import fs from "fs";
import slugify from "slugify";
import dotenv from "dotenv";
import { v4 as uuidv4 } from 'uuid';
dotenv.config();

export const createProductController = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subcategory,
      brand,
      quantity,
      shipping,
      hsn,
      unit,
      unitSet,
      additionalUnit,
      stock,
      gst,
      gstType,
      purchaseRate,
      mrp,
      perPiecePrice,
      // totalsetPrice,
      weight,
      bulkProducts,
      allowCOD,
      returnProduct,
      userId,
      // skuCode,
      variants,
      sets,
    } = req.fields;
    const { photo } = req.files;

    // Validation
    // if (!name || !description) {
    //   return res
    //     .status(400)
    //     .send({ error: "All required fields must be provided." });
    // }

    // Handle photo size validation if provided
    if (photo && photo.size > 1000000) {
      return res
        .status(400)
        .send({ error: "Photo size should be less than 1MB." });
    }

    // Parse bulkProducts as JSON if it's a string
    let parsedBulkProducts = bulkProducts;
    if (typeof bulkProducts === 'string') {
      try {
        parsedBulkProducts = JSON.parse(bulkProducts);
      } catch (error) {
        console.error("Error parsing bulkProducts:", error);
        return res.status(400).send({ error: "Invalid bulkProducts data" });
      }
    }

    // Ensure parsedBulkProducts is an array
    if (!Array.isArray(parsedBulkProducts)) {
      return res.status(400).send({ error: "bulkProducts must be an array" });
    }

    // Map bulkProducts to ensure data is in correct format
    const formattedBulkProducts = parsedBulkProducts.map((item) => ({
      minimum: parseInt(item.minimum),
      maximum: parseInt(item.maximum),
      discount_mrp: parseFloat(item.discount_mrp),
      selling_price_set: parseFloat(item.selling_price_set),
    }));

    // Check if SKU already exists
    // const skuExists = await productModel.checkSKU(skuCode);
    // if (skuExists) {
    //   return res.status(400).send({ error: "SKU already exists" });
    // }

    // Create a new product instance
    const newProduct = new productModel({
      name,
      slug: slugify(name),
      description,
      price: parseFloat(price),
      category: mongoose.Types.ObjectId(category),
      subcategory: mongoose.Types.ObjectId(subcategory),
      brand: mongoose.Types.ObjectId(brand),
      quantity: parseInt(quantity),
      stock: parseInt(stock) || 0,
      shipping: shipping === "1",
      hsn,
      unit,
      unitSet: parseInt(unitSet),
      additionalUnit,
      gst: parseFloat(gst),
      gstType,
      purchaseRate: parseFloat(purchaseRate),
      mrp: parseFloat(mrp),
      perPiecePrice: parseFloat(perPiecePrice),
      // totalsetPrice: parseFloat(totalsetPrice),
      weight: parseFloat(weight),
      bulkProducts: formattedBulkProducts,
      allowCOD: allowCOD === "1",
      returnProduct: returnProduct === "1",
      userId,
      // skuCode,
      isActive: '1', // Default to active
      variants: JSON.parse(variants || '[]'),
      sets: JSON.parse(sets || '[]'),
    });

    // Handle photo upload if provided
    if (photo) {
      newProduct.photo.data = fs.readFileSync(photo.path);
      newProduct.photo.contentType = photo.type;
    }

    console.log("Fields:", req.fields);
    console.log("Files:", req.files);

    // Save the product to the database
    await newProduct.save();

    // Respond with success message and product data
    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).send({
      success: false,
      error: error.message || "Internal Server Error",
      message: "Error in creating product",
    });
  }
};

//get all products
export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      counTotal: products.length,
      message: "ALlProducts ",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr in getting products",
      error: error.message,
    });
  }
};
// get single product
export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category").populate("brand");
    res.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Eror while getitng single product",
      error,
    });
  }
};

// get photo
export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr while getting photo",
      error,
    });
  }
};

//delete controller
export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");
    res.status(200).send({
      success: true,
      message: "Product Deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting product",
      error,
    });
  }
};

//upate producta
export const updateProductController = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      quantity,
      shipping,
      hsn,
      unit,
      unitSet,
      additionalUnit,
      stock,
      minimumqty,
      gst,
      purchaseRate,
      mrp,
      perPiecePrice,
      setPrice,
      weight,
      bulkProducts,
    } = req.fields;

    const { photo } = req.files;

    // Validation
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is Required" });
      case !description:
        return res.status(500).send({ error: "Description is Required" });
      case !price:
        return res.status(500).send({ error: "Price is Required" });
      case !category:
        return res.status(500).send({ error: "Category is Required" });
      case !quantity:
        return res.status(500).send({ error: "Quantity is Required" });
      case photo && photo.size > 1000000:
        return res
          .status(500)
          .send({ error: "Photo is Required and should be less than 1mb" });
    }

    // Convert numeric fields to numbers
    const updatedFields = {
      ...req.fields,
      price: Number(price),
      quantity: Number(quantity),
      stock: Number(stock),
      minimumqty: Number(minimumqty),
      gst: Number(gst),
      purchaseRate: Number(purchaseRate),
      mrp: Number(mrp),
      perPiecePrice: Number(perPiecePrice),
      setPrice: Number(setPrice),
      weight: Number(weight),
      bulkProducts: Number(bulkProducts),
      slug: slugify(name)
    };

    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      updatedFields,
      { new: true }
    );

    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }

    await products.save();
    res.status(201).send({
      success: true,
      message: "Product Updated Successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Updating Product",
    });
  }
};

// filters
export const productFiltersController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error WHile Filtering Products",
      error,
    });
  }
};

// product count
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Error in product count",
      error,
      success: false,
    });
  }
};

// product list base on page
export const productListController = async (req, res) => {
  try {
    const perPage = 10;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error in per page ctrl",
      error,
    });
  }
};

// search product
export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const resutls = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");
    res.json(resutls);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error In Search Product API",
      error,
    });
  }
};

// similar products
export const realtedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(3)
      .populate("category");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error while geting related product",
      error,
    });
  }
};

// get prdocyst by catgory
export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }
    const products = await productModel.find({ category: category._id }).populate("category");
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error: error.message,
      message: "Error while getting products",
    });
  }
};

export const productSubcategoryController = async (req, res) => {
  try {
    const { subcategoryId } = req.params;

    // Validate that subcategoryId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(subcategoryId)) {
      return res.status(400).send({
        success: false,
        message: "Invalid subcategory ID",
      });
    }

    const subcategory = await subcategoryModel.findById(subcategoryId);

    if (!subcategory) {
      return res.status(404).send({
        success: false,
        message: "Subcategory not found",
      });
    }

    const products = await productModel.find({ subcategory: subcategoryId });

    res.status(200).send({
      success: true,
      message: "Products fetched successfully",
      subcategory,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error: error.message,
      message: "Error while getting products",
    });
  }
};

export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

// //payment
export const brainTreePaymentController = async (req, res) => {
  try {
    const { nonce, cart } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

export const processPaymentController = async (req, res) => {
  try {
    const { cart, paymentMethod } = req.body;
    
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });

    let order;

    if (paymentMethod === "COD") {
      // Generate a unique transaction ID for COD

      try {
        // Create order in database
        // You might want to generate a unique order ID here
        // Example:
        // const newOrder = new Order({ 
        //   user: req.user._id,
        //   products: cart,
        //   paymentMethod: "COD",
        //   status: "Pending"
        // });
        // await newOrder.save();
        const transactionId = `COD-${uuidv4()}`;

        order = new orderModel({
          products: cart,
          payment: {
            paymentMethod: "COD",
            transactionId: transactionId,
            status: "Pending",
          },
          buyer: req.user._id,
        });
  
        await order.save();
        // res.json({ success: true, order });
        res.json({ success: true, message: "COD order placed successfully" });
      } catch (error) {
        console.error("Error processing COD order:", error);
        res.status(500).json({ success: false, message: "Error processing COD order", error: error.message });
      }
      
   
    } else if (paymentMethod === "Braintree") {
      // Existing Braintree payment logic
      const { nonce } = req.body;
      let result = await gateway.transaction.sale({
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      });

      if (result.success) {
        order = new orderModel({
          products: cart,
          payment: {
            paymentMethod: "Braintree",
            transactionId: result.transaction.id,
            status: "Completed",
          },
          buyer: req.user._id,
        });

        await order.save();
        res.json({ success: true, order });
      } else {
        res.status(500).send(result.message);
      }
    } else {
      res.status(400).json({ success: false, message: "Invalid payment method" });
    }
  } catch (error) {
    console.error("Unexpected error in payment processing:", error);
    res.status(500).json({ 
      success: false, 
      message: "Unexpected error in payment processing", 
      error: error.message 
    });
  }
};

export const getProductPhoto = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting photo",
      error,
    });
  }
};
