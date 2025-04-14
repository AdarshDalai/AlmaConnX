import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="container unauthorized">
      <h1>Access Denied</h1>
      <p>You don't have permission to access this page.</p>
      <div className="button-group">
        <button onClick={() => navigate(-1)} className="btn btn-secondary">
          Go Back
        </button>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
