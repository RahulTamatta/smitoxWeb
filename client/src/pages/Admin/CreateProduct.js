import React, { useState, useEffect } from "react";
import Layout from "./../../components/Layout/Layout";
import AdminMenu from "./../../components/Layout/AdminMenu";
import toast from "react-hot-toast";
import axios from "axios";
import { Select } from "antd";
import { useNavigate } from "react-router-dom";
const { Option } = Select;

const CreateProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [shipping, setShipping] = useState(false); // Changed to boolean for shipping
  const [hsn, setHsn] = useState("");
  const [photo, setPhoto] = useState(null);
  const [bulkProducts, setBulkProducts] = useState([
    { minimum: "", maximum: "", discount_mrp: "", selling_price_set: "" },
  ]);
  const [unit, setUnit] = useState("");
  const [unitSet, setUnitSet] = useState("");

  const [minimumqty, setMinimumqty] = useState("");

  

  const [purchaseRate, setPurchaseRate] = useState("");
  const [mrp, setMrp] = useState("");
  const [perPiecePrice, setPerPiecePrice] = useState("");
  // const [totalSetPrice, setTotalPrices] = useState("");
  const [weight, setWeight] = useState("");
  const [minimumQuantity, setMinimumQuantity] = useState("");
  const [stock, setStock] = useState("");
  const [gst, setGst] = useState("");
  const [additionalUnit, setAdditionalUnit] = useState("Unit A"); // Default value for additionalUnit dropdown

  // Function to handle changes in input fields for bulk products
  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const list = [...bulkProducts];
    list[index][name] = value;

    // If the changed field is 'maximum', update the next row's 'minimum'
    if (name === "maximum" && index < list.length - 1) {
      list[index + 1].minimum = (parseInt(value) + 1).toString();
    }

    // If the changed field is 'discount_mrp', update the 'selling_price_set'
    if (name === "discount_mrp") {
      const discountPercentage = parseFloat(value) / 100;
      const setPrice = parseFloat(price);
      const netWeightValue = parseFloat(unitSet);
      const discountedPrice = setPrice * (1 - discountPercentage);
      list[index].selling_price_set = (
        discountedPrice * netWeightValue
      ).toFixed(2);
    }

    setBulkProducts(list);
  };

  // Function to add a new row for bulk products
  const handleAddRow = () => {
    const lastRow = bulkProducts[bulkProducts.length - 1];
    const newMinimum =
      lastRow && lastRow.maximum
        ? (parseInt(lastRow.maximum) + 1).toString()
        : "";

    setBulkProducts([
      ...bulkProducts,
      {
        minimum: newMinimum,
        maximum: "",
        discount_mrp: "",
        selling_price_set: "",
      },
    ]);
  };

  // Function to remove a row for bulk products
  const handleRemoveRow = (index) => {
    const list = [...bulkProducts];
    list.splice(index, 1);
    setBulkProducts(list);
  };

  // Get all categories from backend
  const getAllCategories = async () => {
    try {
      const { data } = await axios.get("/api/v1/category/get-category");
      if (data?.success) {
        setCategories(data?.category);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Something went wrong in getting categories");
    }
  };

  useEffect(() => {
    getAllCategories();
  }, []);

  // Handle form submission to create product
  // Handle form submission to create product
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const productData = new FormData();
      productData.append("name", name);
      productData.append("description", description);
      productData.append("price", price);
      productData.append("quantity", quantity);
      productData.append("photo", photo);
      productData.append("category", category);
      productData.append("hsn", hsn);
      productData.append("shipping", shipping ? "1" : "0");

      // Append bulk products data
      // Append bulk products data
      productData.append("bulkProducts", JSON.stringify(bulkProducts));

      // Append additional fields
      productData.append("unit", unit);
      productData.append("unitSet", unitSet);
      productData.append("purchaseRate", purchaseRate);
      productData.append("mrp", mrp);
      productData.append("perPiecePrice", perPiecePrice);
      // productData.append("totalSetPrice", setTotalPrices);
      productData.append("weight", weight);
      productData.append("minimumQuantity", minimumQuantity);
      productData.append("stock", stock);
      productData.append("gst", gst);
      productData.append("additionalUnit", additionalUnit);

      // Log FormData entries
      for (let pair of productData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      const { data } = await axios.post(
        "/api/v1/product/create-product",
        productData
      );
      console.log("Response Data:", data);

      if (data.success) {
        toast.success("Product Created Successfully");
        navigate("/dashboard/admin/products");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Something went wrong while creating product");
    }
  };

  return (
    <Layout title={"Dashboard - Create Product"}>
      <div className="container-fluid m-3 p-3 dashboard">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <h1>Create Product</h1>
            <div className="m-1 w-75">
              {/* Category dropdown */}
              <div className="mb-3">
                <label htmlFor="categorySelect" className="form-label">
                  Category
                </label>
                <Select
                  id="categorySelect"
                  bordered={false}
                  placeholder="Select a category"
                  size="large"
                  showSearch
                  className="form-select mb-3"
                  onChange={(value) => {
                    setCategory(value);
                  }}
                >
                  {categories?.map((c) => (
                    <Option key={c._id} value={c._id}>
                      {c.name}
                    </Option>
                  ))}
                </Select>
              </div>
              <div className="mb-3">
                <label htmlFor="photoUpload" className="form-label">
                  Product Photo
                </label>
                <label
                  className="btn btn-outline-secondary col-md-12"
                  htmlFor="photoUpload"
                >
                  {photo ? photo.name : "Upload Photo"}
                  <input
                    id="photoUpload"
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={(e) => setPhoto(e.target.files[0])}
                    hidden
                  />
                </label>
                {photo && (
                  <div className="text-center mt-2">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt="product_photo"
                      height={"200px"}
                      className="img img-responsive"
                    />
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="productName" className="form-label">
                  Product Name
                </label>
                <input
                  id="productName"
                  type="text"
                  value={name}
                  placeholder="Enter product name"
                  className="form-control"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="hsnCodeInput" className="form-label">
                  HSN Code
                </label>
                <input
                  id="hsnCodeInput"
                  type="text"
                  value={hsn}
                  placeholder="Enter HSN code"
                  className="form-control"
                  onChange={(e) => setHsn(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="productDescription" className="form-label">
                  Product Description
                </label>
                <textarea
                  id="productDescription"
                  type="text"
                  value={description}
                  placeholder="Enter product description"
                  className="form-control"
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Select
                bordered={false}
                placeholder="Select Shipping"
                size="large"
                showSearch
                className="form-select mb-3"
                onChange={(value) => {
                  setShipping(value === "1"); // Convert "1" to true, "0" to false
                }}
              >
                <Option value="0">No</Option>
                <Option value="1">Yes</Option>
              </Select>
              {/* Additional fields in one row */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <label htmlFor="unit" className="form-label">
                    Unit
                  </label>
                  <select
                    id="unit"
                    name="unit"
                    value={unit}
                    className="form-control"
                    onChange={(e) => setUnit(e.target.value)}
                  >
                    <option value="Chart">Chart</option>
                    <option value="Dozens">Dozens</option>
                    <option value="Kg">Kg</option>
                    <option value="Litre">Litre</option>
                    <option value="Meter">Meter</option>
                    <option value="Metric Tons">Metric Tons</option>
                    <option value="Nos.">Nos.</option>
                    <option value="Packet">Packet</option>
                    <option value="Pairs">Pairs</option>
                    <option value="Piece">Piece</option>
                    <option value="Pieces">Pieces</option>
                    <option value="Pounds">Pounds</option>
                    <option value="Quintal">Quintal</option>
                    <option value="Sets">Sets</option>
                    <option value="Tons">Tons</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label htmlFor="unitSet" className="form-label">
                    Net weight
                  </label>
                  <input
                    id="unitSet"
                    type="text"
                    value={unitSet}
                    name="unitSet"
                    placeholder="Enter Net Weight"
                    className="form-control"
                    onChange={(e) => setUnitSet(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="additionalUnit" className="form-label">
                    Additional Unit
                  </label>
                  <select
                    id="additionalUnit"
                    name="additionalUnit"
                    value={additionalUnit}
                    className="form-control"
                    onChange={(e) => setAdditionalUnit(e.target.value)}
                  >
                    <option value="Unit A">Unit A</option>
                    <option value="Unit B">Unit B</option>
                    <option value="Unit C">Unit C</option>
                    {/* Add more options as needed */}
                  </select>
                </div>
                <div className="col-md-4">
                  <label htmlFor="purchaseRate" className="form-label">
                    Purchase Rate
                  </label>
                  <input
                    id="purchaseRate"
                    type="text"
                    value={purchaseRate}
                    name="purchaseRate"
                    placeholder="Enter price set"
                    className="form-control"
                    onChange={(e) => setPurchaseRate(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="purchaserate" className="form-label">
                    MRP
                  </label>
                  <input
                    id="mrp"
                    type="text"
                    value={mrp}
                    name="mrp"
                    placeholder="Enter price set"
                    className="form-control"
                    onChange={(e) => setMrp(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="purchaserate" className="form-label">
                    PER PIECE PRICE
                  </label>
                  <input
                    id="perPiecePrice"
                    type="text"
                    value={perPiecePrice}
                    name="perPiecePrice"
                    placeholder="Enter price set"
                    className="form-control"
                    onChange={(e) => setPerPiecePrice(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="purchaserate" className="form-label">
                    SET PRICE
                  </label>
                  <input
                    id="price"
                    type="text"
                    value={price}
                    name="price"
                    placeholder="Enter price set"
                    className="form-control"
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="purchaserate" className="form-label">
                    WEIGHT
                  </label>
                  <input
                    id="weight"
                    type="text"
                    value={weight}
                    name="weight"
                    placeholder="Enter price set"
                    className="form-control"
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="purchaserate" className="form-label">
                    MINIMUM QUANTITY
                  </label>
                  <input
                    id="quantity"
                    type="text"
                    value={quantity}
                    name="quantity"
                    placeholder="Enter price set"
                    className="form-control"
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="stock" className="form-label">
                    STOCK
                  </label>
                  <input
                    id="stock"
                    type="text"
                    value={stock}
                    name="stock"
                    placeholder="Enter price set"
                    className="form-control"
                    onChange={(e) => setStock(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="purchaserate" className="form-label">
                    GST
                  </label>
                  <input
                    id="gst"
                    type="text"
                    value={gst}
                    name="GST"
                    placeholder="Enter price set"
                    onChange={(e) => setGst(e.target.value)}
                  />
                </div>
              </div>
              {/* Bulk products */}
           
              <div className="mb-3">
                <label>Bulk Products</label>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Minimum Quantity</th>
                      <th>Maximum Quantity</th>
                      <th>Discount MRP (%)</th>
                      <th>Selling Price Set</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkProducts.map((product, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            name="minimum"
                            value={product.minimum}
                            onChange={(e) => handleChange(index, e)}
                            readOnly={index > 0}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            name="maximum"
                            value={product.maximum}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            name="discount_mrp"
                            value={product.discount_mrp}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            name="selling_price_set"
                            value={product.selling_price_set}
                            onChange={(e) => handleChange(index, e)}
                            readOnly
                          />
                        </td>
                        <td>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleRemoveRow(index)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button className="btn btn-primary" onClick={handleAddRow}>
                  Add Bulk Product
                </button>
              </div>
              <div className="mb-3">
                <button className="btn btn-primary" onClick={handleCreate}>
                  Create Product
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateProduct;
