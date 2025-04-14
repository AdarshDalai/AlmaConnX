import React from "react";
import "./AboutSection.css";

const AboutSection = ({ aboutMe }) => {
  if (!aboutMe || aboutMe.trim() === "") {
    return (
      <div className="about-section">
        <h2 className="section-title">About</h2>
        <p className="no-content-message">No information provided.</p>
      </div>
    );
  }

  return (
    <div className="about-section">
      <h2 className="section-title">About</h2>
      <div className="about-content">
        <p>{aboutMe}</p>
      </div>
    </div>
  );
};

export default AboutSection;
