import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import { useCart } from "../../context/cart";
import { useAuth } from "../../context/auth";
import { useNavigate } from "react-router-dom";
import DropIn from "braintree-web-drop-in-react";
import { AiFillWarning } from "react-icons/ai";
import axios from "axios";
import toast from "react-hot-toast";
import "./cartPage.css";

const CartPage = () => {
  const [auth] = useAuth();
  const [cart, setCart] = useCart();
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
      getToken();
    }
  }, [auth?.token]);

  const getCart = async () => {
    try {
      const { data } = await axios.get(`/api/v1/carts/users/${auth.user._id}/cart`);
      setCart(data.cart || []); // Ensure cart is always an array
    } catch (error) {
      console.log(error);
      toast.error("Error fetching cart");
      setCart([]); // Set cart to empty array on error
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

  const getToken = async () => {
    try {
      const { data } = await axios.get("/api/v1/product/braintree/token");
      setClientToken(data?.clientToken);
    } catch (error) {
      console.log(error);
    }
  };

  const totalPrice = () => {
    try {
      let total = 0;
      if (Array.isArray(cart)) {
        cart.forEach((item) => {
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
      }
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
      setLoading(true);
      const total = totalPrice();
      
      if (total < minimumOrder) {
        toast.error(`Minimum order amount is ${minimumOrderCurrency} ${minimumOrder}`);
        setLoading(false);
        return;
      }

      let payload = {
        products: Array.isArray(cart) ? cart.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price
        })) : [],
        paymentMethod,
        amount: total
      };

      if (paymentMethod === "Braintree") {
        const { nonce } = await instance.requestPaymentMethod();
        payload.nonce = nonce;
      }

      const { data } = await axios.post("/api/v1/product/process-payment", payload);
      
      if (data.success) {
        await clearCart();
        navigate("/dashboard/user/orders");
        toast.success("Order Placed Successfully");
      } else {
        toast.error(data.message || "Failed to place order");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
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
              {!auth?.user ? "Hello Guest" : `Hello ${auth?.user?.name}`}
              <p className="text-center">
                {cart?.length
                  ? `You Have ${cart.length} items in your cart ${
                      auth?.token ? "" : "please login to checkout!"
                    }`
                  : " Your Cart Is Empty"}
              </p>
            </h1>
          </div>
        </div>
        <div className="row">
          <div className="col-md-7 col-12">
            {Array.isArray(cart) && cart.map((p) => (
              
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
                    <p>{p.product.description?.substring(0, 30) || 'No description available'}</p>
                    <p>
                      Price: {minimumOrderCurrency}{" "}
                      {p.product.bulkProducts?.length > 0
                        ? p.product.bulkProducts.find(
                            bp => p.quantity >= bp.minimum && p.quantity <= bp.maximum
                          )?.selling_price_set || p.product.price
                        : p.product.price} x {p.quantity} = {((p.product.bulkProducts?.length > 0
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
          <div className="col-md-5 col-12 cart-summary">
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
              <>
                <div className="mb-3">
                  <h4>Current Address</h4>
                  <h5>{auth?.user?.address}</h5>
                  <button
                    className="btn btn-outline-warning"
                    onClick={() => navigate("/dashboard/user/profile")}
                  >
                    Update Address
                  </button>
                </div>
              </>
            ) : (
              <div className="mb-3">
                {auth?.token ? (
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
              {!auth?.token || !cart?.length ? (
                ""
              ) : (
                <>
                  <div className="mb-3">
                    <h4>Select Payment Method</h4>
                    <select
                      className="form-select"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="Braintree">Online Payment</option>
                      <option value="COD">Cash on Delivery</option>
                    </select>
                  </div>
                  {paymentMethod === "Braintree" && (
                    <DropIn
                      options={{
                        authorization: clientToken,
                        paypal: {
                          flow: "vault",
                        },
                      }}
                      onInstance={(instance) => setInstance(instance)}
                    />
                  )}
                  <button
                    className="btn btn-primary"
                    onClick={handlePayment}
                    disabled={loading || (paymentMethod === "Braintree" && !instance) || !auth?.user?.address}
                  >
                    {loading ? "Processing ...." : `Place Order (${paymentMethod})`}
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