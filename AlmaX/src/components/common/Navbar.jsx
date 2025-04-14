import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./Navbar.css";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          AlmaConnX
        </Link>

        {isAuthenticated ? (
          <div className="navbar-links">
            <Link to="/profile" className="navbar-link">
              Profile
            </Link>

            {user.userType === "student" && (
              <>
                <Link to="/jobs" className="navbar-link">
                  Jobs
                </Link>
                <Link to="/applications" className="navbar-link">
                  My Applications
                </Link>
              </>
            )}

            {user.userType === "officer" && (
              <Link to="/officer/dashboard" className="navbar-link">
                Dashboard
              </Link>
            )}

            <Link to="/students" className="navbar-link">
              Students
            </Link>
            <Link to="/alumni" className="navbar-link">
              Alumni
            </Link>

            <button onClick={handleLogout} className="navbar-btn btn-logout">
              Logout
            </button>
          </div>
        ) : (
          <div className="navbar-links">
            <Link to="/login" className="navbar-link">
              Login
            </Link>
            <Link to="/register" className="navbar-btn btn-register">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
