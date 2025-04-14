import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import JobForm from "../../components/forms/JobForm";
import {
  getJobById,
  updateJob,
  uploadJobAttachment,
} from "../../services/jobService";
import Loader from "../../components/common/Loader";
import "./EditJob.css";

const EditJob = () => {
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fileUpload, setFileUpload] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { jobId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobData = await getJobById(jobId);
        setJob(jobData);
        setIsLoading(false);
      } catch (error) {
        setError("Failed to load job details. Please try again.");
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleSubmit = async (jobData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await updateJob(jobId, jobData);
      navigate("/officer/dashboard", {
        state: { message: "Job updated successfully!" },
      });
    } catch (error) {
      setError(error.message || "Failed to update job. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!fileUpload) return;

    const formData = new FormData();
    formData.append("attachment", fileUpload);

    try {
      setIsSubmitting(true);
      await uploadJobAttachment(jobId, formData, (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress(percentCompleted);
      });

      const updatedJob = await getJobById(jobId);
      setJob(updatedJob);
      setFileUpload(null);
      setUploadProgress(0);
    } catch (error) {
      setError("Failed to upload attachment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!job) {
    return (
      <div className="error-container">
        Job not found or you don't have permission to edit it.
      </div>
    );
  }

  return (
    <div className="edit-job-container">
      <div className="edit-job-header">
        <h1>Edit Job Posting</h1>
        <button
          className="back-button"
          onClick={() => navigate("/officer/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="job-form-wrapper">
        <JobForm
          initialData={job}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="edit"
        />
      </div>

      <div className="attachments-section">
        <h2>Job Attachments</h2>
        <div className="current-attachments">
          {job.attachments && job.attachments.length > 0 ? (
            <ul className="attachments-list">
              {job.attachments.map((attachment, index) => (
                <li key={index} className="attachment-item">
                  <span className="attachment-name">{attachment.name}</span>
                  <a
                    href={attachment.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-attachment-btn"
                  >
                    View
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-attachments">No attachments added yet.</p>
          )}
        </div>

        <div className="upload-attachment">
          <h3>Add New Attachment</h3>
          <div className="file-upload-container">
            <input
              type="file"
              onChange={handleFileChange}
              disabled={isSubmitting}
              className="file-input"
            />
            <button
              onClick={handleFileUpload}
              disabled={!fileUpload || isSubmitting}
              className="upload-btn"
            >
              Upload
            </button>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="progress-container">
              <div
                className="progress-bar"
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <span className="progress-text">{uploadProgress}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditJob;
