import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getUserById } from "../../services/userService";
import ProfileHeader from "../../components/profile/ProfileHeader";
import AboutSection from "../../components/profile/AboutSection";
import ExperienceSection from "../../components/profile/ExperienceSection";
import EducationSection from "../../components/profile/EducationSection";
import SkillsSection from "../../components/profile/SkillsSection";
import Loader from "../../components/common/Loader";

const UserDetail = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("Fetching user with ID:", userId);
        setIsLoading(true);
        const data = await getUserById(userId);
        console.log("User data received:", data);
        console.log("Graduation year specifically:", data.graduationYear, data.graduationyear);
        setUserData(data);
      } catch (error) {
        console.error("Error details:", error);
        setError(error.message || "Failed to fetch user details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (isLoading) return <Loader />;

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="not-found-container">
        <h2>User Not Found</h2>
        <p>The requested user profile does not exist.</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <ProfileHeader user={userData} />


      <div className="profile-content">
      <AboutSection aboutMe={userData.aboutMe} isViewOnly={true} />
        
        <ExperienceSection experience={userData.experience || []} isViewOnly={true} />
        <EducationSection education={userData.education || []} isViewOnly={true} />
        <SkillsSection skills={userData.skills || []} isViewOnly={true} />
      </div>
    </div>
  );
};

export default UserDetail;
