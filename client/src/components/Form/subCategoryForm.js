import React from "react";

const SubcategoryForm = ({ handleSubmit, name, setName, parentCategory, setParentCategory, setImage, categories }) => {
  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Enter new subcategory"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <select
          className="form-control"
          value={parentCategory}
          onChange={(e) => setParentCategory(e.target.value)}
        >
          <option value="">Select Parent Category</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label htmlFor="subcategoryImage" className="form-label">Subcategory Image</label>
        <input
          type="file"
          className="form-control"
          id="subcategoryImage"
          onChange={(e) => setImage(e.target.files[0])}
        />
      </div>

      <button type="submit" className="btn btn-primary">
        Submit
      </button>
    </form>
  );
};

export default SubcategoryForm;