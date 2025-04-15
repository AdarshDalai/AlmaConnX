import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        //add refresh token in db
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token.")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    const { fullname, email, password, graduationyear, department } = req.body
    const graduationYearNumber = parseInt(graduationyear);
    console.log("email: ", email);

    if (
        [fullname, email, password, graduationyear].some((field) => field?.toString().trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({ email });


    if (existedUser) {
        throw new ApiError(409, "User with email already exist")
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const userType = (graduationyear > currentYear || (graduationyear === currentYear && currentMonth <= 5)) ? 'student' : 'alumni';
    const user = await User.create({
        fullname,
        email,
        password,
        graduationyear,
        department,
        userType
    });

    // here i am fetching created user without sensitive info 
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user.")
    }

    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("Method:", req.method);
    console.log("Current date:", now);

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully.")
    )

});

const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body
    console.log(email);

    if (!email) {
        throw new ApiError(400, "Email is required")
    }

    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    //to check if change needed student alumni
    await user.checkAndUpdateUserType();

    //genereating token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).
        select("-password -refreshToken")

    //giving cookie options
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser, accessToken, refreshToken
            },
                "User logged in successfully")
        )

})

const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id, {
        $set: {
            refreshToken: undefined
        }
    },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "user logged out"))

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, 'Unauthorized request')
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, 'Invalid refresh token')
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, 'Refresh token is expired or used')

        }

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: 'lax'
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")

    }

})

const changeCurrentPassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword, confPassword } = req.body

    if (!(newPassword === confPassword)) {
        throw new ApiError(400, 'New and confirm Password mismathc')
    }

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, 'Invalid Old Password')
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Password changed successfully'))


})

// const getCurrentUser = asyncHandler(async (req, res) => {

//     await req.user.checkAndUpdateUserType();

//     const user = await User.findById(req.user._id).select("-password -refreshToken");

//     return res
//         .status(200)
//         .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
// })
const getCurrentUser = asyncHandler(async(req, res) => {
    await req.user.checkAndUpdateUserType();
    return res
      .status(200)
      .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
  });

//new updatation
const getStudents = asyncHandler(async (req, res) => {
    try {
        const students = await User.find({ userType: 'student' })
            .select("fullname email department graduationyear avatar")
            .sort({ fullname: 1 });

        return res.status(200).json(
            new ApiResponse(200, students, "Students fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, error.message || "Failed to get students");
    }
});

const getAlumni = asyncHandler(async (req, res) => {
    try {
        const alumni = await User.find({ userType: 'alumni' })
            .select("fullname email department graduationyear avatar")
            .sort({ fullname: 1 });

        return res.status(200).json(
            new ApiResponse(200, alumni, "Alumni fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, error.message || "Failed to get alumni");
    }
});

const getUserById = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId)
            .select("-password -refreshToken");

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        return res.status(200).json(
            new ApiResponse(200, user, "User details fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, error.message || "Failed to get user details");
    }
});




export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    getStudents,
    getAlumni,
    getUserById
};