import React from 'react';
import JobForm from '../components/JobForm';
import ChatWidget from '../components/chat-window/ChatWidget';

const JobRequest = () => {
  return (
    <div>
      {/* Hero Section for About Us */}
      <section className="bi-hero" style={{backgroundColor: "#0000"}}> {/* Reusing bi-hero for consistent full-width header style */}
        <h1>Employee Sourcing</h1>
        <p>We work with a network of Christ followers who are Subject Matter Experts instead of Recruiters to source qualified Candidates and guarantee Candidate retention for at least 6 months.</p>
        <p>We also guarantee that the candidate we find is not only technically qualified, but also aligns in Faith-based values.</p>
      </section>
      <div className="content-bigcard">
        <h1>What we do</h1>
        <ul>
          <li><strong>Direct Hire:</strong> Find the perfect long-term addition to your team with our comprehensive direct hire solutions.</li>
          <li><strong>Contract Staffing:</strong> Scale your workforce up or down with flexibility, leveraging our skilled contract IT professionals for short-term projects or ongoing support.</li>
          <li><strong>Web3 Hiring:</strong> Navigate the world of Web3 with confidence. We specialize in sourcing talent for blockchain, decentralized finance (DeFi), NFTs, and other emerging Web3 technologies.</li>
          <li><strong>International Payroll:</strong> We streamline your global payroll, making it effortless to pay your talent, no matter where they are.</li>
        </ul>
        <br />
      </div>
      <section className="bi-columns-section">
        <div className="bi-column">
          <h2>Retention guaranteed</h2>
          <p>We guarantee finding quality candidates and will refund any commission if issues arise.</p>
        </div>

        <div className="bi-column">
          <h2>Faith aligned, qualified candidates</h2>
          <p>Instead of using traditional recruiters, we use our network of people who share the same Christian values and who are already working in similar roles to get genuine candidates.</p>
        </div>

        <div className="bi-column">
          <h2>Global Payroll, Local Currency</h2>
          <p>We streamline complexities of international payroll while you pay to single account in your local currency.</p>
        </div>
      </section>
      <JobForm />
      <ChatWidget />
    </div>
  );
};

export default JobRequest;