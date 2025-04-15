import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./ProfileHeader.css";

const ProfileHeader = ({ user }) => {
  const { user: authUser } = useAuth();
  const isOwnProfile = authUser && user && authUser._id === user._id;

  return (
    <div className="profile-header">
      <div className="profile-cover">
        {user?.coverImage ? (
          <img src={user.coverImage} alt="Cover" className="cover-image" />
        ) : (
          <div className="default-cover"></div>
        )}
      </div>

      <div className="profile-info-container">
        <div className="profile-avatar">
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" className="avatar-image" />
          ) : (
            <div className="default-avatar"></div>
          )}
        </div>

        <div className="profile-basic-info">
          <h1 className="profile-name">{user?.fullname || "No Name"}</h1>

          <div className="profile-details">
            <p className="profile-detail-item">
              <span className="detail-label">Email:</span> {user?.email}
            </p>
            <p className="profile-detail-item">
              <span className="detail-label">Department:</span>{" "}
              {user?.department || "Not specified"}
            </p>
            <p className="profile-detail-item">
              <span className="detail-label">Graduation Year:</span>
              {user?.graduationYear || user?.graduationyear || "Not specified"}
            </p>{" "}
            <p className="profile-detail-item">
              <span className="detail-label">User Type:</span>{" "}
              {user?.userType
                ? user.userType.charAt(0).toUpperCase() + user.userType.slice(1)
                : ""}
            </p>
          </div>

          <div className="profile-actions">
            {isOwnProfile && (
              <Link to="/profile/edit" className="edit-profile-button">
                Edit Profile
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
