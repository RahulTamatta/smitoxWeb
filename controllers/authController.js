import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";

import { comparePassword, hashPassword } from "./../helpers/authHelper.js";
import JWT from "jsonwebtoken";

export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, pincode, answer } = req.body;
    //validations
    if (!name) {
      return res.send({ error: "Name is Required" });
    }
    if (!email) {
      return res.send({ message: "Email is Required" });
    }
    if (!password) {
      return res.send({ message: "Password is Required" });
    }
    if (!phone) {
      return res.send({ message: "Phone no is Required" });
    }
    if (!address) {
      return res.send({ message: "Address is Required" });
    }
    if (!pincode) {
      return res.send({ message: "PIN Code is Required" });
    }
    if (!answer) {
      return res.send({ message: "Answer is Required" });
    }
    //check user
    const existingUser = await userModel.findOne({ email });
    //existing user
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "Already Registered, please login",
      });
    }
    //register user
    const hashedPassword = await hashPassword(password);
    //save
    const user = await new userModel({
      name,
      email,
      phone,
      address,
      pincode,
      password: hashedPassword,
      answer,
    }).save();

    res.status(201).send({
      success: true,
      message: "User Registered Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Registration",
      error,
    });
  }
};
//POST LOGIN
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid email or password",
      });
    }
    //check user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email is not registerd",
      });
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid Password",
      });
    }
    //token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).send({
      success: true,
      message: "login successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        pincode:user.pincode,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};

//forgotPasswordController

export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    if (!email) {
      res.status(400).send({ message: "Emai is required" });
    }
    if (!answer) {
      res.status(400).send({ message: "answer is required" });
    }
    if (!newPassword) {
      res.status(400).send({ message: "New Password is required" });
    }
    //check
    const user = await userModel.findOne({ email, answer });
    //validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Wrong Email Or Answer",
      });
    }
    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: "Password Reset Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

//test controller
export const testController = (req, res) => {
  try {
    res.send("Protected Routes");
  } catch (error) {
    console.log(error);
    res.send({ error });
  }
};

//update prfole
export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;
    const user = await userModel.findById(req.user._id);
    //password
    if (password && password.length < 6) {
      return res.json({ error: "Passsword is required and 6 character long" });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Profile Updated SUccessfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error WHile Update profile",
      error,
    });
  }
};

//orders
export const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error WHile Geting Orders",
      error,
    });
  }
};

export const getAllOrdersController = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    
    if (status && status !== 'all-orders') {
      query.status = status;
    }

    const orders = await orderModel
      .find(query)
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: "-1" });

    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Getting Orders",
      error,
    });
  }
};

export const addProductToOrderController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { productId, quantity, price } = req.body;

    console.log(`Received request to add product to order. orderModel ID: ${orderId}, Product ID: ${productId}, Quantity: ${quantity}, Price: ${price}`);

    // Find the order by ID
    const order = await orderModel.findById(orderId);

    if (!order) {
      console.log(`orderModel with ID ${orderId} not found.`);
      return res.status(404).send({
        success: false,
        message: "orderModel not found",
      });
    }

    // Find the product by ID
    const product = await productModel.findById(productId);

    if (!product) {
      console.log(`Product with ID ${productId} not found.`);
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    console.log(`Found order: ${JSON.stringify(order)}`);
    console.log(`Found product: ${JSON.stringify(product)}`);

    // Add the new product to the order
    const newProduct = {
      _id: productId,
      quantity: quantity || 1,
      price: price || product.price, // Use the price from the request or the product's price
    };

    console.log(`Adding product to order: ${JSON.stringify(newProduct)}`);
    order.products.push(newProduct);

    // Save the updated order
    await order.save();

    console.log(`orderModel updated successfully: ${JSON.stringify(order)}`);

    res.status(200).send({
      success: true,
      message: "Product added to order successfully",
      order,
    });
  } catch (error) {
    console.error('Error while adding product to order:', error);
    res.status(500).send({
      success: false,
      message: "Error while adding product to order",
      error,
    });
  }
};

//order status'
export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    // console.log("Oder and status",{orderId,status});
    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Updateing orderModel",
      error,
    });
  }
};

// In your orderController.js file
export const addTrackingInfo = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { company, id } = req.body;

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { tracking: { company, id } },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).send({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Tracking information added successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error adding tracking information",
      error,
    });
  }
};

export const updateOrderController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryCharges, codCharges, discount, amount, products } = req.body;

    console.log("Received orderId:", orderId);
    console.log("Received body:", { deliveryCharges, codCharges, discount, amount, products });

    const order = await orderModel.findById(orderId);

    if (!order) {
      console.log("Order not found for orderId:", orderId);
      return res.status(404).send({
        success: false,
        message: "Order not found",
      });
    }

    // Update products
    order.products = products;

    // Calculate total product amount
    const totalProductAmount = products.reduce((total, product) => {
      return total + (Number(product.price) * Number(product.quantity));
    }, 0);

    console.log("Total product amount:", totalProductAmount);

    // Update order fields
    order.deliveryCharges = Number(deliveryCharges) || 0;
    order.codCharges = Number(codCharges) || 0;
    order.discount = Number(discount) || 0;
    order.amount = Number(amount) || 0;
    order.status = status || order.status;

    console.log("Updated deliveryCharges:", order.deliveryCharges);
    console.log("Updated codCharges:", order.codCharges);
    console.log("Updated discount:", order.discount);
    console.log("Updated amount:", order.amount);
    console.log("Updated status:", order.status);

    // Calculate new total amount
    const newTotalAmount = totalProductAmount + order.deliveryCharges + order.codCharges - order.discount;

    console.log("New total amount:", newTotalAmount);

    // Calculate amount pending
    order.amountPending = newTotalAmount - order.amount;

    console.log("Amount pending:", order.amountPending);

    // Save the updated order
    await order.save();

    console.log("Updated order saved:", order);

    res.status(200).send({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.log("Error in updating order:", error);
    res.status(500).send({
      success: false,
      message: "Error in updating order",
      error,
    });
  }
};

export const deleteProductFromOrderController = async (req, res) => {
  try {
    const { orderId, productId } = req.params;

    // Log incoming request
    console.log(`Attempting to delete product from order. Order ID: ${orderId}, Product ID: ${productId}`);

    // Find the order by ID
    const order = await orderModel.findById(orderId);

    if (!order) {
      console.log(`Order not found. ID: ${orderId}`);
      return res.status(404).send({
        success: false,
        message: "Order not found",
      });
    }

    // Check if the product exists in the order
    const productIndex = order.products.findIndex(
      (product) => product._id.toString() === productId
    );

    if (productIndex === -1) {
      console.log(`Product not found in order. Product ID: ${productId}`);
      return res.status(404).send({
        success: false,
        message: "Product not found in the order",
      });
    }

    // Remove the product from the order
    const removedProduct = order.products[productIndex];
    order.products.splice(productIndex, 1);

    // Save the updated order
    await order.save();

    console.log(`Product removed successfully. Product ID: ${productId} from Order ID: ${orderId}`);

    return res.status(200).send({
      success: true,
      message: "Product removed from order successfully",
      removedProduct, // Send back the removed product details
      order, // Updated order with the remaining products
    });
  } catch (error) {
    console.error(`Error deleting product from order. Order ID: ${orderId}, Product ID: ${productId}`, error);
    return res.status(500).send({
      success: false,
      message: "An error occurred while deleting the product from the order",
      error: error.message,
    });
  }
};

// router.get("/order/:orderId/invoice", requireSignIn, async (req, res) => {
//   try {
//     const order = await orderModel.findById(req.params.orderId).populate('buyer').populate('products');
//     if (!order) {
//       return res.status(404).send('Order not found');
//     }

//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);

//     generateInvoicePDF(order, res);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Error generating invoice');
//   }
// });
