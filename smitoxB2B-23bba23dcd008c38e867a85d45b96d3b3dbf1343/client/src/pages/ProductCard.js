import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  // Check if product is null or undefined
  if (!product) {
    return (
      <div className="col-md-4 col-sm-6 mb-3">
        <div className="card product-card h-100">
          <div className="card-body d-flex flex-column">
            <h5 className="card-title">Product not available</h5>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-md-4 col-sm-6 mb-3">
      <div 
        className="card product-card h-100" 
        style={{ cursor: 'pointer' }} 
        onClick={() => navigate(`/product/${product.slug}`)}
      >
        <img
          src={`/api/v1/product/product-photo/${product._id}`}
          className="card-img-top product-image"
          alt={product.name}
          style={{ height: '200px', objectFit: 'contain' }}
        />
        <div className="card-body d-flex flex-column">
          <h5 className="card-title product-name">{product.name}</h5>
          <div className="mt-auto">
            <h5 className="card-title product-price">
              {product.price?.toLocaleString("en-US", {
                style: "currency",
                currency: "INR",
              }) || "Price not available"}
            </h5>
            {product.mrp && (
              <h6
                style={{
                  textDecoration: "line-through",
                  color: "red",
                }}
              >
                {product.mrp.toLocaleString("en-US", {
                  style: "currency",
                  currency: "INR",
                })}
              </h6>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
