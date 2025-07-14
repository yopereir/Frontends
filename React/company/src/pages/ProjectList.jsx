import React from 'react';
import { Link } from 'react-router-dom';

const ProjectList = () => {
  const projects = [
    {
      id: 'road-rage',
      name: 'Road Rage',
      image: '/assets/road-rage.webp',
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
    <div className="projectlist">
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
  );
};

export default ProjectList;
