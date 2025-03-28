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
      type: [String], 
      default: [] 
    },
    education: { 
      type: [String], 
      default: [] 
    },
    skills: { 
      type: [String], 
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

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullname: this.fullname
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