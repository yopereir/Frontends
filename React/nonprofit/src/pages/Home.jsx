import React from 'react';
import { Link } from 'react-router-dom';
import AboutUsContent from '../components/AboutUsContent';
import ChatWidget from '../components/chat-window/ChatWidget';

const Home = () => {
  return (
    <div>
      <div className="content" style={{ height: '80vh' }}>
        <h1>GraceSent</h1>
        <p>Committed to supporting the Gospel missions through innovation and capital.</p>
        <Link to="/about" className="learn-more">About Us</Link>
      </div>
      <div className="content-section">
        <AboutUsContent/>
      </div>
      <ChatWidget />
      {/* You can add other sections/components here as needed */}
    </div>
  );
};

export default Home;