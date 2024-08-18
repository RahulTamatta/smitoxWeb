import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox, Radio } from "antd";
import { useCart } from "../context/cart";
import axios from "axios";
import toast from "react-hot-toast";
import Layout from "./../components/Layout/Layout";
import { AiOutlineReload } from "react-icons/ai";
import "../styles/Homepage.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import DealSlider from './DealSlider/DealSlider'
import ProductSlider from './DealSlider/Product'
import '../../src/homepage.css';
import '../../src/styles/Homepage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [checked, setChecked] = useState([]);
  const [radio, setRadio] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState([]);
  const [user, setUser] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    getAllCategory();
    getTotal();
    getBanners();
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const { data } = await axios.get("/api/v1/usersLists/current-user");
      if (data.success) {
        setUser(data.user);
        if (data.user.status === 'blocked') {
          setIsBlocked(true);
        }
      }
    } catch (error) {
      console.error('Error fetching user status:', error);
      toast.error('Failed to fetch user status. Please try again later.');
    }
  };

  const getAllCategory = async () => {
    try {
      const { data } = await axios.get("/api/v1/category/get-category");
      if (data?.success) {
        setCategories(data?.category);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAllProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/product/product-list/${page}`);
      setLoading(false);
      setProducts(data.products);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const getTotal = async () => {
    try {
      const { data } = await axios.get("/api/v1/product/product-count");
      setTotal(data?.total);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (page === 1) return;
    loadMore();
  }, [page]);

  const loadMore = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/product/product-list/${page}`);
      setLoading(false);
      setProducts([...products, ...data?.products]);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleFilter = (value, id) => {
    let all = [...checked];
    if (value) {
      all.push(id);
    } else {
      all = all.filter((c) => c !== id);
    }
    setChecked(all);
  };

  useEffect(() => {
    if (!checked.length || !radio.length) getAllProducts();
  }, [checked.length, radio.length]);

  useEffect(() => {
    if (checked.length || radio.length) filterProduct();
  }, [checked, radio]);

  const filterProduct = async () => {
    try {
      const { data } = await axios.post("/api/v1/product/product-filters", {
        checked,
        radio,
      });
      setProducts(data?.products);
    } catch (error) {
      console.log(error);
    }
  };

  const getBanners = async () => {
    try {
      const { data } = await axios.get("/api/v1/bannerManagement/get-banners");
      if (data?.success) {
        setBanners(data.banners);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch banners");
    }
  };

  
const handleBannerClick = (banner) => {
  console.log("Clicked banner", banner.categoryId, banner.subcategoryId);
  
  if (banner.categoryId) {
    navigate(`/category/${banner.categoryId.name}`, {
      state: { 
        selectedSubcategory: banner.subcategoryId.slug || null,
        fromBanner: true
      }
    });
  } else {
    toast.error("Banner is not linked to a category");
  }
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
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      }
    ]
  };

  const bannerSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  if (isBlocked) {
    return (
      <Layout title="Account Blocked">
        <div className="container mt-5">
          <div className="row">
            <div className="col-md-6 offset-md-3">
              <div className="card">
                <div className="card-body text-center">
                  <h2 className="card-title text-danger">Account Blocked</h2>
                  <p className="card-text">
                    Your account has been blocked. Please contact us for further assistance.
                  </p>
                  <p className="card-text">
                    Email: <a href="mailto:support@example.com">support@example.com</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={"All Products - Best offers"}>
      <div className="banner-container">
        <Slider {...bannerSettings}>
          {banners.map((banner) => (
            <div key={banner._id} onClick={() => handleBannerClick(banner)} style={{cursor: 'pointer'}}>
              <img
                src={`/api/v1/bannerManagement/single-banner/${banner._id}`}
                alt={banner.bannerName}
                className="banner-image"
              />
            </div>
          ))}
        </Slider>
      </div>
 
      <div className="container-fluid mt-3">
        <h2 className="text-center">Categories</h2>
        <Slider {...settings}>
          {categories.map((c) => (
            <div key={c._id} className="text-center category-item">
              <div
                className="category-circle"
                onClick={() => navigate(`/category/${c.slug}`)}
              >
                <img
                  src={c.photo}
                  alt={c.name}
                  className="img-fluid rounded-circle category-image"
                />
              </div>
              <h6 className="mt-2">{c.name}</h6>
            </div>
          ))}
        </Slider>
      </div>

      <div className="container-fluid row mt-3 home-page">
        <div className="col-md-9">
          <h1 className="text-center">All Products</h1>
          <div className="d-flex flex-wrap">
            {products?.map((p) => (
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
                  <p className="card-text">
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
          <div className="m-2 p-3">
            {products && products.length < total && (
              <button
                className="btn loadmore"
                onClick={(e) => {
                  e.preventDefault();
                  setPage(page + 1);
                }}
              >
                {loading ? (
                  "Loading ..."
                ) : (
                  <>
                    {" "}
                    Loadmore <AiOutlineReload />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      <DealSlider title={"Discounts for You"} />
      {!loading && <ProductSlider title={"Suggested for You"} tagline={"Based on Your Activity"} />}
    </Layout>
  );
};

export default HomePage;