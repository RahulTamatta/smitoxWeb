import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Layout from "../components/Layout/Layout";
import { AiFillHeart } from "react-icons/ai";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
// import "./Wishlist.css"; // Ensure this CSS file contains the styles provided earlier

const WishlistPage = () => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [auth] = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    if (auth?.user?._id) {
      getWishlist();
    }
  }, [auth?.user?._id]);

  // Fetch the user's wishlist from the backend
  const getWishlist = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/carts/users/${auth.user._id}/wishlist`);
      setLoading(false);
      if (data.status === "success") {
        setWishlist(data.wishlist);
      } else {
        toast.error("Failed to fetch wishlist");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching wishlist", error);
      toast.error("Error fetching wishlist");
    }
  };

  // Remove item from the wishlist
  const handleRemoveFromWishlist = async (productId) => {
    try {
      const { data } = await axios.delete(`/api/v1/carts/users/${auth.user._id}/wishlist/${productId}`);
      if (data.status === "success") {
        toast.success("Product removed from wishlist");
        setWishlist(wishlist.filter((item) => item.product._id !== productId));
      } else {
        toast.error("Failed to remove product from wishlist");
      }
    } catch (error) {
      console.error("Error removing product from wishlist", error);
      toast.error("Error removing product from wishlist");
    }
  };

  // Add item to cart
  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="wishlist-page">
        <h2>My Wishlist</h2>
        {wishlist.length === 0 ? (
          <p>Your wishlist is empty</p>
        ) : (
          <div className="wishlist-container">
            {wishlist.map((item) => (
              <div className="wishlist-item" key={item.product._id}>
                <img
                  src={`/api/v1/product/product-photo/${item.product._id}`}
                  alt={item.product.name}
                  className="wishlist-product-image"
                  onClick={() => navigate(`/product/${item.product.slug}`)}
                />
                <h3 className="wishlist-product-title">{item.product.name}</h3>
                <p className="wishlist-product-price">
                  {item.product.price?.toLocaleString("en-US", {
                    style: "currency",
                    currency: "INR",
                  }) || "Price not available"}
                </p>
                <button
                  className="remove-button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent click event from navigating
                    handleRemoveFromWishlist(item.product._id);
                  }}
                >
                  Remove
                </button>
                <button
                  className="add-to-cart-button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent click event from navigating
                    handleAddToCart(item.product);
                  }}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WishlistPage;
