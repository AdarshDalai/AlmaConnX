import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUserApplications } from "../../services/jobService";
import ApplicationStatus from "../../components/jobs/ApplicationStatus";
import Loader from "../../components/common/Loader";
// import "./ApplicationStatus.css";

const ApplicationStatusPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const data = await getUserApplications();
        setApplications(data);
      } catch (error) {
        console.error("Error fetching applications:", error);
        setError("Failed to load application data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "applied":
        return "status-applied";
      case "shortlisted":
        return "status-shortlisted";
      case "rejected":
        return "status-rejected";
      case "selected":
        return "status-selected";
      default:
        return "";
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="applications-container">
      <h1 className="applications-title">My Job Applications</h1>

      {applications.length === 0 ? (
        <div className="no-applications">
          <p>You haven't applied to any jobs yet.</p>
          <Link to="/jobs" className="browse-jobs-button">
            Browse Available Jobs
          </Link>
        </div>
      ) : (
        <div className="applications-list">
          {applications.map((application) => (
            <div key={application.jobId._id} className="application-card">
              <div className="application-header">
                <h2 className="company-name">
                  {application.jobId.companyName}
                </h2>
                <span
                  className={`application-status ${getStatusClass(
                    application.status
                  )}`}
                >
                  {application.status.charAt(0).toUpperCase() +
                    application.status.slice(1)}
                </span>
              </div>

              <div className="application-details">
                <div className="detail-item">
                  <span className="detail-label">Job Type:</span>
                  <span className="detail-value">
                    {application.jobId.jobType}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">
                    {application.jobId.location}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Applied On:</span>
                  <span className="detail-value">
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="application-actions">
                <Link
                  to={`/jobs/${application.jobId._id}`}
                  className="view-job-button"
                >
                  View Job Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationStatusPage;
