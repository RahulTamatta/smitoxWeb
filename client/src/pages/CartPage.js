import React, { useState, useEffect } from "react";
import Layout from "./../components/Layout/Layout";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";
import DropIn from "braintree-web-drop-in-react";
import { AiFillWarning } from "react-icons/ai";
import axios from "axios";
import toast from "react-hot-toast";
import "../styles/CartStyles.css";

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
        total += item.totalPrice;
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

  const handlePayment = async () => {
    try {
      const total = totalPrice();
      if (total < minimumOrder) {
        toast.error(`Minimum order amount is ${minimumOrderCurrency} ${minimumOrder}`);
        return;
      }

      setLoading(true);
      let payload;

      if (paymentMethod === "Braintree") {
        const { nonce } = await instance.requestPaymentMethod();
        payload = { nonce, cart };
      } else {
        payload = { cart };
      }

      const { data } = await axios.post("/api/v1/product/process-payment", payload);
      setLoading(false);
      await axios.delete(`/api/v1/carts/users/${auth.user._id}/cart/clear`);
      setCart([]);
      navigate("/dashboard/user/orders");
      toast.success("Order Placed Successfully");
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error("Something went wrong");
    }
  };

  return (
    <Layout>
      <div className="cart-page">
        <div className="row">
          <div className="col-md-12">
            <h1 className="text-center bg-light p-2 mb-1">
              {!auth?.user
                ? "Hello Guest"
                : `Hello  ${auth?.token && auth?.user?.name}`}
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
        <div className="container">
          <div className="row">
            <div className="col-md-7 p-0 m-0">
              {cart?.map((p) => (
                <div className="row card flex-row" key={p._id}>
                  <div className="col-md-4">
                    <img
                      src={`/api/v1/product/product-photo/${p.product._id}`}
                      className="card-img-top"
                      alt={p.product.name}
                      width="100%"
                      height={"130px"}
                    />
                  </div>
                  <div className="col-md-4">
                    <p>{p.product.name}</p>
                    <p>Price: ₹{p.bulkProductDetails?.selling_price_set || p.product.price}</p>
                    <p>Quantity: {p.quantity}</p>
                    <p>Total Price: ₹{p.totalPrice}</p>
                  </div>
                  <div className="col-md-4 cart-remove-btn">
                    <button
                      className="btn btn-danger"
                      onClick={() => removeCartItem(p.product._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="col-md-5 cart-summary">
              <h2>Cart Summary</h2>
              <p>Total | Checkout | Payment</p>
              <hr />
              <h4>Total : {totalPrice().toLocaleString("en-US", {
                style: "currency",
                currency: minimumOrderCurrency || "INR",
              })} </h4>
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
                      disabled={loading || (paymentMethod === "Braintree" && !instance) || !auth?.user?.address || totalPrice() < minimumOrder}
                    >
                      {loading ? "Processing ...." : `Place Order (${paymentMethod})`}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;