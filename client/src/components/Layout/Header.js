import React, { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../context/auth";
import toast from "react-hot-toast";
import SearchInput from "../Form/SearchInput";
import { Badge } from "antd";
import axios from "axios";
import { HeartOutlined, ShoppingCartOutlined } from '@ant-design/icons';

const Header = () => {
  const [auth, setAuth] = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Fetch cart count from the server
  const fetchCartCount = async () => {
    try {
      if (auth?.user) {
        const { data } = await axios.get(`/api/v1/carts/users/${auth.user._id}/cart`);
        setCartCount(data.cart.length);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error fetching cart count");
    }
  };

  useEffect(() => {
    fetchCartCount();

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [auth?.user]);

  const handleLogout = () => {
    setAuth({
      ...auth,
      user: null,
      token: "",
    });
    localStorage.removeItem("auth");
    toast.success("Logout Successfully");
  };

  return (
    <nav className="navbar navbar-expand bg-body-tertiary fixed-top">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand" style={{ fontSize: isMobile ? '1rem' : '1.25rem' }}>
          Smitox
        </Link>
        <div className="d-flex align-items-center">
          {!isMobile && <SearchInput />}
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0" style={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
            <li className="nav-item">
              <NavLink to="/" className="nav-link">
                Home
              </NavLink>
            </li>

            {!auth?.user ? (
              <>
                <li className="nav-item">
                  <NavLink to="/register" className="nav-link">
                    Register
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/login" className="nav-link">
                    Login
                  </NavLink>
                </li>
              </>
            ) : (
              <li className="nav-item dropdown">
                <NavLink
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  style={{ border: "none" }}
                >
                  {auth?.user?.name}
                </NavLink>
                <ul className="dropdown-menu">
                  <li>
                    <NavLink
                      to={`/dashboard/${auth?.user?.role === 1 ? "admin" : "user"}`}
                      className="dropdown-item"
                    >
                      Dashboard
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      onClick={handleLogout}
                      to="/login"
                      className="dropdown-item"
                    >
                      Logout
                    </NavLink>
                  </li>
                </ul>
              </li>
            )}
            <li className="nav-item">
              <NavLink to="/wishlist" className="nav-link">
                <Badge count={wishlistCount} showZero offset={[10, -5]}>
                  <HeartOutlined />
                </Badge>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/cart" className="nav-link">
                <Badge count={cartCount} showZero offset={[10, -5]}>
                  <ShoppingCartOutlined />
                </Badge>
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;