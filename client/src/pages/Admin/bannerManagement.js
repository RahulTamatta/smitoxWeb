import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Layout from "../../components/Layout/Layout";
import AdminMenu from "../../components/Layout/AdminMenu";

const BannerManagement = () => {
  const [bannerName, setBannerName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [image, setImage] = useState(null);

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adBannerName, setAdBannerName] = useState('');
  const [adBannerImage, setAdBannerImage] = useState(null);
  const [adBannerLink, setAdBannerLink] = useState('');
  const [adBannerPosition, setAdBannerPosition] = useState('');

  const handleAdBannerSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const formData = new FormData();
      formData.append('adBannerName', adBannerName);
      formData.append('adBannerLink', adBannerLink);
      formData.append('adBannerPosition', adBannerPosition);
      if (adBannerImage) {
        formData.append('adBannerImage', adBannerImage);
      }
  
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
  
      const response = await axios.post("/api/v1/adsbanner/create-adsbanner", formData, config);
  
      console.log("Ad Banner API Response:", response.data);
  
      if (response.data.success) {
        toast.success("Ad banner created successfully");
        // Reset form fields
        setAdBannerName('');
        setAdBannerImage(null);
        setAdBannerLink('');
        setAdBannerPosition('');
      } else {
        toast.error(response.data.message || "Failed to create ad banner");
      }
    } catch (error) {
      console.error("Error creating ad banner:", error.response?.data || error.message);
      toast.error("Failed to create ad banner: " + (error.response?.data?.message || error.message));
    }
  };

  useEffect(() => {
    console.log("Fetching categories...");
    getAllCategories();
  }, []);

  const getAllCategories = async () => {
    try {
      const { data } = await axios.get("/api/v1/category/get-category");
      console.log("Categories API Response:", data);

      if (data?.success) {
        setCategories(data.category);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
      setLoading(false);
    }
  };

  const getSubcategoriesForCategory = async (categoryId) => {
    try {

      console.log(`Fetching subcategories for categoryId: ${categoryId}`);
      const { data } = await axios.get(`/api/v1/subcategory/singleSubcategory/${categoryId}`);
      console.log("Subcategories API Response:", data);

      if (data?.success) {
        setSubcategories(data.subcategories || []);
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      toast.error("Failed to fetch subcategories");
    }
  };

  const handleCategoryChange = (e) => {
    const selectedCategoryId = e.target.value;
    setCategoryId(selectedCategoryId);
    setSubcategoryId('');
    console.log(`Category changed to: ${selectedCategoryId}`);
    getSubcategoriesForCategory(selectedCategoryId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Banner Form Data:", { bannerName, categoryId, subcategoryId, image });

    try {
      const formData = new FormData();
      formData.append('banner_name', bannerName);
      formData.append('category_id', categoryId);
      formData.append('subcategory_id', subcategoryId);
      if (image) {
        formData.append('image', image);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      const response = await axios.post("/api/v1/bannerManagement/create-banner", formData, config);

      console.log("Banner API Response:", response.data);

      if (response.data.success) {
        toast.success("Banner created successfully");
        // Reset form fields
        setBannerName('');
        setCategoryId('');
        setSubcategoryId('');
        setImage(null);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error creating banner:", error);
      toast.error("Failed to create banner: " + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <Layout title="Dashboard - Create Banner">
      <div className="container-fluid m-3 p-3">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <h2 className="text-center mb-4">Banner Management</h2>
            <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow-sm">
              <div className="mb-3">
                <label htmlFor="banner_name" className="form-label">Banner Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="banner_name"
                  value={bannerName}
                  onChange={(e) => setBannerName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="category_id" className="form-label">Category</label>
                <select
                  className="form-select"
                  id="category_id"
                  value={categoryId}
                  onChange={handleCategoryChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="subcategory_id" className="form-label">Subcategory</label>
                <select
                  className="form-select"
                  id="subcategory_id"
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                  required
                  disabled={!categoryId}
                >
                  <option value="">Select a subcategory</option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory._id} value={subcategory._id}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="image" className="form-label">Banner Image</label>
                <input
                  type="file"
                  className="form-control"
                  id="image"
                  onChange={(e) => setImage(e.target.files[0])}
                  accept="image/*"
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Create Banner
              </button>
            </form>

            <form onSubmit={handleAdBannerSubmit} className="p-4 bg-white rounded shadow-sm mt-4">
              <h3 className="mb-3">Create Ad Banner</h3>
              <div className="mb-3">
                <label htmlFor="ad_banner_name" className="form-label">Ad Banner Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="ad_banner_name"
                  value={adBannerName}
                  onChange={(e) => setAdBannerName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="ad_banner_image" className="form-label">Ad Banner Image</label>
                <input
                  type="file"
                  className="form-control"
                  id="ad_banner_image"
                  onChange={(e) => setAdBannerImage(e.target.files[0])}
                  accept="image/*"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="ad_banner_link" className="form-label">Ad Banner Link</label>
                <input
                  type="url"
                  className="form-control"
                  id="ad_banner_link"
                  value={adBannerLink}
                  onChange={(e) => setAdBannerLink(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="ad_banner_position" className="form-label">Ad Banner Position</label>
                <select
                  className="form-select"
                  id="ad_banner_position"
                  value={adBannerPosition}
                  onChange={(e) => setAdBannerPosition(e.target.value)}
                  required
                >
                  <option value="">Select a position</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="sidebar">Sidebar</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary">
                Create Ad Banner
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BannerManagement;