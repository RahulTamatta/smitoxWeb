import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import { useAuth } from "../../context/auth";
import { useNavigate } from "react-router-dom";
import DropIn from "braintree-web-drop-in-react";
import { AiFillWarning } from "react-icons/ai";
import axios from "axios";
import toast from "react-hot-toast";
import "./cartPage.css";

const CartPage = () => {
  const [auth] = useAuth();
  const [cart, setCart] = useState([]);
  const [clientToken, setClientToken] = useState("");
  const [instance, setInstance] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Braintree");
  const [minimumOrder, setMinimumOrder] = useState(0);
  const [minimumOrderCurrency, setMinimumOrderCurrency] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (auth?.token) {
      getCart();
      fetchMinimumOrder();
    }
  }, [auth?.token]);
  const isAuthenticated = auth?.token && auth?.user?._id;

  const getCart = async () => {
    try {
      const { data } = await axios.get(`/api/v1/carts/users/${auth.user._id}/cart`);
      setCart(data.cart);
    } catch (error) {
      console.log(error);
      toast.error("Error fetching cart");
    }
  };

  const fetchMinimumOrder = async () => {
    try {
      const { data } = await axios.get('/api/v1/minimumOrder/getMinimumOrder');
      if (data) {
        setMinimumOrder(data.amount);
        setMinimumOrderCurrency(data.currency);
      }
    } catch (error) {
      console.error('Error fetching minimum order:', error);
      toast.error("Error fetching minimum order amount");
    }
  };

  const totalPrice = () => {
    try {
      let total = 0;
      cart?.forEach((item) => {
        const { product, quantity } = item;
        let itemPrice = product.price;

        // Check for bulk pricing
        if (product.bulkProducts && product.bulkProducts.length > 0) {
          const bulkPrice = product.bulkProducts.find(
            bp => quantity >= bp.minimum && quantity <= bp.maximum
          );
          if (bulkPrice) {
            itemPrice = bulkPrice.selling_price_set;
          }
        }

        total += itemPrice * quantity;
      });
      return total;
    } catch (error) {
      console.log(error);
      return 0;
    }
  };

  const removeCartItem = async (pid) => {
    try {
      await axios.delete(`/api/v1/carts/users/${auth.user._id}/cart`, { data: { productId: pid } });
      getCart();
      toast.success("Item removed from cart");
    } catch (error) {
      console.log(error);
      toast.error("Error removing item from cart");
    }
  };

  const getToken = async () => {
    try {
      const { data } = await axios.get("/api/v1/product/braintree/token");
      setClientToken(data?.clientToken);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getToken();
  }, [auth?.token]);


  const clearCart = async () => {
    try {
      if (!auth?.user?._id) return;

      const response = await axios.delete(`/api/v1/carts/users/${auth.user._id}/cart`);

      if (response.data.status === 'success') {
        setCart([]); // Clear the cart state
        toast.success("Cart cleared successfully");
      } else {
        toast.error("Failed to clear cart");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error clearing cart");
    }
  };
  const handlePayment = async () => {
    try {
      const total = totalPrice();
      if (total < minimumOrder) {
        toast.error(`Minimum order amount is ${minimumOrderCurrency} ${minimumOrder}`);
        return;
      }
  
      setLoading(true);
      
      // Hardcode the payment method to "COD"
      const paymentMethod = "COD";
  
      const payload = { cart, paymentMethod };
  
      const { data } = await axios.post("/api/v1/product/process-payment", payload);
      setLoading(false);
      if (data.success) {
        // Clear the cart on the server and update local state
        await clearCart();
        
        // Navigate to the orders page
        navigate("/dashboard/user/orders");
        toast.success("Order Placed Successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const handleProductClick = (slug) => {
    navigate(`/product/${slug}`);
  };

  return (
    <Layout>
      <div className="cart-page container">
        <div className="row">
          <div className="col-12">
            <h1 className="text-center bg-light p-2 mb-1">
              {!isAuthenticated ? "Hello Guest" : `Hello ${auth?.user?.name}`}
              <p className="text-center">
                {cart?.length
                  ? `You Have ${cart.length} items in your cart ${
                      isAuthenticated ? "" : "please login to checkout!"
                    }`
                  : " Your Cart Is Empty"}
              </p>
            </h1>
          </div>
        </div>
        <div className="row">
          <div className="col-md-7 col-12">
            {cart?.map((p) => (
              p?.product && (
                <div 
                  className="row card flex-row my-3" 
                  key={p._id}
                  onClick={() => handleProductClick(p.product.slug)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="col-md-4 col-12">
                    <img
                      src={`/api/v1/product/product-photo/${p.product._id}`}
                      className="card-img-top"
                      alt={p.product.name}
                      width="100%"
                      height={"130px"}
                    />
                  </div>
                  <div className="col-md-4 col-12">
                    <p>{p.product.name}</p>
                    <p>
                      Price: ₹
                      {p.product.bulkProducts?.length > 0
                        ? p.product.bulkProducts.find(
                            bp => p.quantity >= bp.minimum && p.quantity <= bp.maximum
                          )?.selling_price_set || p.product.price
                        : p.product.price} x
                        {p.quantity} = {((p.product.bulkProducts?.length > 0
                        ? p.product.bulkProducts.find(
                            bp => p.quantity >= bp.minimum && p.quantity <= bp.maximum
                          )?.selling_price_set || p.product.price
                        : p.product.price) * p.quantity).toFixed(2)}
                    </p>
                    <button
                      className="btn btn-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCartItem(p.product._id);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            ))}
          </div>
          <div className="col-md-5 col-12">
            <h2>Cart Summary</h2>
            <p>Total | Checkout | Payment</p>
            <hr />
            <h4>Total: {totalPrice().toLocaleString("en-US", {
              style: "currency",
              currency: minimumOrderCurrency || "INR",
            })}</h4>
            <p>Minimum Order: {minimumOrder.toLocaleString("en-US", {
              style: "currency",
              currency: minimumOrderCurrency || "INR",
            })}</p>
            {totalPrice() < minimumOrder && (
              <p className="text-danger">
                <AiFillWarning /> Order total is below the minimum order amount
              </p>
            )}
            {auth?.user?.address ? (
              <div className="mb-3">
                <h4>Current Address</h4>
                <h5>{auth.user.address}</h5>
                <button
                  className="btn btn-outline-warning"
                  onClick={() => navigate("/dashboard/user/profile")}
                >
                  Update Address
                </button>
              </div>
            ) : (
              <div className="mb-3">
                {isAuthenticated ? (
                  <button
                    className="btn btn-outline-warning"
                    onClick={() => navigate("/dashboard/user/profile")}
                  >
                    Update Address
                  </button>
                ) : (
                  <button
                    className="btn btn-outline-warning"
                    onClick={() =>
                      navigate("/login", {
                        state: "/cart",
                      })
                    }
                  >
                    Please Login to checkout
                  </button>
                )}
              </div>
            )}
            <div className="mt-2">
              {!isAuthenticated || !cart?.length ? (
                ""
              ) : (
                <>
                  <h4>Payment Method: {paymentMethod}</h4>
                  <button
                    className="btn btn-primary"
                    onClick={handlePayment}
                    disabled={
                      loading || 
                      !auth?.user?.address || 
                      totalPrice() < minimumOrder
                    }
                  >
                    {loading ? "Processing..." : "Place Order"}
                  </button>
                  <button
                    className="btn btn-danger ml-2"
                    onClick={clearCart}
                    disabled={loading}
                  >
                    Clear Cart
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;