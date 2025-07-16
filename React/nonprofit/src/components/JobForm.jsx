import React, { useState } from 'react';

const GOOGLE_APPSCRIPT_JOB_URL = "https://script.google.com/macros/s/AKfycbwKI_63iPjoV6rTpsKVXP-xnWvxsZzV3wRIXyglkt7gcf8f67zG8T8TNG3_MfDHSIeI4w/exec";

const JobForm = () => {
  const [formData, setFormData] = useState({
    companyname: '',
    name: '',
    email: '',
    jobtype: 'remote',
    location: '',
    jobdescription: '',
    salary: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const styles = `
    .job-form-container {
        background-color: #fff;
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        width: 80%;
        max-width: 600px;
        margin: 40px auto;
        color: #333;
    }
    .job-form-container h1, .job-form-container h3 {
        text-align: center;
        margin-bottom: 20px;
    }
    .form-group { margin-bottom: 20px; }
    .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
    }
    .form-group input, .form-group textarea, .form-group select {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        box-sizing: border-box;
        font-size: 16px;
        color: #333;
    }
    .error-message { color: red; font-size: 14px; margin-top: 5px; }
    .submit-button {
        display: block;
        width: 160px;
        padding: 12px;
        background-color: #63b3ed;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 18px;
        margin: 0 auto;
    }
    .thank-you-message { text-align: center; font-size: 1.2em; padding: 20px; }
  `;

  const validate = () => {
    const newErrors = {};
    if (!formData.companyname) newErrors.companyname = "Please enter your company's name";
    if (!formData.name) newErrors.name = 'Please enter your name';
    if (!formData.email) {
      newErrors.email = 'Please enter your email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.jobdescription) newErrors.jobdescription = 'Please enter the Job Description';
    if (!formData.salary) newErrors.salary = 'Please enter the total compensation for the role.';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const body = new URLSearchParams();
    for (const key in formData) {
        body.append(key, formData[key]);
    }

    try {
      await fetch(GOOGLE_APPSCRIPT_JOB_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ form: 'There was an error submitting the form. Please try again.' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  if (isSubmitted) {
    return (
      <>
        <style>{styles}</style>
        <div className="job-form-container">
          <div className="thank-you-message">
            Thank you for your submission!<br />We will get back to you soon.
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="job-form-container">
        <h1>Job Form</h1>
        <p>Our efficient sourcing and vetting processes means you fill critical roles faster, usually within 2-4 weeks.</p>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="companyname">Company Name:</label>
            <input type="text" id="companyname" name="companyname" placeholder="Enter your comapny's name" value={formData.companyname} onChange={handleChange} />
            {errors.companyname && <div className="error-message">{errors.companyname}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input type="text" id="name" name="name" placeholder="Enter your name" value={formData.name} onChange={handleChange} />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="jobtype">Job Type:</label>
            <select id="jobtype" name="jobtype" value={formData.jobtype} onChange={handleChange}>
              <option value="in-office">In-Office</option>
              <option value="hybrid">Hybrid</option>
              <option value="remote">Remote</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="location">Job Location (optional):</label>
            <input type="text" id="location" name="location" placeholder="Enter the expected job location or timezone of the job." value={formData.location} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="jobdescription">Job Description:</label>
            <textarea id="jobdescription" name="jobdescription" placeholder="Enter the Job Description including any Requirements." value={formData.jobdescription} onChange={handleChange}></textarea>
            {errors.jobdescription && <div className="error-message">{errors.jobdescription}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="salary">Salary:</label>
            <textarea id="salary" name="salary" value={formData.salary} placeholder="Enter the total compensation for the role. Example: $60/hr or $100,000 USD annually or 5 Ethereum per month" onChange={handleChange}></textarea>
            {errors.salary && <div className="error-message">{errors.salary}</div>}
          </div>
          {errors.form && <div className="error-message">{errors.form}</div>}
          <button type="submit" className="submit-button">Submit</button>
        </form>
      </div>
    </>
  );
};

export default JobForm;
