import React from 'react';
import { Link } from 'react-router-dom';

const ProjectList = () => {
  const projects = [
    {
      id: 'road-rage',
      name: 'Road Rage',
      image: '/assets/RoadRage.webp',
      description: 'Inspired by the classic Road Rash game of the 90s, this project aims to keep the same gameplay mechanics, the same humor and the same Grudge theme, while adding modern features like 4K resolution sprites, multiplayer and cloud-saving.',
    },
    {
      id: 'socratic-discussion',
      name: 'Socratic Discussion',
      image: '/assets/socraticDiscussion.webp',
      description: 'This innovative project aims to create a new sub-genre in gaming, specifically focused on Debating.',
    },
    {
      id: 'elf-bowling',
      name: 'Elf Bowling',
      image: '/assets/elfBowlingPoster.webp',
      description: 'Inspired by the classic Elf Bowling game of the 90s, this project aims to keep the same gameplay mechanics and humor, while adding modern features like 4K resolution models, multiplayer and cloud-saving.',
    },
  ];

  return (
    <>
      <div className="projectlist">
        <div className="content" style={{ height: '80vh' }}>
          <h1>Publishing</h1>
          <p>Bringing Visions to Life: Your Partner in development, funding and publishing</p>
        </div>
        <div className="content-bigcard">
          <h1>What we do</h1>
          <p>We act as publishers, bringing your finished projects to market with strategic flair. We're also experienced developers, providing the technical expertise and hands-on execution to build out your vision. And crucially, we're expert fund sourcers, connecting your projects with the capital they need to thrive.</p>
          <h3>Imagine a single partner who can:</h3>
          <ul>
            <li><strong>Build It:</strong> Find the perfect long-term addition to your team with our comprehensive direct hire solutions.</li>
            <li><strong>Fund It:</strong> Scale your workforce up or down with flexibility, leveraging our skilled contract IT professionals for short-term projects or ongoing support.</li>
            <li><strong>Launch It:</strong> Navigate the world of Web3 with confidence. We specialize in sourcing talent for blockchain, decentralized finance (DeFi), NFTs, and other emerging Web3 technologies.</li>
          </ul>
          <br/>
        </div>
        <h1 className="heading">Our Projects</h1>
        <div className="project-grid">
          {projects.map((project) => (
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
      </>

  );
};

export default ProjectList;
