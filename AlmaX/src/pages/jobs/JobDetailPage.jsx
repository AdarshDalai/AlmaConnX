import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getJobById, applyForJob } from "../../services/jobService";
import JobDetails from "../../components/jobs/JobDetails";
import Loader from "../../components/common/Loader";
import "./JobDetail.css";

const JobDetailPage = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const jobData = await getJobById(jobId);
        setJob(jobData);
      } catch (error) {
        console.error("Error fetching job details:", error);
        setError("Failed to load job details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const handleApply = async (jobId) => {
    try {
      setApplying(true);
      setError(null);
      await applyForJob(jobId);
      setSuccess("Application submitted successfully!");
      
      setJob((prev) => ({
        ...prev,
        hasApplied: true,
      }));
      
      setTimeout(() => {
        navigate("/applications");
      }, 2000);
    } catch (error) {
      console.error("Error applying for job:", error);
      setError(error.message || "Failed to submit application. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error && !job) {
    return <div className="error-container">{error}</div>;
  }

  if (!job) {
    return <div className="error-container">Job not found</div>;
  }

  const isApplicationDeadlinePassed = new Date(job.applicationDeadline) < new Date();
  const isJobClosed = job.status !== "open";
  const canApply = !job.hasApplied && !isApplicationDeadlinePassed && !isJobClosed;

  return (
    <div className="job-detail-container">
      <div className="job-detail-header">
        <h1 className="job-detail-title">{job.companyName}</h1>
        <div className="job-detail-subtitle">
          {job.jobType} • {job.location}
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <JobDetails 
        job={job}
        onApply={canApply ? handleApply : null}
        userHasApplied={job.hasApplied}
        isLoading={applying}
      />
      
      <div className="job-application-section">
        {job.hasApplied ? (
          <div className="already-applied-message">
            You've already applied for this position.
            <button className="view-status-button" onClick={() => navigate("/applications")}>
              View Application Status
            </button>
          </div>
        ) : isJobClosed ? (
          <div className="job-closed-message">
            This job posting is no longer accepting applications.
          </div>
        ) : isApplicationDeadlinePassed ? (
          <div className="deadline-passed-message">
            The application deadline for this job has passed.
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default JobDetailPage;