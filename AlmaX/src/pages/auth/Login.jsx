import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import LoginForm from "../../components/forms/LoginForm";
import { useAuth } from "../../hooks/useAuth";

const Login = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const message = location.state?.message;

  if (isLoading) {
    return <div className="container">Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/profile" />;
  }

  return (
    <div className="container auth-container">
      {message && <div className="alert-success">{message}</div>}
      <LoginForm />
    </div>
  );
};

export default Login;
