import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

const createJob = asyncHandler(async (req, res) => {
    const {
        companyName,
        description,
        location,
        salary,
        jobType,
        applicationDeadline,
        eligibleDepartments,
        eligibleGraduationYears,
        status
    } = req.body;

    if (req.user.userType != 'officer') {
        throw new ApiError(403, "Only placement officers can create job postings");
    }

    if ([companyName, description, location, jobType, applicationDeadline, eligibleDepartments, eligibleGraduationYears].some(field => !field)) {
        throw new ApiError(400, "All required fields must be provided");
    }

    const job = await Job.create({
        companyName,
        description,
        location,
        salary,
        jobType,
        applicationDeadline,
        postedBy: req.user._id,
        eligibleDepartments: eligibleDepartments || [],
        eligibleGraduationYears: eligibleGraduationYears || [],
        status: status || 'open'
    });

    return res.status(201).json(
        new ApiResponse(201, job, "Job posting created successfully.")
    );
});

const getOfficerJobsPosted = asyncHandler(async (req, res) => {

    if (req.user.userType !== 'officer') {
        throw new ApiError(403, "Unauthorized access");
    }

    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, jobs, "Jobs fetched successfully")
    );

});

const updateJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const updateData = req.body;

    if (req.user.userType != 'officer') {
        throw new ApiError(403, "Only placement officers can update job postings.");
    }

    const job = await Job.findById(jobId);

    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only update jobs created by you.");
    }

    const updatedJob = await Job.findByIdAndUpdate(
        jobId,
        {
            $set: updateData
        },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedJob, "Job updated Successfully")
    );
});

const uploadJobAttachment = asyncHandler(async (req, res) => {

    const { jobId } = req.params;
    const fileLocalPath = req.file?.path;
    const fileName = req.file?.originalname || 'attachment';

    if (req.user.userType !== 'officer') {
        throw new ApiError(400, "Only placement officers can upload attachments.");
    }

    if (!fileLocalPath) {
        throw new ApiError(400, "Attachment file is required.");
    }

    const job = await Job.findById(jobId);

    if (job.postedBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only upload attachments to jobs that you created");
    }

    const uploadedFile = await uploadOnCloudinary(fileLocalPath);

    if (!uploadedFile.url) {
        throw new ApiError(500, "Error while uploading attachment");
    }

    const updatedJob = await Job.findByIdAndUpdate(
        jobId,
        {
            $push: {
                attachments: {
                    name: fileName,
                    fileUrl: uploadedFile.url,
                    fileType: req.file?.mimetype
                }
            }
        },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedJob, "Attachment uploaded successfully")
    );
});

const getJobApplicants = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    if (req.user.userType !== 'officer') {
        throw new ApiError(403, "Only placement officers can view applicants");
    }

    const job = await Job.findById(jobId);

    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only view applicants for jobs that you created");
    }

    const applicantsWithDetails = await Promise.all(
        job.applicants.map(async (applicant) => {
            const userDetails = await User.findById(applicant.userId)
                .select("fullname email department graduationYear");

            return {
                ...applicant.toObject(),
                userDetails
            };
        })
    );

    return res.status(200).json(
        new ApiResponse(200, applicantsWithDetails, "Applicants fetched successfully")
    );
});

const updateApplicantStatus = asyncHandler(async (req, res) => {

    const { jobId, applicantId } = req.params;
    const { status } = req.body;

    if (!['applied', 'shortlisted', 'rejected', 'selected', 'not applied'].includes(status)) {
        throw new ApiError(400, "Invalid status value");
    }

    if (req.user.userType !== 'officer') {
        throw new ApiError(403, "Only placement officers can update applicant status");
    }

    const job = await Job.findOneAndUpdate(
        {
            _id: jobId,
            postedBy: req.user._id,
            "applicants.userId": applicantId
        },
        {
            $set: {
                "applicants.$.status": status
            }
        },
        { new: true }
    );

    if (!job) {
        throw new ApiError(404, "Job or applicant not found");
    }

    // updating user array
    await User.findOneAndUpdate(
        {
            _id: applicantId,
            "appliedJobs.jobId": jobId
        },
        {
            $set: {
                "appliedJobs.$.status": status
            }
        }
    );

    return res.status(200).json(
        new ApiResponse(200, job, "Applicant status updated successfully")
    );

})

export {
    createJob,
    getOfficerJobsPosted,
    updateJob,
    uploadJobAttachment,
    getJobApplicants,
    updateApplicantStatus
};