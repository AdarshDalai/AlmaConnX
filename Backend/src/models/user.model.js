import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    userType: {
      type: String,
      enum: ['student', 'alumni', 'officer'],
      required: true
    },
    graduationyear: {
      type: Number,
      required: function () {
        return this.userType === 'student' || this.userType === 'alumni';
      }
    },
    department: {
      type: String,
    },
    avatar: {
      type: String,
      default: ""
    },
    password: {
      type: String,
      required: [true, "Password is required"]
    },
    coverImage: {
      type: String,
      default: ""
    },
    aboutMe: {
      type: String,
      default: ""
    },
    experience: {
      // type: [String], 
      type: [{
        title: String,
        company: String,
        location: String,
        startDate: String,
        endDate: String,
        description: String
      }],
      default: []
    },
    education: {
      // type: [String],
      type: [{
        degree: String,
        institution: String,
        field: String,
        startYear: Number,
        endYear: Number
      }],
      default: []
    },
    skills: {
      type: [String],
      default: []
    },
    appliedJobs: {
      type: [{
        jobId: {
          type: Schema.Types.ObjectId,
          ref: 'Job'
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
    },
    refreshToken: {
      type: String
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.checkAndUpdateUserType = async function () {
  const currentYear = new Date().getFullYear();

  if (this.userType === 'student' && this.graduationYear <= currentYear) {
    this.userType = 'alumni';
    await this.save();
    return true;
  }

  return false;
};

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullname: this.fullname,
      userType: this.userType
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  );
};

export const User = mongoose.model("User", userSchema);