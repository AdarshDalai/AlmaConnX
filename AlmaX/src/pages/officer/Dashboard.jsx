import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOfficerJobs } from "../../services/jobService";
import Loader from "../../components/common/Loader";
import "./Dashboard.css";

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalJobs: 0,
    openJobs: 0,
    closedJobs: 0,
    draftJobs: 0,
    totalApplicants: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsData = await getOfficerJobs();
        setJobs(jobsData);

        // Calculate dashboard stats
        const openJobs = jobsData.filter((job) => job.status === "open");
        const closedJobs = jobsData.filter((job) => job.status === "closed");
        const draftJobs = jobsData.filter((job) => job.status === "draft");
        const totalApplicants = jobsData.reduce(
          (total, job) => total + job.applicants.length,
          0
        );

        setStats({
          totalJobs: jobsData.length,
          openJobs: openJobs.length,
          closedJobs: closedJobs.length,
          draftJobs: draftJobs.length,
          totalApplicants,
        });

        setIsLoading(false);
      } catch (error) {
        setError("Failed to fetch jobs");
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleCreateJob = () => {
    navigate("/officer/jobs/create");
  };

  const handleEditJob = (jobId) => {
    navigate(`/officer/jobs/${jobId}/edit`);
  };

  const handleViewApplicants = (jobId) => {
    navigate(`/officer/jobs/${jobId}/applicants`);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Placement Officer Dashboard</h1>
        <button className="create-job-btn" onClick={handleCreateJob}>
          Create New Job
        </button>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Jobs</h3>
          <p>{stats.totalJobs}</p>
        </div>
        <div className="stat-card">
          <h3>Open Jobs</h3>
          <p>{stats.openJobs}</p>
        </div>
        <div className="stat-card">
          <h3>Closed Jobs</h3>
          <p>{stats.closedJobs}</p>
        </div>
        <div className="stat-card">
          <h3>Draft Jobs</h3>
          <p>{stats.draftJobs}</p>
        </div>
        <div className="stat-card">
          <h3>Total Applicants</h3>
          <p>{stats.totalApplicants}</p>
        </div>
      </div>

      <div className="jobs-list-section">
        <h2>Job Postings</h2>
        {jobs.length === 0 ? (
          <div className="no-jobs">
            No jobs posted yet. Create your first job posting!
          </div>
        ) : (
          <div className="jobs-table-container">
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Position</th>
                  <th>Job Type</th>
                  <th>Applicants</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id}>
                    <td>{job.companyName}</td>
                    <td>{job.description.substring(0, 30)}...</td>
                    <td>{job.jobType}</td>
                    <td>{job.applicants.length}</td>
                    <td>
                      {new Date(job.applicationDeadline).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`status-badge status-${job.status}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button onClick={() => handleEditJob(job._id)}>
                        Edit
                      </button>
                      <button onClick={() => handleViewApplicants(job._id)}>
                        View Applicants
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
