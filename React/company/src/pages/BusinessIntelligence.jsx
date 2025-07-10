import React from 'react';
import { HashLink } from 'react-router-hash-link';
import { Link } from 'react-router-dom';
import '../index.css'; // Ensure your CSS is imported

const BusinessIntelligence = () => {
  return (
    <>
      {/* Hero Section */}
      <div className="content" style={{ height: '80vh' }}>
        <h1>Business Intelligence</h1>
        <p>Transform Your Data into Strategic Advantage.</p>
        <HashLink to="#bi-hero" className="learn-more">Learn More</HashLink>
      </div>
      <section id="bi-hero" className="bi-hero">
        <h1></h1>
        <p>At Grasent, we don't just process data; we empower you with actionable insights that drive growth and optimize performance. Our Business Intelligence solutions are tailored to unlock your organization's full potential.</p>
        <p>Unlock the power of your data with Grasent's Business Intelligence services. We provide data-driven insights, custom dashboards, and AI-powered analytics to optimize your operations.</p>
      </section>

      {/* Three-Column Features Section */}
      <section className="bi-columns-section">
        <div className="bi-column">
          <h2>Data-Driven Insights</h2>
          <p>Harness the power of your raw data. We provide comprehensive data analysis to uncover hidden trends, predict future outcomes, and give you a clear understanding of your business landscape.</p>
        </div>

        <div className="bi-column">
          <h2>Customizable Dashboards</h2>
          <p>Visualize your success with intuitive, interactive dashboards. Tailored to your specific KPIs, our dashboards offer real-time monitoring and reporting, putting critical information at your fingertips.</p>
        </div>

        <div className="bi-column">
          <h2>AI-Powered Analytics</h2>
          <p>Step into the future with advanced AI and machine learning. Our intelligent analytics go beyond traditional reporting, offering predictive modeling, anomaly detection, and automated insights for proactive decision-making.</p>
        </div>
      </section>
      <section className="bi-hero">
        <h1></h1>
        <p>Unlock the power of your data with Grasent's Business Intelligence services. We provide data-driven insights, custom dashboards, and AI-powered analytics to optimize your operations.</p>
      </section>
      <section className="cta">
        <p>Partner with us to achieve your ambitions. We are dedicated to helping you navigate challenges and seize opportunities.</p>
        <Link to="/contact" className="learn-more">Contact Us Today</Link> {/* Reusing learn-more for consistency */}
      </section>
    </>
  );
};

export default BusinessIntelligence;
