import React from "react";
import { Link } from "react-router-dom";
import JobCard from "../common/JobCard";
import "./JobList.css";

const JobList = ({ jobs, loading, error }) => {
  if (loading) return <div className="jobs-loading">Loading jobs...</div>;
  if (error) return <div className="jobs-error">Error: {error}</div>;

  if (jobs.length === 0) {
    return <div className="no-jobs">No jobs available at the moment.</div>;
  }

  return (
    <div className="jobs-list">
      {jobs.map((job) => (
        <Link to={`/jobs/${job._id}`} key={job._id} className="job-link">
          <JobCard job={job} />
        </Link>
      ))}
    </div>
  );
};

export default JobList;
