import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Background from './Background';

const Layout = ({ children }) => {
  return (
    <>
      <Background />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default Layout;