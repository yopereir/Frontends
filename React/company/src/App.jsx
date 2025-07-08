import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import JobRequest from './pages/JobRequest';
import BusinessIntelligence from './pages/BusinessIntelligence';
import ProjectList from './pages/ProjectList';
import ProjectInfo from './pages/ProjectInfo';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/jobrequest" element={<JobRequest />} />
        <Route path="/businessintelligence" element={<BusinessIntelligence />} />
        <Route path="/projectlist" element={<ProjectList />} />
        <Route path="/project/:projectId" element={<ProjectInfo />} />
      </Routes>
    </Layout>
  );
}

export default App;