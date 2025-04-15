import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getJobApplicants,
  updateApplicantStatus,
  getJobById,
} from "../../services/jobService";
import Loader from "../../components/common/Loader";
import "./ApplicantList.css";

const ApplicantList = () => {
  const [jobDetails, setJobDetails] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const { jobId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobData, applicantsData] = await Promise.all([
          getJobById(jobId),
          getJobApplicants(jobId),
        ]);

        setJobDetails(jobData);
        setApplicants(applicantsData);
        setIsLoading(false);
      } catch (error) {
        setError("Failed to load applicants. Please try again.");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  const handleStatusChange = async (applicantId, newStatus) => {
    try {
      await updateApplicantStatus(jobId, applicantId, newStatus);

      // Update the applicant status in the local state
      setApplicants((prev) =>
        prev.map((applicant) =>
          applicant.userId === applicantId
            ? { ...applicant, status: newStatus }
            : applicant
        )
      );
    } catch (error) {
      setError("Failed to update applicant status. Please try again.");
    }
  };

  const getFilteredApplicants = () => {
    if (statusFilter === "all") {
      return applicants;
    }
    return applicants.filter((applicant) => applicant.status === statusFilter);
  };

  const filteredApplicants = getFilteredApplicants();

  if (isLoading) {
    return <Loader />;
  }

  if (!jobDetails) {
    return (
      <div className="error-container">
        Job not found or you don't have permission to view applicants.
      </div>
    );
  }

  return (
    <div className="applicant-list-container">
      <div className="applicant-list-header">
        <div className="header-content">
          <h1>Applicants for {jobDetails.companyName}</h1>
          <div className="job-meta">
            <p>
              Job Type: <span>{jobDetails.jobType}</span>
            </p>
            <p>
              Location: <span>{jobDetails.location}</span>
            </p>
            <p>
              Deadline:{" "}
              <span>
                {new Date(jobDetails.applicationDeadline).toLocaleDateString()}
              </span>
            </p>
          </div>
        </div>
        <button
          className="back-button"
          onClick={() => navigate("/officer/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filter-container">
        <label htmlFor="status-filter">Filter by Status:</label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Applicants</option>
          <option value="applied">Applied</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="rejected">Rejected</option>
          <option value="selected">Selected</option>
        </select>
      </div>

      <div className="applicants-table-container">
        {filteredApplicants.length === 0 ? (
          <div className="no-applicants">
            {statusFilter === "all"
              ? "No applicants yet for this job posting."
              : `No applicants with "${statusFilter}" status.`}
          </div>
        ) : (
          <table className="applicants-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Graduation Year</th>
                <th>Applied On</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.map((applicant) => (
                <tr key={applicant.userId}>
                  <td>{applicant.userDetails.fullname}</td>
                  <td>{applicant.userDetails.email}</td>
                  <td>{applicant.userDetails.department}</td>
                  <td>{applicant.userDetails.graduationyear}</td>
                  <td>{new Date(applicant.appliedAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge status-${applicant.status}`}>
                      {applicant.status}
                    </span>
                  </td>
                  <td>
                    <select
                      value={applicant.status}
                      onChange={(e) =>
                        handleStatusChange(applicant.userId, e.target.value)
                      }
                      className="status-select"
                    >
                      <option value="applied">Applied</option>
                      <option value="shortlisted">Shortlist</option>
                      <option value="rejected">Reject</option>
                      <option value="selected">Select</option>
                    </select>
                    <button
                      className="view-profile-btn"
                      onClick={() => navigate(`/users/${applicant.userId}`)}
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ApplicantList;
