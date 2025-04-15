import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAlumni } from "../../services/userService";
import UserCard from "../../components/common/UserCard";
import Loader from "../../components/common/Loader";
import "./Users.css";

const Alumni = () => {
  const [alumni, setAlumni] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Filtering & Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        setIsLoading(true);
        const data = await getAlumni();
        setAlumni(data);
      } catch (err) {
        console.error("Error fetching alumni:", err);
        setError(
          err.message || "Failed to load alumni. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlumni();
  }, []);

  const handleUserClick = (userId) => {
    navigate(`/users/${userId}`);
  };

  // Extract unique departments and graduation years for filters:
  const departments = [
    ...new Set(alumni.map((alum) => alum.department)),
  ].filter(Boolean);
  const graduationYears = [
    ...new Set(alumni.map((alum) => alum.graduationyear)),
  ]
    .filter(Boolean)
    .sort((a, b) => a - b);

  // Filter alumni based on search text, department, and graduation year filters.
  const filteredAlumni = alumni.filter((alum) => {
    const matchesSearch = alum.fullname
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDepartment =
      !departmentFilter || alum.department === departmentFilter;
    const matchesYear =
      !yearFilter || alum.graduationyear === parseInt(yearFilter);
    return matchesSearch && matchesDepartment && matchesYear;
  });

  if (isLoading) return <Loader />;

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="users-container">
      <div className="users-header">
        <h1 className="users-title">Alumni Network</h1>
        <p className="users-subtitle">
          Connect with graduates who can provide guidance and career
          opportunities
        </p>
      </div>

      <div className="users-filters">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <div className="filter-group">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Graduation Years</option>
            {graduationYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="user-grid">
        {filteredAlumni.length === 0 ? (
          <p className="no-data-message">
            No alumni found matching your filters.
          </p>
        ) : (
          filteredAlumni.map((alum) => (
            <UserCard
              key={alum._id}
              user={alum}
              onClick={() => handleUserClick(alum._id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Alumni;
