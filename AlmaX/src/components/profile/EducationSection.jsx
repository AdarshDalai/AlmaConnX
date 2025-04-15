import React from "react";
import "./EducationSection.css";

const EducationSection = ({ education = [] }) => {
  if (!education || education.length === 0) {
    return (
      <div className="education-section">
        <h2 className="section-title">Education</h2>
        <p className="no-content-message">No education listed.</p>
      </div>
    );
  }

  return (
    <div className="education-section">
      <h2 className="section-title">Education</h2>
      <div className="education-list">
        {education.map((edu, index) => (
          <div key={index} className="education-item">
            <div className="education-header">
              <h3 className="education-degree">{edu.degree}</h3>
              <p className="education-institution">{edu.institution}</p>
            </div>
            {edu.field && <p className="education-field">{edu.field}</p>}
            <p className="education-years">
              {edu.startYear} - {edu.endYear || "Present"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EducationSection;
