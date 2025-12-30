import React from 'react';
import Hero from '../components/Hero';
import Gallery from '../components/Gallery';

const Home = ({ artworks }) => {
  return (
    <div className="home-page">
      <Hero artworks={artworks.slice(0, 5)} />
      <Gallery artworks={artworks} />
    </div>
  );
};

export default Home;
