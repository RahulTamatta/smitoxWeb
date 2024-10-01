// ProductCardComponent.js
import React from "react";
import { useNavigate } from "react-router-dom";
// import "./ProductCardComponent.css"; // Add custom styles for the card (optional)

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/product/${product.slug}`);
  };

  return (
    <div className="product-card" onClick={handleCardClick}>
      <img
        src={`/api/v1/product/product-photo/${product._id}`}
        alt={product.name}
        className="product-card-image"
      />
      <div className="product-card-info">
        <h3>{product.name}</h3>
        <p>{product.price}</p>
        <button className="view-product-button">View Product</button>
      </div>
    </div>
  );
};

export default ProductCard;
