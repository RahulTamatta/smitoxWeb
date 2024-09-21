import React, { useState, useEffect } from "react";
import Layout from "./../components/Layout/Layout";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import toast from "react-hot-toast";

const ProductDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [auth] = useAuth();
  const [product, setProduct] = useState({});
  const [productsForYou, setProductsForYou] = useState([]);
  const [selectedQuantity, setSelectedQuantity] = useState(0);
  const [selectedBulk, setSelectedBulk] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isPincodeAvailable, setIsPincodeAvailable] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    if (params?.slug) getProduct();
    getProductsForYou();
    if (auth?.user?.pincode) {
      checkPincode(auth.user.pincode);
    }
    checkWishlistStatus();
  }, [params?.slug, auth?.user?.pincode]);

  useEffect(() => {
    if (product.bulkProducts) {
      const applicableBulk = getApplicableBulkProduct();
      setSelectedBulk(applicableBulk);
      calculateTotalPrice(applicableBulk);
    }
  }, [selectedQuantity, product]);

  const getProduct = async () => {
    try {
      const { data } = await axios.get(`/api/v1/product/get-product/${params.slug}`);
      setProduct(data?.product);
    } catch (error) {
      console.log(error);
      toast.error("Error fetching product details");
    }
  };

  const getProductsForYou = async () => {
    try {
      const { data } = await axios.get("/api/v1/productForYou/get-products");
      if (data?.success) {
        setProductsForYou(data.banners || []);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch products for you");
    }
  };

  const handleQuantityChange = (increment) => {
    const newQuantity = selectedQuantity + (increment ? 1 : -1) * parseInt(product.unitSet);
    setSelectedQuantity(Math.max(0, newQuantity));
  };

  const getApplicableBulkProduct = () => {
    if (!product.bulkProducts) return null;
    return product.bulkProducts.reduce((acc, curr) => {
      if (selectedQuantity >= curr.minimum * product.unitSet && 
          (!curr.maximum || selectedQuantity <= curr.maximum * product.unitSet) &&
          (!acc || curr.minimum > acc.minimum)) {
        return curr;
      }
      return acc;
    }, null);
  };

  const calculateTotalPrice = (bulk) => {
    if (bulk) {
      setTotalPrice(selectedQuantity * parseFloat(bulk.selling_price_set));
    } else {
      setTotalPrice(selectedQuantity * parseFloat(product.price));
    }
  };

  const addToCart = async () => {
    if (!auth.user) {
      toast.error("Please log in to add items to your cart");
      return;
    }

    if (selectedBulk) {
      try {
        await axios.post(`/api/v1/carts/users/${auth.user._id}/cart`, {
          productId: product._id,
          quantity: selectedQuantity,
          bulkProductDetails: selectedBulk,
          totalPrice: totalPrice
        });
        toast.success("Item added to cart");
      } catch (error) {
        console.error(error);
        toast.error("Error adding item to cart");
      }
    } else {
      toast.error("Quantity does not satisfy any minimum requirement.");
    }
  };

  const checkPincode = async (pincode) => {
    try {
      const { data } = await axios.get("/api/v1/pincodes/get-pincodes");
      if (data.success) {
        const availablePincodes = data.pincodes.map(pin => pin.code);
        if (availablePincodes.includes(pincode.toString())) {
          setIsPincodeAvailable(true);
          toast.success("Delivery available for your pincode");
        } else {
          setIsPincodeAvailable(false);
          toast.error("Delivery not available for your pincode");
        }
      } else {
        setIsPincodeAvailable(false);
        toast.error("Error fetching pincodes");
      }
    } catch (error) {
      console.log(error);
      setIsPincodeAvailable(false);
      toast.error("Error checking pincode");
    }
  };

  const checkWishlistStatus = async () => {
    if (auth.user && product._id) {
      try {
        const { data } = await axios.get(`/api/v1/user/${auth.user._id}/wishlist`);
        setIsInWishlist(data.wishlist.some(item => item._id === product._id));
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      }
    }
  };

  const toggleWishlist = async () => {
    if (!auth.user) {
      toast.error("Please log in to manage your wishlist");
      return;
    }

    try {
      if (isInWishlist) {
        await axios.delete(`/api/v1/user/${auth.user._id}/wishlist`, { data: { productId: product._id } });
        setIsInWishlist(false);
        toast.success("Removed from wishlist");
      } else {
        await axios.post(`/api/v1/user/${auth.user._id}/wishlist`, { productId: product._id });
        setIsInWishlist(true);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast.error("Error updating wishlist");
    }
  };

  // Styles
  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  };

  const productDetailStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  };

  const imageStyle = {
    flex: '1 1 300px',
    maxWidth: '500px',
  };

  const infoStyle = {
    flex: '1 1 300px',
    minWidth: '300px',
  };

  const headingStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '15px',
  };

  const priceStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#e47911',
    marginBottom: '20px',
  };

  const strikeThroughStyle = {
    textDecoration: 'line-through',
    color: '#888',
    marginRight: '10px',
  };

  const descriptionStyle = {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#555',
    marginBottom: '20px',
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
  };
  
  const quantitySelectorStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
  };

  const buttonStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#ffd814',
    border: 'none',
    borderRadius: '20px',
    transition: 'background-color 0.3s',
  };

  const addToCartButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#ffa41c',
    color: '#000000',
    fontWeight: 'bold',
    width: '100%',
    marginTop: '20px',
  };

  const inputStyle = {
    width: '50px',
    textAlign: 'center',
    margin: '0 10px',
    padding: '5px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  };

  const thTdStyle = {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'left',
  };

  const productCardStyle = {
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '10px',
    margin: '10px',
    width: 'calc(20% - 20px)',
    cursor: 'pointer',
    transition: 'box-shadow 0.3s',
    backgroundColor: '#ffffff',
  };

  const productGridStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  };

  return (
    <Layout>
      <div style={containerStyle}>
        <div style={productDetailStyle}>
          <div style={imageStyle}>
            <img
              src={`/api/v1/product/product-photo/${product._id}`}
              alt={product.name}
              style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
            />
          </div>
          <div style={infoStyle}>
            <h1 style={headingStyle}>{product.name}</h1>
            <div style={priceStyle}>
              <span style={strikeThroughStyle}>₹{product.mrp}</span>
              ₹{product.price}
            </div>
            <p>Total Price: ₹{totalPrice.toFixed(2)}</p>
            <p style={descriptionStyle}>{product.description}</p>
      
            <div style={quantitySelectorStyle}>
              <button onClick={() => handleQuantityChange(false)} style={buttonStyle}>-</button>
              <input
                type="number"
                value={selectedQuantity}
                readOnly
                style={inputStyle}
              />
              <button onClick={() => handleQuantityChange(true)} style={buttonStyle}>+</button>
            </div>
            {auth?.user?.pincode && (
              <p>Your Pincode: {auth.user.pincode}</p>
            )}
            <p>Delivery {isPincodeAvailable ? 'Available' : 'Not Available'} for your pincode</p>
            <button 
              onClick={addToCart} 
              disabled={!isPincodeAvailable || !selectedBulk}
              style={{
                ...addToCartButtonStyle,
                backgroundColor: (isPincodeAvailable && selectedBulk) ? '#ffa41c' : '#ccc',
                cursor: (isPincodeAvailable && selectedBulk) ? 'pointer' : 'not-allowed',
              }}
            >
              ADD TO CART
            </button>

            <button 
              onClick={toggleWishlist}
              style={{
                ...buttonStyle,
                backgroundColor: isInWishlist ? '#e47911' : '#f0c14b',
                color: isInWishlist ? '#ffffff' : '#111111',
                marginTop: '10px',
                width: '100%'
              }}
            >
              {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>

            <div>
              <h3 style={{ ...headingStyle, fontSize: '20px', marginTop: '20px' }}>Bulk Pricing</h3>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thTdStyle}>Minimum Qty</th>
                    <th style={thTdStyle}>Maximum Qty</th>
                    <th style={thTdStyle}>Price per set</th>
                    <th style={thTdStyle}>Total Price</th>
                    <th style={thTdStyle}>Selected</th>
                  </tr>
                </thead>
                <tbody>
                  {product.bulkProducts && product.bulkProducts.map((bulk, index) => {
                    const minQty = bulk.minimum * product.unitSet;
                    const maxQty = bulk.maximum ? bulk.maximum * product.unitSet : 'No limit';
                    const isSelected = selectedQuantity >= minQty && 
                                       (maxQty === 'No limit' || selectedQuantity <= maxQty);
                    return (
                      <tr key={index} style={{ backgroundColor: isSelected ? '#e6f7ff' : 'transparent' }}>
                        <td style={thTdStyle}>{minQty}</td>
                        <td style={thTdStyle}>{maxQty}</td>
                        <td style={thTdStyle}>₹{parseFloat(bulk.selling_price_set).toFixed(2)}</td>
                        <td style={thTdStyle}>
                          {isSelected ? `₹${(selectedQuantity * parseFloat(bulk.selling_price_set)).toFixed(2)}` : '-'}
                        </td>
                        <td style={thTdStyle}>
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            readOnly
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <h2 style={{ ...headingStyle, fontSize: '24px', marginTop: '40px' }}>Products For You</h2>
        <div style={productGridStyle}>
          {productsForYou
            .filter(item => item.categoryId?._id === product.category?._id)
            .map((item) => (
              <div 
                key={item._id} 
                style={productCardStyle}
                onClick={() => navigate(`/product/${item.productId?.slug}`)}
              >
                <img
                  src={`/api/v1/product/product-photo/${item.productId?._id}`}
                  alt={item.productId?.name || "Product"}
                  style={{ width: '100%', height: 'auto', borderRadius: '4px' }}
                />
                <h3 style={{ fontSize: '16px', marginTop: '10px' }}>{item.productId?.name || "Product Name"}</h3>
                <p style={{ fontSize: '14px', color: '#e47911', fontWeight: 'bold' }}>₹{item.productId?.price || "Price not available"}</p>
              </div>
            ))}
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;