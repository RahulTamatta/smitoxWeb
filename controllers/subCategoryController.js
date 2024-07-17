import subcategoryModel from "../models/subcategoryModel.js";
import slugify from "slugify";

// Create Subcategory
export const createSubcategoryController = async (req, res) => {
  try {
    const { name, photo, parentCategoryId } = req.body;
    console.log("request body", req.body);

    if (!name) {
      return res.status(401).send({ message: "Name is required" });
    }

    const existingCategory = await subcategoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(200).send({
        success: false,
        message: "Category Already Exists",
      });
    }

    // Create a new category object with the name, slug, and photo
    const subcategoryData = {
      name,
      slug: slugify(name),
      parentCategoryId,
      photo: photo && typeof photo === 'object' ? JSON.stringify(photo) : photo // Convert object to string if necessary
    };

    const subcategory = await new subcategoryModel(subcategoryData).save();

    res.status(201).send({
      success: true,
      message: "New category created",
      subcategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error: error.message,
      message: "Error in subCategory",
    });
  }
};



// export const createSubcategoryController = async (req, res) => {
//   try {
//     const { name, parentCategoryId, photo } = req.body;
//     console.log("request body", req.body);

//     if (!name) {
//       return res.status(401).send({ message: "Name is required" });
//     }
//     if (!parentCategoryId) {
//       return res.status(401).send({ message: "Category is required" });
//     }

//     const existingSubcategory = await subcategoryModel.findOne({ name, parentCategoryId });
//     if (existingSubcategory) {
//       return res.status(200).send({
//         success: false,
//         message: "Subcategory Already Exists",
//       });
//     }

//     // Create a new subcategory object with name, slug, and category
//     const subcategoryData = {
//       name,
//       slug: slugify(name),
//       parentCategoryId
//     };

//     // Only add photo if it's a non-empty string
//     if (photo && typeof photo === 'string' && photo.trim() !== '') {
//       subcategoryData.photo = photo;
//     }

//     const subcategory = await new subcategoryModel(subcategoryData).save();

//     res.status(201).send({
//       success: true,
//       message: "New Subcategory Created",
//       subcategory,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       success: false,
//       error: error.message,
//       message: "Error in Subcategory Creation",
//     });
//   }
// };
// Get Single Subcategory
export const getSingleSubcategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const subcategory = await subcategoryModel.findById(id);
    if (!subcategory) {
      return res.status(404).send({
        success: false,
        message: "Subcategory not found",
      });
    }
    res.status(200).send({
      success: true,
      message: "Subcategory retrieved successfully",
      subcategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while retrieving subcategory",
    });
  }
};

// Other controllers remain unchanged...

export const updateSubcategoryController = async (req, res) => {
  try {
    const { name, category } = req.body;
    const { id } = req.params;
    if (!name) {
      return res.status(401).send({ message: "Name is required" });
    }
    if (!category) {
      return res.status(401).send({ message: "Category is required" });
    }
    const subcategory = await subcategoryModel.findByIdAndUpdate(
      id,
      { name, slug: slugify(name), category },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Subcategory Updated Successfully",
      subcategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while updating subcategory",
    });
  }
};

export const deleteSubcategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    await subcategoryModel.findByIdAndDelete(id);
    res.status(200).send({
      success: true,
      message: "Subcategory Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting subcategory",
      error,
    });
  }
};

export const getAllSubcategoriesController = async (req, res) => {
  try {
    const subcategories = await subcategoryModel.find({});
    res.status(200).send({
      success: true,
      message: "All Subcategories List",
      subcategories,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while getting all subcategories",
    });
  }
};
