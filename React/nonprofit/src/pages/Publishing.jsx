import React from 'react';
import { Link } from 'react-router-dom';
import ChatWidget from '../components/chat-window/ChatWidget';
import projectData from './projects.json';

const Publishing = () => {
  return (
    <>
      <div className="projectlist">
        <div className="content" style={{ height: '80vh' }}>
          <h1>Publishing for Purpose</h1>
          <p>Amplifying the Gospel message through innovative projects.</p>
        </div>
        <div className="content-section">
          <div className="content-bigcard">
            <h1>What We Do</h1>
            <p>We bring Kingdom visions to life by engaging in the Development, Funding, and Publishing for Faith-Driven Projects.</p>
            <p>We believe in the power of innovative projects to share the Gospel and deepen biblical understanding.</p>
            <h3>Imagine a single partner who can help you:</h3>
            <ul>
              <li><strong>Build It:</strong> From concept to creation, we provide the technical development to bring your Gospel-sharing apps, educational platforms, or digital ministries to life.</li>
              <li><strong>Fund It:</strong> We diligently source and secure the necessary funding, connecting your Christ-centered initiatives with passionate investors and financial opportunities.</li>
              <li><strong>Launch It:</strong> Our publishing expertise ensures your Gospel-focused project reaches its intended audience effectively, generating widespread engagement and spiritual impact.</li>
            </ul>
            <br/>
          </div>
        </div>
        <h1 className="heading">Our Projects</h1>
        <div className="project-grid">
          {projectData['projects'].map((project) => (
            <Link to={`/project/${project.id}`} key={project.id} className="project-card">
              <img src={project.image} alt={project.name} />
              <div className="project-card-overlay">
                <h3>{project.name}</h3>
                <p>{project.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <section className="cta">
      <p>Got a groundbreaking project but need the right resources to make it a reality? We're your all-in-one solution for turning brilliant ideas into impactful successes.</p>
        <Link to="/contact" className="learn-more">Contact Us Today</Link> {/* Reusing learn-more for consistency */}
      </section>
      <ChatWidget />
      </>
  );
};

export default Publishing;
