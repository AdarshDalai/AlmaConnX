import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="container not-found">
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn btn-primary">
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
