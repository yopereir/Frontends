import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const GOOGLE_APPSCRIPT_CONTACT_URL = "https://script.google.com/macros/s/AKfycbzhJx9rCTYPPQvBVgYTKKhqow9NjeO2jXo4UclMJwJYv3dDyJ_Mup4BXFPQeGiYI_KcXg/exec";

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state to track submission in progress
  const [submissionError, setSubmissionError] = useState(null); // New state for general submission errors

  const styles = `
    .contact-form-container {
        background-color: #fff;
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        width: 80%;
        max-width: 600px;
        margin: 40px auto;
        color: #333;
    }
    .contact-form-container h1 {
        text-align: center;
        margin-bottom: 30px;
    }
    .form-group { margin-bottom: 20px; }
    .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
    }
    .form-group input, .form-group textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        box-sizing: border-box;
        font-size: 16px;
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
        transition: background-color 0.3s ease;
    }
    .submit-button:disabled {
        background-color: #a0aec0; /* Lighter color when disabled */
        cursor: not-allowed;
    }
    .thank-you-message { text-align: center; font-size: 1.2em; padding: 20px; }
    .submission-error-message {
        color: red;
        text-align: center;
        margin-top: 15px;
        font-size: 15px;
    }
  `;

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Please enter your name';
    if (!formData.email) {
      newErrors.email = 'Please enter your email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.message) newErrors.message = 'Please enter your message';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions if already submitting
    if (isSubmitting) {
      return;
    }

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmissionError(null); // Clear any previous submission errors
      return;
    }

    setIsSubmitting(true); // Set submitting state to true
    setSubmissionError(null); // Clear any previous submission errors
    setErrors({}); // Clear field-specific errors

    const body = new URLSearchParams();
    body.append('name', formData.name);
    body.append('email', formData.email);
    body.append('message', formData.message);

    try {
      await fetch(GOOGLE_APPSCRIPT_CONTACT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmissionError('There was an error submitting the form. Please try again.');
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear the specific field error when the user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
    // Clear general submission error if it exists
    if (submissionError) {
      setSubmissionError(null);
    }
  };

  if (isSubmitted) {
    return (
      <>
        <style>{styles}</style>
        <div className="contact-form-container">
          <div className="thank-you-message">
            Thank you for reaching out!<br />We will get back to you soon!
          </div>
          {/* Using a regular button with an onClick handler for navigation */}
          <button className="submit-button" onClick={() => window.location.href = "/"}>
            Home Page
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="contact-form-container">
        <h1>Contact Us</h1>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input type="text" id="name" name="name" placeholder="Enter your Name" value={formData.name} onChange={handleChange} />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" placeholder="Enter your E-mail" value={formData.email} onChange={handleChange} />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="message">Message:</label>
            <textarea id="message" name="message" placeholder="Enter your Message" value={formData.message} onChange={handleChange}></textarea>
            {errors.message && <div className="error-message">{errors.message}</div>}
          </div>
          {submissionError && <div className="submission-error-message">{submissionError}</div>}
          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </>
  );
};

export default ContactForm;
