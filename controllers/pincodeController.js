import multer from 'multer';
import xlsx from 'xlsx';
import pincodeModel from "../models/pincodeModel.js";

const upload = multer({ dest: 'uploads/' });

export const bulkUploadPincodesController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ success: false, message: "No file uploaded" });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheet_name_list = workbook.SheetNames;
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

    const results = {
      success: [],
      failed: []
    };

    for (let item of data) {
      try {
        const existingPincode = await pincodeModel.findOne({ code: item.code });
        if (existingPincode) {
          results.failed.push({ code: item.code, reason: "Pincode already exists" });
          continue;
        }

        const newPincode = new pincodeModel({
          code: item.code,
          isAvailable: item.isAvailable === 'true' || item.isAvailable === true
        });

        await newPincode.save();
        results.success.push(item.code);
      } catch (error) {
        results.failed.push({ code: item.code, reason: error.message });
      }
    }

    res.status(200).send({
      success: true,
      message: "Bulk upload completed",
      results
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error: error.message,
      message: "Error in bulk uploading Pincodes",
    });
  }
};
// Create pincode
export const createPincodeController = async (req, res) => {
  try {
    const { code, isAvailable } = req.body;
    
    if (!code) {
      return res.status(400).send({ message: "Pincode is required" });
    }
    
    const existingPincode = await pincodeModel.findOne({ code });
    if (existingPincode) {
      return res.status(200).send({
        success: false,
        message: "Pincode Already Exists",
      });
    }
    
    const pincodeData = {
      code,
      isAvailable: isAvailable !== undefined ? isAvailable : true
    };
    
    const pincode = await new pincodeModel(pincodeData).save();
    
    res.status(201).send({
      success: true,
      message: "New pincode created",
      pincode,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error: error.message,
      message: "Error in creating Pincode",
    });
  }
};

// Update pincode
export const updatePincodeController = async (req, res) => {
  try {
    const { code, isAvailable } = req.body;
    const { id } = req.params;
    const pincode = await pincodeModel.findByIdAndUpdate(
      id,
      { code, isAvailable },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Pincode Updated Successfully",
      pincode,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while updating pincode",
    });
  }
};

// Get all pincodes
export const getAllPincodesController = async (req, res) => {
  try {
    const pincodes = await pincodeModel.find({});
    res.status(200).send({
      success: true,
      message: "All Pincodes List",
      pincodes,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while getting all pincodes",
    });
  }
};

// Get single pincode
export const getSinglePincodeController = async (req, res) => {
  try {
    const pincode = await pincodeModel.findById(req.params.id);
    if (!pincode) {
      return res.status(404).send({
        success: false,
        message: "Pincode not found",
      });
    }
    res.status(200).send({
      success: true,
      message: "Pincode retrieved successfully",
      pincode,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while getting single pincode",
    });
  }
};

// Delete pincode
export const deletePincodeController = async (req, res) => {
  try {
    const { id } = req.params;
    await pincodeModel.findByIdAndDelete(id);
    res.status(200).send({
      success: true,
      message: "Pincode Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting pincode",
      error,
    });
  }
};
// Backend API route for fetching paginated pincodes
// router.get('/search-pincodes', async (req, res) => {
//     const { keyword = '', page = 1, limit = 10 } = req.query;
  
//     try {
//       const query = keyword ? { code: { $regex: keyword, $options: 'i' } } : {};
//       const total = await Pincode.countDocuments(query);
//       const results = await Pincode.find(query)
//         .skip((page - 1) * limit)
//         .limit(Number(limit));
  
//       res.json({ success: true, results, total, page: Number(page), limit: Number(limit) });
//     } catch (error) {
//       res.status(500).json({ success: false, message: 'Error fetching pincodes' });
//     }
//   });



export const getBrandProducts = async (req, res) => {
  try {
    const { brandId } = req.params;
    const brand = await brandModel.findById(brandId);
    
    if (!brand) {
      return res.status(404).send({
        success: false,
        message: "Brand not found",
      });
    }

    const products = await productModel.find({ brand: brandId }).populate("brand");

    res.status(200).send({
      success: true,
      brand,
      products,
      count: products.length,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while getting brand products",
    });
  }
};