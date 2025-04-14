import React from "react";
import "./ExperienceSection.css";

const ExperienceSection = ({ experiences = [] }) => {
  if (!experiences || experiences.length === 0) {
    return (
      <div className="experience-section">
        <h2 className="section-title">Experience</h2>
        <p className="no-content-message">No experience listed.</p>
      </div>
    );
  }

  return (
    <div className="experience-section">
      <h2 className="section-title">Experience</h2>
      <div className="experiences-list">
        {experiences.map((experience, index) => (
          <div key={index} className="experience-item">
            <div className="experience-header">
              <h3 className="experience-title">{experience.title}</h3>
              <p className="experience-company">{experience.company}</p>
              {experience.location && (
                <p className="experience-location">{experience.location}</p>
              )}
            </div>
            <p className="experience-duration">
              {experience.startDate} - {experience.endDate || "Present"}
            </p>
            {experience.description && (
              <p className="experience-description">{experience.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperienceSection;
