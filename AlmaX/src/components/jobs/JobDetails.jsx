import React from "react";
import { format } from "date-fns";
import "./JobDetails.css";

const JobDetails = ({ job, onApply, userHasApplied, isLoading }) => {
  if (!job) return null;

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="job-details">
      <div className="job-header">
        <h1 className="job-title">{job.companyName}</h1>
        <div className="job-meta">
          <div className="job-location">
            <i className="fa fa-map-marker"></i>
            {job.location}
          </div>
          <div className="job-type">{job.jobType}</div>
        </div>
      </div>

      <div className="job-section">
        <h2>Job Description</h2>
        <div className="job-description">{job.description}</div>
      </div>

      {job.salary && (
        <div className="job-section">
          <h2>Salary</h2>
          <div className="job-salary">{job.salary}</div>
        </div>
      )}

      <div className="job-section">
        <h2>Details</h2>
        <div className="job-info-grid">
          <div className="job-info-item">
            <span className="info-label">Application Deadline:</span>
            <span className="info-value">
              {formatDate(job.applicationDeadline)}
            </span>
          </div>
          <div className="job-info-item">
            <span className="info-label">Job Type:</span>
            <span className="info-value">{job.jobType}</span>
          </div>
          {job.eligibleDepartments && job.eligibleDepartments.length > 0 && (
            <div className="job-info-item">
              <span className="info-label">Eligible Departments:</span>
              <span className="info-value">
                {job.eligibleDepartments.join(", ")}
              </span>
            </div>
          )}
          {job.eligibleGraduationYears &&
            job.eligibleGraduationYears.length > 0 && (
              <div className="job-info-item">
                <span className="info-label">Eligible Graduation Years:</span>
                <span className="info-value">
                  {job.eligibleGraduationYears.join(", ")}
                </span>
              </div>
            )}
        </div>
      </div>

      {job.attachments && job.attachments.length > 0 && (
        <div className="job-section">
          <h2>Attachments</h2>
          <ul className="job-attachments">
            {job.attachments.map((attachment, index) => (
              <li key={index}>
                <a
                  href={attachment.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {attachment.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {onApply && (
        <div className="job-actions">
          {userHasApplied ? (
            <button className="btn-applied" disabled>
              Applied
            </button>
          ) : (
            <button
              className="btn-apply"
              onClick={() => onApply(job._id)}
              disabled={isLoading}
            >
              {isLoading ? "Applying..." : "Apply Now"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default JobDetails;
