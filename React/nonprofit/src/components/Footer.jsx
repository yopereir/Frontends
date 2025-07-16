import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer>
      <Link to="/about">About Us</Link>
      <Link to="/contact">Contact Us</Link>
      <Link to="/publishing">Projects</Link>
      <p style={{ display: 'block' }}>
        &copy;{new Date().getFullYear()} GraceSent.
      </p>
    </footer>
  );
};

export default Footer;
