import React, { useState } from "react";
import "./SkillsSection.css";

const SkillsSection = ({ skills = [], isEditing = false, onUpdate }) => {
  const [skillInput, setSkillInput] = useState("");
  const [editedSkills, setEditedSkills] = useState([...skills]);

  const handleAddSkill = () => {
    if (skillInput.trim() && !editedSkills.includes(skillInput.trim())) {
      const newSkills = [...editedSkills, skillInput.trim()];
      setEditedSkills(newSkills);
      onUpdate(newSkills);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill) => {
    const newSkills = editedSkills.filter((s) => s !== skill);
    setEditedSkills(newSkills);
    onUpdate(newSkills);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <div className="skills-section">
      <h3>Skills</h3>

      {isEditing ? (
        <div className="skills-edit">
          <div className="skill-input-container">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a skill"
              className="skill-input"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="add-skill-btn"
            >
              Add
            </button>
          </div>

          <div className="skills-list">
            {editedSkills.map((skill, index) => (
              <div key={index} className="skill-item editable">
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="remove-skill-btn"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="skills-list">
          {skills.map((skill, index) => (
            <div key={index} className="skill-item">
              {skill}
            </div>
          ))}
          {skills.length === 0 && (
            <p className="no-skills">No skills added yet</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SkillsSection;
