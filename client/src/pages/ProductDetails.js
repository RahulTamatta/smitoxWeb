import React, { useState, useEffect } from "react";
import Layout from "./../components/Layout/Layout";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/ProductDetailsStyles.css";
import { useCart } from "../context/cart";
import toast from "react-hot-toast";

const ProductDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({});
  const [allProducts, setAllProducts] = useState([]);
  const [selectedQuantity, setSelectedQuantity] = useState(0);
  const [cart, setCart] = useCart();
  const [selectedBulk, setSelectedBulk] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (params?.slug) getProduct();
    getAllProducts();
  }, [params?.slug]);

  useEffect(() => {
    if (product.bulkProducts) {
      const applicableBulk = getApplicableBulkProduct();
      setSelectedBulk(applicableBulk);
      calculateTotalPrice(applicableBulk);
    }
  }, [selectedQuantity, product]);

  const getProduct = async () => {
    try {
      const { data } = await axios.get(
        `/api/v1/product/get-product/${params.slug}`
      );
      setProduct(data?.product);
    } catch (error) {
      console.log(error);
    }
  };

  const getAllProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/product/product-list/${page}`);
      setLoading(false);
      setAllProducts(data.products);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const handleQuantityChange = (value) => {
    setSelectedQuantity(value);
  };

  const getApplicableBulkProduct = () => {
    if (!product.bulkProducts) return null;
    return product.bulkProducts.reduce((acc, curr) => {
      const minQty = parseInt(product.unitSet) * parseInt(curr.minimum);
      if (selectedQuantity >= minQty && (!acc || minQty > parseInt(product.unitSet) * parseInt(acc.minimum))) {
        return curr;
      }
      return acc;
    }, null);
  };

  const calculateTotalPrice = (bulk) => {
    if (bulk) {
      setTotalPrice(selectedQuantity * parseFloat(bulk.selling_price_set));
    } else {
      setTotalPrice(0);
    }
  };

  const addToCart = () => {
    if (selectedBulk) {
      const cartItem = {
        ...product,
        quantity: selectedQuantity,
        bulkProductDetails: selectedBulk,
        totalPrice: totalPrice
      };
      setCart([...cart, cartItem]);
      localStorage.setItem(
        "cart",
        JSON.stringify([...cart, cartItem])
      );
      toast.success("Item Added to cart");
    } else {
      toast.error("Quantity does not satisfy any minimum requirement.");
    }
  };

  return (
    <Layout>
      <div className="row container product-details">
        <div className="col-md-6">
          <img
            src={`/api/v1/product/product-photo/${product._id}`}
            className="card-img-top"
            alt={product.name}
            height="300"
            width={"350px"}
          />
        </div>
        <div className="col-md-6 product-details-info">
          <h1 className="text-center">Product Details</h1>
          <hr />
          <h6>Name : {product.name}</h6>
          <h6>Description : {product.description}</h6>
          <h6>
            Price :
            {product?.price?.toLocaleString("en-US", {
              style: "currency",
              currency: "INR",
            })}
          </h6>
          <h6>Category : {product?.category?.name}</h6>
          <h6>Net Weight : {product.unitSet}</h6>
          <h6>Set Price : {product.perPiecePrice}</h6>
          <h6>Additional Unit : {product.additionalUnit}</h6>
          
          {/* Bulk Products Section */}
          {product.bulkProducts && product.bulkProducts.length > 0 && (
            <div>
              <h6>Bulk Products :</h6>
              <div className="bulk-products-container">
                {product.bulkProducts.map((bulkProduct, index) => {
                  const minQty = parseInt(product.unitSet) * parseInt(bulkProduct.minimum);
                  const maxQty = parseInt(product.unitSet) * parseInt(bulkProduct.maximum);
                  const isSelected = selectedBulk === bulkProduct;
                  return (
                    <div key={index} className="bulk-product-box">
                      <div className="bulk-product-info">
                        <p>{minQty} - {maxQty} : {parseFloat(bulkProduct.selling_price_set).toLocaleString("en-US", { style: "currency", currency: "INR" })}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                      />
                    </div>
                  );
                })}
               
              
       
              </div>
              <div>
         <div className="total-price">
                  <p>Total Price: {totalPrice.toLocaleString("en-US", { style: "currency", currency: "INR" })}</p>
                </div>
         <div className="quantity-selector">
                  <button onClick={() => handleQuantityChange(Math.max(selectedQuantity - 1, 0))}>-</button>
                  <input
                    type="number"
                    value={selectedQuantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                  />
                  <button onClick={() => handleQuantityChange(selectedQuantity + 1)}>+</button>
                </div>
                
                <div className="bulk-product-actions">
                  <button
                    className="btn btn-secondary ms-1"
                    onClick={addToCart}
                    disabled={!selectedBulk}
                  >
                    
                    ADD TO CART
                  </button>
                </div>
         </div>
            </div>
          )}
        </div>
      </div>
      
      {/* All Products Section */}
      <hr />
      <div className="row container all-products">
        <h4>All Products</h4>
        <div className="d-flex flex-wrap justify-content-around">
          {allProducts?.map((p) => (
            <div className="card m-2" style={{ width: '45%' }} key={p._id}>
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
                <p className="card-text ">
                  {p.description.substring(0, 60)}...
                </p>
                <div className="card-name-price">
                  <button
                    className="btn btn-info ms-1"
                    onClick={() => navigate(`/product/${p.slug}`)}
                  >
                    More Details
                  </button>
                  {/* <button
                    className="btn btn-dark ms-1"
                    onClick={() => {
                      setCart([...cart, p]);
                      localStorage.setItem(
                        "cart",
                        JSON.stringify([...cart, p])
                      );
                      toast.success("Item Added to cart");
                    }}
                  >
                    ADD TO CART
                  </button> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;