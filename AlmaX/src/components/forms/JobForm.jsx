import React, { useState, useEffect } from "react";
import "./JobForm.css";

const JobForm = ({
  initialData = {
    companyName: "",
    description: "",
    location: "",
    salary: "",
    jobType: "full-time",
    applicationDeadline: "",
    eligibleDepartments: [],
    eligibleGraduationYears: [],
    status: "open",
  },
  onSubmit,
  isSubmitting,
  formType = "create",
}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [departmentInput, setDepartmentInput] = useState("");
  const [yearInput, setYearInput] = useState("");

  useEffect(() => {
    if (initialData) {
      let formattedData = { ...initialData };
      if (initialData.applicationDeadline) {
        try {
          const date = new Date(initialData.applicationDeadline);
          formattedData.applicationDeadline = date.toISOString().split("T")[0];
        } catch (error) {}
      }
      setFormData(formattedData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleAddDepartment = () => {
    if (
      departmentInput.trim() &&
      !formData.eligibleDepartments.includes(departmentInput.trim())
    ) {
      setFormData({
        ...formData,
        eligibleDepartments: [
          ...formData.eligibleDepartments,
          departmentInput.trim(),
        ],
      });
      setDepartmentInput("");
    }
  };

  const handleRemoveDepartment = (dept) => {
    setFormData({
      ...formData,
      eligibleDepartments: formData.eligibleDepartments.filter(
        (d) => d !== dept
      ),
    });
  };

  const handleAddYear = () => {
    const year = parseInt(yearInput.trim(), 10);
    if (!isNaN(year) && !formData.eligibleGraduationYears.includes(year)) {
      setFormData({
        ...formData,
        eligibleGraduationYears: [...formData.eligibleGraduationYears, year],
      });
      setYearInput("");
    }
  };

  const handleRemoveYear = (year) => {
    setFormData({
      ...formData,
      eligibleGraduationYears: formData.eligibleGraduationYears.filter(
        (y) => y !== year
      ),
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyName)
      newErrors.companyName = "Company name is required";
    if (!formData.description)
      newErrors.description = "Description is required";
    if (!formData.location) newErrors.location = "Location is required";
    if (!formData.jobType) newErrors.jobType = "Job type is required";
    if (!formData.applicationDeadline)
      newErrors.applicationDeadline = "Application deadline is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors({ ...errors, general: error.message });
    }
  };

  return (
    <form className="job-form" onSubmit={handleSubmit}>
      {errors.general && (
        <div className="form-error-message">{errors.general}</div>
      )}

      <div className="form-group">
        <label htmlFor="companyName">Company Name *</label>
        <input
          type="text"
          id="companyName"
          name="companyName"
          className={`form-control ${
            errors.companyName ? "form-control-error" : ""
          }`}
          value={formData.companyName}
          onChange={handleChange}
          placeholder="Enter company name"
        />
        {errors.companyName && (
          <div className="error-message">{errors.companyName}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="description">Job Description *</label>
        <textarea
          id="description"
          name="description"
          className={`form-control ${
            errors.description ? "form-control-error" : ""
          }`}
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter job description"
          rows="5"
        />
        {errors.description && (
          <div className="error-message">{errors.description}</div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="location">Location *</label>
          <input
            type="text"
            id="location"
            name="location"
            className={`form-control ${
              errors.location ? "form-control-error" : ""
            }`}
            value={formData.location}
            onChange={handleChange}
            placeholder="Enter job location"
          />
          {errors.location && (
            <div className="error-message">{errors.location}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="salary">Salary (Optional)</label>
          <input
            type="text"
            id="salary"
            name="salary"
            className="form-control"
            value={formData.salary || ""}
            onChange={handleChange}
            placeholder="Enter salary range"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="jobType">Job Type *</label>
          <select
            id="jobType"
            name="jobType"
            className={`form-control ${
              errors.jobType ? "form-control-error" : ""
            }`}
            value={formData.jobType}
            onChange={handleChange}
          >
            <option value="full-time">Full-time</option>
            <option value="internship">Internship</option>
            <option value="internship+ppo">Internship + PPO</option>
          </select>
          {errors.jobType && (
            <div className="error-message">{errors.jobType}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="applicationDeadline">Application Deadline *</label>
          <input
            type="date"
            id="applicationDeadline"
            name="applicationDeadline"
            className={`form-control ${
              errors.applicationDeadline ? "form-control-error" : ""
            }`}
            value={formData.applicationDeadline}
            onChange={handleChange}
          />
          {errors.applicationDeadline && (
            <div className="error-message">{errors.applicationDeadline}</div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          name="status"
          className="form-control"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="form-group">
        <label>Eligible Departments (Leave empty for all departments)</label>
        <div className="input-with-button">
          <input
            type="text"
            value={departmentInput}
            onChange={(e) => setDepartmentInput(e.target.value)}
            placeholder="Enter department name"
            className="form-control"
          />
          <button
            type="button"
            onClick={handleAddDepartment}
            className="add-button"
          >
            Add
          </button>
        </div>

        <div className="tags-container">
          {formData.eligibleDepartments.map((dept, index) => (
            <div key={index} className="tag">
              {dept}
              <button
                type="button"
                onClick={() => handleRemoveDepartment(dept)}
                className="remove-tag"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Eligible Graduation Years (Leave empty for all years)</label>
        <div className="input-with-button">
          <input
            type="number"
            value={yearInput}
            onChange={(e) => setYearInput(e.target.value)}
            placeholder="Enter graduation year"
            className="form-control"
            min="2000"
            max="2100"
          />
          <button type="button" onClick={handleAddYear} className="add-button">
            Add
          </button>
        </div>

        <div className="tags-container">
          {formData.eligibleGraduationYears.map((year, index) => (
            <div key={index} className="tag">
              {year}
              <button
                type="button"
                onClick={() => handleRemoveYear(year)}
                className="remove-tag"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <button type="submit" className="submit-button" disabled={isSubmitting}>
        {isSubmitting
          ? formType === "create"
            ? "Creating..."
            : "Updating..."
          : formType === "create"
          ? "Create Job"
          : "Update Job"}
      </button>
    </form>
  );
};

export default JobForm;
