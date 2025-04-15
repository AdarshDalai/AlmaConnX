import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import JobForm from "../../components/forms/JobForm";
import { createJob } from "../../services/jobService";
import "./CreateJob.css";

const CreateJob = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const initialJobData = {
    companyName: "",
    description: "",
    location: "",
    salary: "",
    jobType: "full-time",
    applicationDeadline: "",
    eligibleDepartments: [],
    eligibleGraduationYears: [],
    status: "open",
  };

  const handleSubmit = async (jobData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await createJob(jobData);
      navigate("/officer/dashboard", {
        state: { message: "Job created successfully!" },
      });
    } catch (error) {
      setError(error.message || "Failed to create job. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-job-container">
      <div className="create-job-header">
        <h1>Create New Job Posting</h1>
        <button
          className="back-button"
          onClick={() => navigate("/officer/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="job-form-container">
        <JobForm
          initialData={initialJobData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="create"
        />
      </div>
    </div>
  );
};

export default CreateJob;
