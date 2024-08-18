import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import toast from "react-hot-toast";

const CategoryProduct = () => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState({});
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(location.state?.selectedSubcategory || null);
  const [loading, setLoading] = useState(true);
  const [fromBanner, setFromBanner] = useState(location.state?.fromBanner || false);

  useEffect(() => {
    if (params?.slug) {
      getCategoryAndSubcategories();
    }
  }, [params?.slug]);

  useEffect(() => {
    if (fromBanner && selectedSubcategory) {
      fetchProductsBySubcategory(selectedSubcategory);
    } else {
      fetchProductsByCategoryOrSubcategory(selectedSubcategory);
    }
  }, [fromBanner, selectedSubcategory]);

  const getCategoryAndSubcategories = async () => {
    try {
      const { data } = await axios.get(`/api/v1/product/product-category/${params.slug}`);
      setCategory(data?.category);
      await getSubcategories(data?.category._id);
    } catch (error) {
      console.log(error);
      toast.error("Error fetching category information");
    }
  };

  const getSubcategories = async (categoryId) => {
    try {
      const { data } = await axios.get("/api/v1/subcategory/get-subcategories");
      if (data?.success) {
        const filteredSubcategories = data.subcategories.filter((subcat) => {
          subcat.photo = subcat.photo || "/api/v1/placeholder/64/64"; // Default image if photo is missing
          return subcat.category === categoryId;
        });
        setSubcategories(filteredSubcategories);
      } else {
        setSubcategories([]);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error fetching subcategories");
      setSubcategories([]);
    }
  };

  const fetchProductsByCategoryOrSubcategory = async (subcategoryId) => {
    try {
      setLoading(true);
      let url = `/api/v1/product/product-category/${params.slug}`;
      if (subcategoryId) {
        url = `/api/v1/product/product-subcategory/${subcategoryId}`;
      }
      const { data } = await axios.get(url);
      setProducts(data?.products || []);
    } catch (error) {
      console.log(error);
      toast.error("Error fetching products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsBySubcategory = async (subcategoryId) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/product/product-subcategory/${subcategoryId}`);
      setProducts(data?.products || []);
    } catch (error) {
      console.log(error);
      toast.error("Error fetching products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterBySubcategory = (subcategoryId) => {
    setSelectedSubcategory(subcategoryId);
    fetchProductsByCategoryOrSubcategory(subcategoryId);
  };

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <Layout>
      <div className="container mt-3 category">
        <h4 className="text-center" style={{ marginBottom: '1rem' }}>
          Category - {category?.name}
        </h4>

        {/* Conditionally render subcategories slider if not from banner */}
        {!fromBanner && subcategories.length > 0 && (
          <div className="subcategory-slider mb-4">
            <Slider {...settings}>
              <div
                key="all"
                className={`subcategory-item ${!selectedSubcategory ? "active" : ""}`}
                onClick={() => {
                  setSelectedSubcategory(null);
                  fetchProductsByCategoryOrSubcategory(null);
                }}
                style={{ cursor: 'pointer', textAlign: 'center', margin: '0 10px' }}
              >
                <div
                  className="subcategory-circle"
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    margin: '0 auto',
                    border: 'none', // Remove border
                    padding: '0', // Remove padding
                  }}
                >
                  {/* <img
                    src="/api/v1/placeholder/64/64"
                    alt="All"
                    className="subcategory-image"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  /> */}
                </div>
                <h6 className="mt-2">All</h6>
              </div>
              {subcategories.map((s) => (
                <div
                  key={s._id}
                  className={`subcategory-item ${
                    selectedSubcategory === s._id ? "active" : ""
                  }`}
                  onClick={() => filterBySubcategory(s._id)}
                  style={{ cursor: 'pointer', textAlign: 'center', margin: '0 10px' }}
                >
                  <div
                    className="subcategory-circle"
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      margin: '0 auto',
                      border: 'none', // Remove border
                      padding: '0', // Remove padding
                    }}
                  >
                    <img
                      src={s.photo}  // Updated to use photo field
                      alt={s.name}
                      className="subcategory-image"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                  <h6 className="mt-2">{s.name}</h6>
                </div>
              ))}
            </Slider>
          </div>
        )}

        <h6 className="text-center" style={{ marginBottom: '1rem' }}>
          {products?.length} result{products?.length !== 1 ? 's' : ''}
        </h6>
        <div className="row">
          <div className="col-md-9 offset-1">
            {loading ? (
              <div className="text-center">Loading...</div>
            ) : products?.length > 0 ? (
              <div className="d-flex flex-wrap">
                {products.map((p) => (
                  <div className="card m-2" key={p._id} style={{ width: '18rem', border: 'none', boxShadow: 'none' }}>
                    <img
                      src={`/api/v1/product/product-photo/${p._id}`}
                      className="card-img-top"
                      alt={p.name}
                      style={{ objectFit: 'cover', height: '200px', border: 'none', padding: '0' }}
                    />
                    <div className="card-body">
                      <div className="card-name-price" style={{ marginBottom: '1rem' }}>
                        <h5 className="card-title">{p.name}</h5>
                        <h5 className="card-title card-price">
                          {p.price.toLocaleString("en-US", {
                            style: "currency",
                            currency: "INR",
                          })}
                        </h5>
                      </div>
                      <p className="card-text" style={{ marginBottom: '1rem' }}>
                        {p.description.substring(0, 60)}...
                      </p>
                      <div className="card-name-price">
                        <button
                          className="btn btn-info ms-1"
                          onClick={() => navigate(`/product/${p.slug}`)}
                        >
                          More Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center">No products found.</div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CategoryProduct;
