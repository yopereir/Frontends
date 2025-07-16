import React from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

const AboutUsContent = () => {
  return (
    <>
      <div className="content-bigcard">
        <h1>About Us</h1>
        <p>We are a passionate collective of Christians, united by a shared commitment to the Great Commission and living out our faith in every sphere of life.</p>
        <p>Our work is rooted in foundational principles that guide our every action:</p>
        <ul>
            <li><strong>Biblical Truth as Our Compass:</strong> We believe the Bible is the ultimate source of truth, illuminating our path and informing every decision (John 14:6).</li>
            <li><strong>Rooted in Christ:</strong> Our strength and purpose come from abiding in Christ, ensuring our efforts are spirit-led and fruitful (John 15:4).</li>
            <li><strong>Engaged in the World, Guided by the Word:</strong> We actively serve within the world, yet remain distinct, allowing biblical principles to shape our engagement and impact (John 17:14).</li>
        </ul>
        <br />
        <h4 style={{textAlign: "center"}}>Ready to amplify your impact for the Great Commission?</h4>
        <p>Connect with us today to discover how our unique approach and shared vision can support your ministry, project, or outreach efforts.</p>
        <Link to="/contact" className="submit-button">Contact Us</Link>
      </div>
    </>
  );
};

export default AboutUsContent;
