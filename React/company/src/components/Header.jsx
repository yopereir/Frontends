import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';

const ThemeIcon = ({ theme }) => {
  if (theme === 'light') {
    // Moon icon for dark mode
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    );
  }
  // Sun icon for light mode
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
};


const Header = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <header>
      <div className="logo"><Link to="/">Grasent</Link></div>
      <nav>
        <ul>
          <li className="services">
            <a href="#">Services</a>
            <div className="dropdown-content">
              <Link to="/jobrequest">Employee Sourcing</Link>
              <Link to="/businessintelligence">Business Intelligence</Link>
              <Link to="/projectlist">Funding</Link>
            </div>
          </li>
          <li><Link to="/about">About Us</Link></li>
          <li><Link to="/contact">Contact Us</Link></li>
          <li>
            <button className="theme-toggle" aria-label="Toggle Theme" onClick={toggleTheme}>
              <ThemeIcon theme={theme} />
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
