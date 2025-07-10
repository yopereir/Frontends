import React from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

const AboutUsContent = () => {
  return (
    <>
      <div className="content-bigcard">
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
