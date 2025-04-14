import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  updateProfileDetails,
  updateProfileAvatar,
  updateProfileCoverImage,
} from "../../services/profileService";
import Loader from "../common/Loader";
import "./ProfileForm.css";

const ProfileForm = ({ initialData }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const avatarInputRef = useRef(null);
  const coverImageInputRef = useRef(null);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    aboutMe: "",
    experience: [],
    education: [],
    skills: [],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        aboutMe: initialData.aboutMe || "",
        experience: initialData.experience || [],
        education: initialData.education || [],
        skills: initialData.skills || [],
      });

      if (initialData.avatar) {
        setAvatarPreview(initialData.avatar);
      }

      if (initialData.coverImage) {
        setCoverImagePreview(initialData.coverImage);
      }
    }
  }, [initialData]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAboutMeChange = (e) => {
    setFormData({
      ...formData,
      aboutMe: e.target.value,
    });
  };

  const handleSkillChange = (e, index) => {
    const updatedSkills = [...formData.skills];
    updatedSkills[index] = e.target.value;
    setFormData({
      ...formData,
      skills: updatedSkills,
    });
  };

  const addSkill = () => {
    setFormData({
      ...formData,
      skills: [...formData.skills, ""],
    });
  };

  const removeSkill = (index) => {
    const updatedSkills = formData.skills.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      skills: updatedSkills,
    });
  };

  const handleExperienceChange = (e, index, field) => {
    const updatedExperience = [...formData.experience];
    updatedExperience[index] = {
      ...updatedExperience[index],
      [field]: e.target.value,
    };
    setFormData({
      ...formData,
      experience: updatedExperience,
    });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [
        ...formData.experience,
        {
          title: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
    });
  };

  const removeExperience = (index) => {
    const updatedExperience = formData.experience.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      experience: updatedExperience,
    });
  };

  const handleEducationChange = (e, index, field) => {
    const updatedEducation = [...formData.education];
    updatedEducation[index] = {
      ...updatedEducation[index],
      [field]:
        field === "startYear" || field === "endYear"
          ? parseInt(e.target.value)
          : e.target.value,
    };
    setFormData({
      ...formData,
      education: updatedEducation,
    });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        {
          degree: "",
          institution: "",
          field: "",
          startYear: null,
          endYear: null,
        },
      ],
    });
  };

  const removeEducation = (index) => {
    const updatedEducation = formData.education.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      education: updatedEducation,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const profileResponse = await updateProfileDetails(formData);

      if (avatarFile) {
        const avatarResponse = await updateProfileAvatar(avatarFile);
        console.log("Avatar updated successfully:", avatarResponse);
      }

      if (coverImageFile) {
        const coverResponse = await updateProfileCoverImage(coverImageFile);
        console.log("Cover image updated successfully:", coverResponse);
      }

      alert("Profile updated successfully!");

      navigate("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="profile-form-container">
      <h2 className="profile-form-title">Edit Profile</h2>
      {error && <div className="profile-form-error">{error}</div>}

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Profile Images</h3>
          <div className="form-group">
            <label>Profile Avatar</label>
            <div className="image-upload-container">
              {avatarPreview && (
                <div className="image-preview">
                  <img src={avatarPreview} alt="Avatar Preview" />
                </div>
              )}
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="form-control-file"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Cover Image</label>
            <div className="image-upload-container">
              {coverImagePreview && (
                <div className="image-preview cover-preview">
                  <img src={coverImagePreview} alt="Cover Preview" />
                </div>
              )}
              <input
                type="file"
                ref={coverImageInputRef}
                onChange={handleCoverImageChange}
                accept="image/*"
                className="form-control-file"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>About Me</h3>
          <div className="form-group">
            <textarea
              name="aboutMe"
              value={formData.aboutMe}
              onChange={handleAboutMeChange}
              placeholder="Tell us about yourself"
              rows="4"
              className="form-control"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Experience</h3>
          {formData.experience.map((exp, index) => (
            <div key={index} className="form-subsection">
              <div className="form-group">
                <label>Job Title</label>
                <input
                  type="text"
                  value={exp.title}
                  onChange={(e) => handleExperienceChange(e, index, "title")}
                  placeholder="Job Title"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => handleExperienceChange(e, index, "company")}
                  placeholder="Company"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={exp.location}
                  onChange={(e) => handleExperienceChange(e, index, "location")}
                  placeholder="Location"
                  className="form-control"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="text"
                    value={exp.startDate}
                    onChange={(e) =>
                      handleExperienceChange(e, index, "startDate")
                    }
                    placeholder="MM/YYYY"
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="text"
                    value={exp.endDate}
                    onChange={(e) =>
                      handleExperienceChange(e, index, "endDate")
                    }
                    placeholder="MM/YYYY or Present"
                    className="form-control"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={exp.description}
                  onChange={(e) =>
                    handleExperienceChange(e, index, "description")
                  }
                  placeholder="Job Description"
                  rows="3"
                  className="form-control"
                />
              </div>
              <button
                type="button"
                className="remove-button"
                onClick={() => removeExperience(index)}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="add-button" onClick={addExperience}>
            Add Experience
          </button>
        </div>

        <div className="form-section">
          <h3>Education</h3>
          {formData.education.map((edu, index) => (
            <div key={index} className="form-subsection">
              <div className="form-group">
                <label>Degree</label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => handleEducationChange(e, index, "degree")}
                  placeholder="Degree"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Institution</label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) =>
                    handleEducationChange(e, index, "institution")
                  }
                  placeholder="Institution"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Field of Study</label>
                <input
                  type="text"
                  value={edu.field}
                  onChange={(e) => handleEducationChange(e, index, "field")}
                  placeholder="Field of Study"
                  className="form-control"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Year</label>
                  <input
                    type="number"
                    value={edu.startYear || ""}
                    onChange={(e) =>
                      handleEducationChange(e, index, "startYear")
                    }
                    placeholder="Start Year"
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>End Year</label>
                  <input
                    type="number"
                    value={edu.endYear || ""}
                    onChange={(e) => handleEducationChange(e, index, "endYear")}
                    placeholder="End Year"
                    className="form-control"
                  />
                </div>
              </div>
              <button
                type="button"
                className="remove-button"
                onClick={() => removeEducation(index)}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="add-button" onClick={addEducation}>
            Add Education
          </button>
        </div>

        <div className="form-section">
          <h3>Skills</h3>
          {formData.skills.map((skill, index) => (
            <div key={index} className="form-row align-center">
              <div className="form-group flex-grow">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => handleSkillChange(e, index)}
                  placeholder="Skill"
                  className="form-control"
                />
              </div>
              <button
                type="button"
                className="remove-button small"
                onClick={() => removeSkill(index)}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="add-button" onClick={addSkill}>
            Add Skill
          </button>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate("/profile")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
