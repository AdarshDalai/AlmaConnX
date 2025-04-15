import React from "react";
import { Link } from "react-router-dom";
import "./UserCard.css";
import defaultAvatar from "../../assets/images/default-avatar.png";

const UserCard = ({ user }) => {
  return (
    <div className="user-card">
      <div className="user-card-avatar">
        <img
          src={user.avatar || defaultAvatar}
          alt={`${user.fullname}'s avatar`}
        />
      </div>
      <div className="user-card-content">
        <h3 className="user-card-name">{user.fullname}</h3>
        <p className="user-card-info">{user.department}</p>
        <p className="user-card-info">Graduation Year: {user.graduationyear}</p>
        {user.skills && user.skills.length > 0 && (
          <div className="user-card-skills">
            {user.skills.slice(0, 3).map((skill, index) => (
              <span key={index} className="user-card-skill">
                {skill}
              </span>
            ))}
            {user.skills.length > 3 && (
              <span className="user-card-skill">+{user.skills.length - 3}</span>
            )}
          </div>
        )}
        <Link to={`/users/${user._id}`} className="user-card-link">
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default UserCard;
