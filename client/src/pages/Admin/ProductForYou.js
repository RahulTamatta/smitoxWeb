import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Select, Spin } from 'antd';

const { Option } = Select;

const ProductForYou = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get("/api/v1/category/get-category");
        if (data?.success) {
          setCategories(data?.category);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (selectedCategory) {
        setLoading(true);
        try {
          const { data } = await axios.get(`/api/v1/product/subcategories/${selectedCategory}`);
          if (data.success) {
            setSubcategories(data.subcategories || []);
          }
        } catch (error) {
          console.error('Error fetching subcategories:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchSubcategories();
  }, [selectedCategory]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/v1/product/products/${selectedCategory}/${selectedSubcategory}`);
        if (data.success) {
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, selectedSubcategory]);

  return (
    <div className="container">
      <h2>Select Category and Subcategory</h2>
      {loading ? (
        <Spin size="large" />
      ) : (
        <>
          <div className="mb-3">
            <label htmlFor="categorySelect" className="form-label">
              Category
            </label>
            <Select
              id="categorySelect"
              placeholder="Select a category"
              size="large"
              showSearch
              className="form-select mb-3"
              onChange={(value) => {
                setSelectedCategory(value);
                setSelectedSubcategory('all');
              }}
              value={selectedCategory}
            >
              <Option value="">Select a category</Option>
              {categories.map((cat) => (
                <Option key={cat._id} value={cat._id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </div>

          <div className="mb-3">
            <label htmlFor="subcategorySelect" className="form-label">
              Subcategory
            </label>
            <Select
              id="subcategorySelect"
              placeholder="Select a subcategory"
              size="large"
              showSearch
              className="form-select mb-3"
              onChange={(value) => setSelectedSubcategory(value)}
              value={selectedSubcategory}
              disabled={!selectedCategory}
            >
              <Option value="all">All</Option>
              {subcategories.map((sub) => (
                <Option key={sub._id} value={sub._id}>
                  {sub.name}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <h3>Products</h3>
            {products.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id}>
                      <td>{p.name}</td>
                      <td>{p.description}</td>
                      <td>{p.price.toLocaleString("en-US", { style: "currency", currency: "INR" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No products found.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductForYou;
