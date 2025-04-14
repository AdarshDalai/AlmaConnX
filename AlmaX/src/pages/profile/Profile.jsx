import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getProfileDetails } from "../../services/profileService";
import { getUserById } from "../../services/userService";
import ProfileHeader from "../../components/profile/ProfileHeader";
import AboutSection from "../../components/profile/AboutSection";
import ExperienceSection from "../../components/profile/ExperienceSection";
import EducationSection from "../../components/profile/EducationSection";
import SkillsSection from "../../components/profile/SkillsSection";
import Loader from "../../components/common/Loader";
import "./Profile.css";

const Profile = () => {
  const { userId } = useParams();
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isOwnProfile = !userId || userId === authUser?._id;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        let userData;

        if (isOwnProfile) {
          userData = await getProfileDetails();
        } else {
          userData = await getUserById(userId);
        }

        setUser(userData);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, isOwnProfile]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  if (!user) {
    return <div className="error-container">User not found</div>;
  }

  return (
    <div className="profile-container">
      <ProfileHeader user={user} isOwnProfile={isOwnProfile} />

      <div className="profile-content">
        <AboutSection aboutMe={user.aboutMe} />
        <ExperienceSection experiences={user.experience || []} />

        <EducationSection education={user.education || []} />

        <SkillsSection skills={user.skills || []} />
      </div>
    </div>
  );
};

export default Profile;
