import api from '../utils/axiosConfig';

// Student job functions
export const getAvailableJobs = async (page = 1, limit = 10) => {
    try {
        const response = await api.get(`/studentJob/available?page=${page}&limit=${limit}`);
        return response.data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch jobs');
    }
};

export const getJobById = async (jobId) => {
    try {
        const response = await api.get(`/studentJob/${jobId}`);
        return response.data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch job details');
    }
};

export const applyForJob = async (jobId) => {
    try {
        const response = await api.post(`/studentJob/${jobId}/apply`);
        return response.data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to apply for job');
    }
};

export const getUserApplications = async () => {
    try {
        const response = await api.get('/studentJob/applications/me');
        return response.data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch applications');
    }
};

// Officer job management
export const getOfficerJobs = async () => {
    try {
        const response = await api.get('/officer/jobs');
        return response.data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch posted jobs');
    }
};

export const createJobPosting = async (jobData) => {
    try {
        const response = await api.post('/officer/jobs', jobData);
        return response.data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create job posting');
    }
};

export const updateJobPosting = async (jobId, jobData) => {
    try {
        const response = await api.patch(`/officer/jobs/${jobId}`, jobData);
        return response.data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update job posting');
    }
};

export const getJobApplicants = async (jobId) => {
    try {
        const response = await api.get(`/officer/jobs/${jobId}/applicants`);
        return response.data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch applicants');
    }
};

export const updateApplicantStatus = async (jobId, applicantId, status) => {
    try {
        const response = await api.patch(`/officer/jobs/${jobId}/applicants/${applicantId}/status`, { status });
        return response.data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update applicant status');
    }
};

// Function for file uploads
export const uploadJobAttachment = async (jobId, formData, onProgress) => {
    try {
        const response = await api.post(
            `/officer/jobs/${jobId}/attachments`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: onProgress
            }
        );
        return response.data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to upload attachment');
    }
};

// Aliases for backward compatibility
export const createJob = createJobPosting;
export const updateJob = updateJobPosting;
export const getOfficerJobsPosted = getOfficerJobs;