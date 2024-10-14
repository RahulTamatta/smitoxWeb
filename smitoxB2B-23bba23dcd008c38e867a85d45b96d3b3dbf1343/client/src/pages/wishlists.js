import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Layout from "../components/Layout/Layout";
import { AiFillHeart } from "react-icons/ai";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";

const WishlistPage = () => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [auth] = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    // Check if user is authenticated
    if (!auth?.token) {
      toast.error("Please login to view wishlist");
      navigate("/login");
      return;
    }

    if (auth?.user?._id) {
      getWishlist();
    }
  }, [auth?.user?._id, auth?.token, navigate]);

  // Fetch the user's wishlist from the backend
  const getWishlist = async () => {
    try {
      setLoading(true);
      if (!auth?.user?._id) {
        throw new Error("User ID not found");
      }

      const { data } = await axios.get(`/api/v1/carts/users/${auth.user._id}/wishlist`);
      
      if (data.status === "success") {
        // Filter out any null products
        const validWishlistItems = data.wishlist.filter(item => item?.product != null);
        setWishlist(validWishlistItems);
      } else {
        toast.error("Failed to fetch wishlist");
      }
    } catch (error) {
      console.error("Error fetching wishlist", error);
      toast.error("Error fetching wishlist");
    } finally {
      setLoading(false);
    }
  };

  // Remove item from the wishlist
  const handleRemoveFromWishlist = async (productId) => {
    try {
      if (!auth?.user?._id) {
        throw new Error("User ID not found");
      }

      const { data } = await axios.delete(`/api/v1/carts/users/${auth.user._id}/wishlist/${productId}`);
      if (data.status === "success") {
        toast.success("Product removed from wishlist");
        setWishlist(wishlist.filter((item) => item?.product?._id !== productId));
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
    if (!product) {
      toast.error("Invalid product");
      return;
    }
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="wishlist-page p-4">
        <h2 className="text-2xl font-bold mb-4">My Wishlist</h2>
        {!wishlist || wishlist.length === 0 ? (
          <div className="text-center py-8">
            <p>Your wishlist is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlist.map((item) => (
              item?.product && (
                <div 
                  key={item.product._id}
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div 
                    className="cursor-pointer"
                    onClick={() => navigate(`/product/${item.product.slug}`)}
                  >
                    <img
                      src={`/api/v1/product/product-photo/${item.product._id}`}
                      alt={item.product.name}
                      className="w-full h-48 object-cover rounded-md mb-2"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                    <h3 className="font-semibold text-lg mb-2">{item.product.name}</h3>
                    <p className="text-gray-700 mb-2">
                      {item.product.price?.toLocaleString("en-US", {
                        style: "currency",
                        currency: "INR",
                      }) || "Price not available"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors w-1/2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromWishlist(item.product._id);
                      }}
                    >
                      Remove
                    </button>
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors w-1/2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(item.product);
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WishlistPage;