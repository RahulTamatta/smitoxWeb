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
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [bulkQuantities, setBulkQuantities] = useState([]);
  const [cart, setCart] = useCart();

  useEffect(() => {
    if (params?.slug) getProduct();
  }, [params?.slug]);

  const getProduct = async () => {
    try {
      const { data } = await axios.get(
        `/api/v1/product/get-product/${params.slug}`
      );
      setProduct(data?.product);
      getSimilarProduct(data?.product._id, data?.product.category._id);
      setBulkQuantities(data?.product.bulkProducts?.map(() => 0) || []);
    } catch (error) {
      console.log(error);
    }
  };

  const getSimilarProduct = async (pid, cid) => {
    try {
      const { data } = await axios.get(
        `/api/v1/product/related-product/${pid}/${cid}`
      );
      setRelatedProducts(data?.products);
    } catch (error) {
      console.log(error);
    }
  };

  const handleQuantityChange = (index, value) => {
    setBulkQuantities((prevQuantities) => {
      const newQuantities = [...prevQuantities];
      newQuantities[index] = value;
      return newQuantities;
    });
  };

  const addToCart = (index) => {
    const bulkProduct = product.bulkProducts[index];
    const first = parseInt(product.unitSet) * parseInt(bulkProduct.minimum);
    const qtyValue = parseInt(bulkQuantities[index]);

    if (first <= qtyValue) {
      const cartItem = {
        ...product,
        quantity: qtyValue,
        bulkProductIndex: index,
        bulkProductDetails: bulkProduct,
      };
      setCart([...cart, cartItem]);
      localStorage.setItem(
        "cart",
        JSON.stringify([...cart, cartItem])
      );
      toast.success("Item Added to cart");
    } else {
      toast.error("Quantity does not satisfy the minimum requirement.");
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
              currency: "USD",
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
                  const first = parseInt(product.unitSet) * parseInt(bulkProduct.minimum);
                  const qtyValue = parseInt(bulkQuantities[index] || 0);
                  const isChecked = first <= qtyValue;
                  const result = first * parseFloat(bulkProduct.selling_price_set);

                  return (
                    <div key={index} className="bulk-product-box">
                      <div className="bulk-product-info">
                        <p>Minimum Qty: {first}</p>
                        <p>{first} x {bulkProduct.selling_price_set} = {result}</p>
                      </div>
                      <div className="quantity-selector">
                        <button onClick={() => handleQuantityChange(index, Math.max(qtyValue - 1, 0))}>-</button>
                        <input
                          type="number"
                          value={bulkQuantities[index] || 0}
                          onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                        />
                        <button onClick={() => handleQuantityChange(index, qtyValue + 1)}>+</button>
                      </div>
                      <div className="bulk-product-actions">
                        <input type="checkbox" checked={isChecked} readOnly />
                        <button
                          className="btn btn-secondary ms-1"
                          onClick={() => addToCart(index)}
                        >
                          ADD TO CART
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Similar Products Section */}
      <hr />
      <div className="row container similar-products">
        <h4>Similar Products ➡️</h4>
        {relatedProducts.length < 1 && (
          <p className="text-center">No Similar Products found</p>
        )}
        <div className="d-flex flex-wrap">
          {relatedProducts?.map((p) => (
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
                      currency: "USD",
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