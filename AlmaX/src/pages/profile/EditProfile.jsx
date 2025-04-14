import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getProfileDetails } from "../../services/profileService";
import ProfileForm from "../../components/forms/ProfileForm";
import Loader from "../../components/common/Loader";

const EditProfile = () => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authUser) {
      navigate("/login");
      return;
    }

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const userData = await getProfileDetails();
        setProfileData(userData);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [authUser, navigate]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="edit-profile-page">
      <ProfileForm initialData={profileData} />
    </div>
  );
};

export default EditProfile;
