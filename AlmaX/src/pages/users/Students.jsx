import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStudents } from "../../services/userService";
import UserCard from "../../components/common/UserCard";
import Loader from "../../components/common/Loader";
import "./Users.css";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const data = await getStudents();
        setStudents(data);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError(err.message || "Failed to load students.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleUserClick = (userId) => {
    navigate(`/users/${userId}`);
  };

  const departments = [...new Set(students.map((s) => s.department))].filter(
    Boolean
  );
  const graduationYears = [...new Set(students.map((s) => s.graduationyear))]
    .filter(Boolean)
    .sort((a, b) => a - b);

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.fullname
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDept =
      !departmentFilter || student.department === departmentFilter;
    const matchesYear =
      !yearFilter || student.graduationyear === parseInt(yearFilter);

    return matchesSearch && matchesDept && matchesYear;
  });

  if (isLoading) return <Loader />;

  return (
    <div className="users-container">
      <div className="users-header">
        <h1 className="users-title">Students Directory</h1>
        <p className="users-subtitle">Connect with current students</p>
      </div>

      {error && <div className="error-message">{error}</div>}

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
        {filteredStudents.length === 0 ? (
          <p className="no-data-message">
            No students found matching your filters.
          </p>
        ) : (
          filteredStudents.map((student) => (
            <UserCard
              key={student._id}
              user={student}
              onClick={() => handleUserClick(student._id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Students;
