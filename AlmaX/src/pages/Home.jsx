import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/profile");
  }, [navigate]);

  return (
    <div className="container">
      <h1>Loading...</h1>
    </div>
  );
};

export default Home;
