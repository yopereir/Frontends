import React from 'react';
import { Link } from 'react-router-dom'; // Assuming you use react-router-dom for navigation
import '../index.css'; // Ensure your CSS is imported
import AboutUsContent from '../components/AboutUsContent';
import ChatWidget from '../components/chat-window/ChatWidget';

const AboutUs = () => {
  return (
    <>
      <AboutUsContent />
      {/* Hero Section for About Us */}
      <section className="bi-hero"> {/* Reusing bi-hero for consistent full-width header style */}
        <h1>Complete IT Solutions</h1>
        <p>We are a dynamic team of engineers, investors, and entrepreneurs passionate about unlocking business potential. We specialize in identifying and resolving bottlenecks, securing capital, and driving growth for organizations of all sizes.</p>
      </section>

      {/* Principles Section (reusing bi-columns-section for layout) */}
      <section className="bi-columns-section">
        <div className="bi-column">
          <h2>Value-Based Consulting</h2>
          <p>We are committed to delivering measurable results that directly align with your strategic goals, ensuring every solution we provide adds tangible value to your organization.</p>
        </div>

        <div className="bi-column">
          <h2>IT Solutions Built for the Gospel Mission</h2>
          <p>We're more than just IT consultants; we're partners who believe in the power of technology to amplify your Kingdom impact.</p>
        </div>

        <div className="bi-column">
          <h2>Freedom from Vendor Lock-In</h2>
          <p>We believe in flexibility and control. Our solutions are designed to be adaptable and integrate seamlessly, freeing you from restrictive vendor dependencies and keeping you in command of your technology.</p>
        </div>
      </section>

      {/* Call to Action Section (can reuse content-bigcard or create a new one) */}
      {/* For simplicity and consistency, let's create a simpler call to action block, or keep content-bigcard if you prefer its styling for this section specifically.
          Let's make a new class for this to keep it distinct from the "big card" for forms, etc. */}
      <section className="cta">
        <p>Partner with us to achieve your vision. We are dedicated to helping you navigate challenges and seize opportunities for Kingdom work.</p>
        <Link to="/contact" className="learn-more">Contact Us Today</Link> {/* Reusing learn-more for consistency */}
      </section>
      <ChatWidget />
    </>
  );
};

export default AboutUs;