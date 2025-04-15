import React from "react";
import { format } from "date-fns";
import "./ApplicationStatus.css";

const getStatusBadgeClass = (status) => {
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
      return "status-unknown";
  }
};

const formatDate = (dateString) => {
  try {
    return format(new Date(dateString), "MMM dd, yyyy");
  } catch (error) {
    return dateString;
  }
};

const ApplicationStatus = ({ applications, loading, error }) => {
  if (loading)
    return (
      <div className="applications-loading">Loading your applications...</div>
    );
  if (error) return <div className="applications-error">Error: {error}</div>;

  if (!applications || applications.length === 0) {
    return (
      <div className="no-applications">
        <h3>No Applications Yet</h3>
        <p>
          You haven't applied to any jobs yet. Browse available jobs to get
          started.
        </p>
      </div>
    );
  }

  return (
    <div className="applications-container">
      <h2>Your Applications</h2>

      <div className="applications-list">
        {applications.map((application) => (
          <div key={application.jobId._id} className="application-card">
            <div className="application-header">
              <h3>{application.jobId.companyName}</h3>
              <span
                className={`status-badge ${getStatusBadgeClass(
                  application.status
                )}`}
              >
                {application.status.charAt(0).toUpperCase() +
                  application.status.slice(1)}
              </span>
            </div>

            <div className="application-details">
              <div className="job-type-location">
                <span>{application.jobId.jobType}</span>
                {application.jobId.location && (
                  <>
                    <span className="separator">•</span>
                    <span>{application.jobId.location}</span>
                  </>
                )}
              </div>

              <div className="application-date">
                Applied on {formatDate(application.appliedAt)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplicationStatus;
