import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getAvailableJobs } from "../../services/jobService";
import JobList from "../../components/jobs/JobList";
import Loader from "../../components/common/Loader";
import "./Jobs.css";

const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await getAvailableJobs(currentPage);
        setJobs(response.jobs);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setError("Failed to load jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (loading && jobs.length === 0) {
    return <Loader />;
  }

  return (
    <div className="jobs-container">
      <div className="jobs-header">
        <h1 className="jobs-title">Available Job Opportunities</h1>
        <p className="jobs-subtitle">
          Find and apply for positions that match your skills and career goals
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <JobList jobs={jobs} />

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-button"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </button>

          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>

          <button
            className="pagination-button"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Jobs;
