import React from 'react';
import { Link } from 'react-router-dom';
import AboutUsContent from '../components/AboutUsContent';
import ChatWidget from '../components/chat-window/ChatWidget';

const Home = () => {
  return (
    <div>
      <div className="content" style={{ height: '80vh' }}>
        <h1>Grasent</h1>
        <p>Committed to resolving bottlenecks for businesses and raising capital.</p>
        <Link to="/about" className="learn-more">About Us</Link>
      </div>
      <AboutUsContent/>
      <ChatWidget />
      {/* You can add other sections/components here as needed */}
    </div>
  );
};

export default Home;