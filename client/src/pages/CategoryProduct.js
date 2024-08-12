import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/CategoryProductStyles.css";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import toast from "react-hot-toast";

const CategoryProduct = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState({});
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.slug) getProductsByCat();
  }, [params?.slug, selectedSubcategory]); // Add selectedSubcategory to the dependency array

  const getProductsByCat = async () => {
    try {
      const { data } = await axios.get(`/api/v1/product/product-category/${params.slug}`);
      setCategory(data?.category);
      getSubcategories(data?.category._id);
      fetchProductsBySubcategory(selectedSubcategory); // Fetch products based on the selected subcategory
    } catch (error) {
      console.log(error);
    }
  };

  const fetchProductsBySubcategory = async (subcategoryId) => {
    try {
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
    }
  };

  const getSubcategories = async (categoryId) => {
    try {
      const { data } = await axios.get("/api/v1/subcategory/get-subcategories");
      if (data?.success) {
        
        const filteredSubcategories = data.subcategories.filter((subcat) => {
          subcat.img = subcat.img || "/api/v1/placeholder/64/64"; // Set a placeholder image URL if s.img is not available
          return subcat.category === categoryId;
        });
        setSubcategories(filteredSubcategories);
      } else {
        setSubcategories([]);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong in getting subcategories");
      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  };

  const filterBySubcategory = async (subcategoryId) => {
    setSelectedSubcategory(subcategoryId);
    await fetchProductsBySubcategory(subcategoryId);
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
        <h4 className="text-center">Category - {category?.name}</h4>

        {/* Subcategories Slider */}
        {subcategories.length > 0 && (
          <div className="subcategory-slider mb-4">
            <Slider {...settings}>
              <div
                key="all"
                className={`subcategory-item ${!selectedSubcategory ? "active" : ""}`}
                onClick={() => {
                  setSelectedSubcategory(null);
                  fetchProductsBySubcategory(null); // Fetch all products
                }}
              >
                <div className="subcategory-circle">
                  <img
                    src="/api/v1/placeholder/64/64"
                    alt="All"
                    className="subcategory-image rounded-full"
                  />
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
                >
                  <div className="subcategory-circle">
                    <img
                      src={s.img}
                      alt={s.name}
                      className="subcategory-image rounded-full"
                    />
                  </div>
                  <h6 className="mt-2">{s.name}</h6>
                </div>
              ))}
            </Slider>
          </div>
        )}

        <h6 className="text-center">
          {products?.length} result{products?.length !== 1 ? 's' : ''}
        </h6>
        <div className="row">
          <div className="col-md-9 offset-1">
            {products?.length > 0 ? (
              <div className="d-flex flex-wrap">
                {products.map((p) => (
                  <div className="card m-2" key={p._id}>
                    <img
                      src={`/api/v1/product/product-photo/${p._id}`}
                      className="card-img-top"
                      alt={p.name}
                    />
                    <div className="card-body">
                      <div className="card-name-price">
                        <h5 className="card-title">{p.name}</h5>
                        <h5 className="card-title card-price">
                          {p.price.toLocaleString("en-US", {
                            style: "currency",
                            currency: "INR",
                          })}
                        </h5>
                      </div>
                      <p className="card-text ">{p.description.substring(0, 60)}...</p>
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