import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getAvailableJobs = asyncHandler(async (req, res) => {

    if (!['student'].includes(req.user.userType)) {
        throw new ApiError(403, "Only students can access job listings");
    }

    //putting default limit of 10
    const { page = 1, limit = 10 } = req.query;
    const queryObj = { status: 'open' };

    queryObj.$or = [
        { eligibleDepartments: { $size: 0 } },
        { eligibleDepartments: req.user.department }
    ];

    queryObj.$or.push(
        { eligibleGraduationYears: { $size: 0 } },
        { eligibleGraduationYears: req.user.graduationYear }
    );

    //for pagination
    const skip = (page - 1) * limit;

    const jobs = await Job.find(queryObj)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('postedBy', 'fullname');

    const totalJobs = await Job.countDocuments(queryObj);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                jobs,
                totalJobs,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalJobs / limit)
            },
            "Jobs fetched successfully"
        )
    );

});

const getJobDetails = asyncHandler(async (req, res) => {

    const { jobId } = req.params;

    const job = await Job.findById(jobId).populate('postedBy', 'fullname');

    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    if (job.status !== 'open') {
        throw new ApiError(400, "This job posting is no longer active");
    }

    const hasApplied = job.applicants.some(
        applicant => applicant.userId.toString() === req.user._id.toString()
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            { ...job.toObject(), hasApplied },
            "Job details fetched successfully"
        )
    );
});

const applyForJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    if (!['student'].includes(req.user.userType)) {
        throw new ApiError(403, "Only students can apply for jobs");
    }

    const job = await Job.findById(jobId);

    if (!job) {
        throw new ApiError(404, "Job not found");
    }

    if (job.status !== 'open') {
        throw new ApiError(400, "This job posting is no longer accepting applications");
    }

    if (new Date(job.applicationDeadline) < new Date()) {
        throw new ApiError(400, "Application deadline has passed");
    }

    const isDepartmentEligible =
        job.eligibleDepartments.length === 0 ||
        job.eligibleDepartments.includes(req.user.department);

    const graduationyear = Number(req.user.graduationyear);

     const isGraduationYearEligible = 
        job.eligibleGraduationYears.length === 0 || 
        job.eligibleGraduationYears.some(year => Number(year) === graduationyear);

    if (!isDepartmentEligible || !isGraduationYearEligible) {
        throw new ApiError(403, "You are not eligible for this job based on your department or graduation year");
    }

    const alreadyApplied = job.applicants.some(
        applicant => applicant.userId.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
        throw new ApiError(400, "You have already applied for this job");
    }

    job.applicants.push({
        userId: req.user._id,
        status: 'applied',
        appliedAt: new Date()
    });

    await job.save();

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $push: {
                appliedJobs: {
                    jobId: job._id,
                    status: 'applied',
                    appliedAt: new Date()
                }
            }
        }
    );

    return res.status(200).json(
        new ApiResponse(200, {}, "Successfully applied for the job")
    );
});

const getUserApplications = asyncHandler(async (req, res) => {

    if (!['student'].includes(req.user.userType)) {
        throw new ApiError(403, "Unauthorized access");
    }

    const user = await User.findById(req.user._id)
        .select('appliedJobs')
        .populate({
            path: 'appliedJobs.jobId',
            select: 'companyName description location jobType applicationDeadline status'
        });

    return res.status(200).json(
        new ApiResponse(200, user.appliedJobs, "Applications fetched successfully")
    );
});

export {
    getAvailableJobs,
    getJobDetails,
    applyForJob,
    getUserApplications
};