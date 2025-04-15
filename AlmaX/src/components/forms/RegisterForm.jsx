import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./AuthForms.css";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    graduationyear: "",
    department: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullname) {
      newErrors.fullname = "Full name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.graduationyear) {
      newErrors.graduationYear = "Graduation year is required";
    } else if (
      isNaN(formData.graduationyear) ||
      formData.graduationyear < 2000 ||
      formData.graduationyear > 2100
    ) {
      newErrors.graduationYear = "Please enter a valid graduation year";
    }

    if (!formData.department) {
      newErrors.department = "Department is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    console.log("Sending registration data:", formData);

    try {
      await register({
        fullname: formData.fullname,
        email: formData.email,
        password: formData.password,
        graduationyear: parseInt(formData.graduationyear),
        department: formData.department,
      });
      navigate("/login", {
        state: { message: "Registration successful. Please log in." },
      });
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2 className="auth-form-title">Create an Account</h2>

      {errors.general && (
        <div className="auth-form-error-message">{errors.general}</div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fullname">Full Name</label>
          <input
            type="text"
            id="fullname"
            name="fullname"
            className={`form-control ${
              errors.fullname ? "form-control-error" : ""
            }`}
            value={formData.fullname}
            onChange={handleChange}
            placeholder="Enter your full name"
          />
          {errors.fullname && (
            <div className="error-message">{errors.fullname}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className={`form-control ${
              errors.email ? "form-control-error" : ""
            }`}
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="department">Department</label>
          <select
            id="department"
            name="department"
            className={`form-control ${
              errors.department ? "form-control-error" : ""
            }`}
            value={formData.department}
            onChange={handleChange}
          >
            <option value="">Select Department</option>
            <option value="CSE">Computer Science and Engineering</option>
            <option value="CEN">Computer Engineering</option>
            <option value="CST">Computer Science and Technology</option>
            <option value="ECE">Electronics and Engineering</option>
            <option value="EEE">Electrical Engineering</option>
            <option value="EIE">
              Electronics and Instrumentation Engineering
            </option>
          </select>
          {errors.department && (
            <div className="error-message">{errors.department}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="graduationyear">Graduation Year</label>
          <input
            type="number"
            id="graduationyear"
            name="graduationyear"
            className={`form-control ${
              errors.graduationyear ? "form-control-error" : ""
            }`}
            value={formData.graduationyear}
            onChange={handleChange}
            placeholder="Enter your graduation year"
          />
          {errors.graduationyear && (
            <div className="error-message">{errors.graduationyear}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            className={`form-control ${
              errors.password ? "form-control-error" : ""
            }`}
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
          />
          {errors.password && (
            <div className="error-message">{errors.password}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className={`form-control ${
              errors.confirmPassword ? "form-control-error" : ""
            }`}
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && (
            <div className="error-message">{errors.confirmPassword}</div>
          )}
        </div>

        <button
          type="submit"
          className="auth-form-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Registering..." : "Register"}
        </button>
      </form>

      <div className="auth-form-footer">
        <p>
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
