import React from 'react';

const BusinessIntelligence = () => {
  const styles = `
    .content-aboutus {
        background-color: #fff;
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 600px;
        margin: 40px auto;
        color: #333;
    }

    .content-aboutus h1 {
        text-align: center;
        margin-bottom: 30px;
    }
    
    .content-aboutus p {
        color: #333;
    }

    .content-aboutus ul {
        color: #333;
        list-style-position: inside;
        text-align: left;
    }

    .content-aboutus .submit-button {
        display: block;
        width: 160px;
        padding: 12px;
        background-color: #63b3ed;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 18px;
        transition: background-color 0.3s ease;
        margin: 20px auto 0;
        text-decoration: none;
        text-align: center;
    }

    .content-aboutus .submit-button:hover {
        background-color: #4299e1;
    }
  `;
  return (
    <>
      <style>{styles}</style>
      <div className="content-aboutus">
        <h1>Business Intelligence</h1>
        <p>Unlock the power of your data with Grasent's Business Intelligence services. We provide data-driven insights, custom dashboards, and AI-powered analytics to optimize your operations.</p>
      </div>
    </>
  );
};

export default BusinessIntelligence;
