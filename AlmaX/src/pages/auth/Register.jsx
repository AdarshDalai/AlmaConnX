import React from "react";
import { Navigate } from "react-router-dom";
import RegisterForm from "../../components/forms/RegisterForm";
import { useAuth } from "../../hooks/useAuth";

const Register = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="container">Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/profile" />;
  }

  return (
    <div className="container auth-container">
      <RegisterForm />
    </div>
  );
};

export default Register;
