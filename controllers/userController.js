import userModel from "../models/userModel.js";

export const getUsers = async (req, res) => {
  try {
    const users = await userModel.find();
    res.json({ status: 'success', list: users });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await userModel.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ status: 'success', user: updatedUser });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedUser = await userModel.findByIdAndUpdate(id, { status }, { new: true });
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
    const updatedUser = await userModel.findByIdAndUpdate(id, { order_type }, { new: true });
    res.json({ status: 'success', user: updatedUser });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};