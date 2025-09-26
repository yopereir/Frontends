import React, { useContext, useState } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    setServicesDropdownOpen(false); // Close dropdown when main menu is toggled
  };

  const toggleServicesDropdown = (event) => {
    event.preventDefault(); // Prevent default link behavior
    event.stopPropagation(); // Stop event from bubbling up
    setServicesDropdownOpen(!servicesDropdownOpen);
  };

  const handleNavLinkClick = () => {
    setMenuOpen(false); // Close main menu
    setServicesDropdownOpen(false); // Close services dropdown
  };

  return (
    <header>
      <div className="logo"><Link to="/" onClick={handleNavLinkClick}>Grasent</Link></div>
      <nav className={menuOpen ? 'menu-open' : ''}>
        <button className="hamburger-menu" onClick={toggleMenu} aria-label="Toggle navigation">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <ul className={menuOpen ? 'menu-open' : ''}>
          <li className="services">
            <a href="#" onClick={toggleServicesDropdown}>Services</a>
            <div className={`dropdown-content ${servicesDropdownOpen ? 'dropdown-open' : ''}`}>
              <Link to="/jobrequest" onClick={handleNavLinkClick}>Employee Sourcing</Link>
              <Link to="/businessintelligence" onClick={handleNavLinkClick}>Business Intelligence</Link>
              <Link to="/publishing" onClick={handleNavLinkClick}>Publishing</Link>
            </div>
          </li>
          <li><Link to="/about" onClick={handleNavLinkClick}>About Us</Link></li>
          <li><Link to="/contact" onClick={handleNavLinkClick}>Contact Us</Link></li>
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
