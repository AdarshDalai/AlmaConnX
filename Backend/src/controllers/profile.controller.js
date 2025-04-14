import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const updateProfileDetails = asyncHandler(async (req, res) => {
  const { 
    aboutMe, 
    experience, 
    education, 
    skills 
  } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id, 
      {
        $set: {
          aboutMe: aboutMe || [],
          experience: experience || [],
          education: education || [],
          skills: skills || []
        }
      },
      { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(
      new ApiResponse(200, user, "Profile details updated successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Error updating profile details");
  }
});

const updateProfileAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  
  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { avatar: avatar.url } },
    { new: true }
  ).select("-password -refreshToken");
  console.log("updateProfileAvatar called, req.file:", req.file);
  return res.status(200).json(
    new ApiResponse(200, user, "Profile avatar updated successfully")
  );
});

const updateProfileCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  
  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading cover image");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { coverImage: coverImage.url } },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(200, user, "Profile cover image updated successfully")
  );
});

const updateAccountDetails = asyncHandler(async(req,res) => {
    const{fullname,email} = req.body
    
    if(!fullname || !email){
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email: email
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user,"Account details updated successfully"))
    
})


const getProfileDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, user, "Profile details fetched successfully")
  );
});

export {
  updateProfileDetails,
  updateProfileAvatar,
  updateProfileCoverImage,
  updateAccountDetails,
  getProfileDetails
};