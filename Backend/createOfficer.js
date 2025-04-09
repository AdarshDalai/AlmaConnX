import dotenv from "dotenv";
import connectDB from "./src/db/index.js";
import { User } from "./src/models/user.model.js";
import bcrypt from "bcrypt";
dotenv.config({ path: './.env' });

const createOfficer = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB");
    const password = "arun123";
    const officerUser = await User.create({
      fullname: "Arun",
      email: "arun@silicon.com",
      userType: "officer",
      department: "PlacementCell",
      password: password
    });
    console.log("Officer created successfully!");
    console.log("ID:", officerUser._id);
    console.log("Email:", officerUser.email);
    console.log("Login with this email and password:", password);
  } catch (error) {
    console.error("Error creating officer:", error.message);
  } finally {
    console.log("Closing MongoDB connection");
    process.exit(0);
  }
};

createOfficer();
