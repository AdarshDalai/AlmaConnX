import React from "react";
import { Link } from "react-router-dom";
import "./JobCard.css";

const JobCard = ({ job }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="job-card">
      <div className="job-card-header">
        <h3 className="job-card-title">{job.companyName}</h3>
        <span
          className={`job-card-type ${job.jobType
            .replace(/\s+/g, "-")
            .toLowerCase()}`}
        >
          {job.jobType}
        </span>
      </div>
      <div className="job-card-content">
        <p className="job-card-description">
          {job.description.length > 120
            ? `${job.description.substring(0, 120)}...`
            : job.description}
        </p>
        <div className="job-card-details">
          {job.location && (
            <div className="job-card-detail">
              <i className="fas fa-map-marker-alt"></i>
              <span>{job.location}</span>
            </div>
          )}
          {job.salary && (
            <div className="job-card-detail">
              <i className="fas fa-money-bill-wave"></i>
              <span>{job.salary}</span>
            </div>
          )}
          <div className="job-card-detail">
            <i className="fas fa-calendar-alt"></i>
            <span>Deadline: {formatDate(job.applicationDeadline)}</span>
          </div>
        </div>
      </div>
      <div className="job-card-footer">
        <Link to={`/jobs/${job._id}`} className="job-card-btn">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
