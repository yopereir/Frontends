import React from 'react';
import { Link } from 'react-router-dom';

const AboutUsContent = () => {
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
        <h1>About Us</h1>
        <p>We are a dynamic team of engineers, investors, and entrepreneurs passionate about unlocking business potential. We specialize in identifying and resolving bottlenecks, securing capital, and driving growth for businesses of all sizes.</p>
        <p>Our core principles are:</p>
        <ul>
            <li><strong>Value-Based Consulting:</strong> Delivering measurable results that align with your strategic goals.</li>
            <li><strong>Empowering Autonomy:</strong> Fostering independence to boost productivity and innovation.</li>
            <li><strong>Freedom from Vendor Lock-In:</strong> Providing flexible solutions that keep you in control.</li>
        </ul>
        <br />
        <p>Partner with us to achieve your ambitions. Contact us today to learn how we can help you reach your goals.</p>
        <Link to="/contact" className="submit-button">Contact Us</Link>
      </div>
    </>
  );
};

export default AboutUsContent;
