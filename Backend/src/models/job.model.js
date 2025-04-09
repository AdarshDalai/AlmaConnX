import mongoose, { Schema } from "mongoose"

const jobSchema = new Schema({
    companyName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        // required: true
    },
    salary: {
        type: String
    },
    jobType: {
        type: String,
        enum: ['full-time', 'internship', 'internship + ppo'],
        required: true
    },
    applicationDeadline: {
        type: Date,
        required: true
    },
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    attachments: {
        type: [{
            name: String,
            fileUrl: String,
            fileType: String
        }],
        default: []
    },
    eligibleDepartments: {
        type: [String],
        default: []
    },
    eligibleGraduationYears: {
        type: [Number],
        default: []
    },
    status: {
        type: String,
        enum: ['open', 'closed', 'draft'],
        default: 'open'
    },
    applicants: {
        type: [{
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            status: {
                type: String,
                enum: ['applied', 'shortlisted', 'rejected', 'selected', 'not applied'],
                default: 'not applied'
            },
            appliedAt: {
                type: Date,
                default: Date.now
            }
        }],
        default: []
    }
}, { timestamps: true })

export const Job = mongoose.model("Job", jobSchema)