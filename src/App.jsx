import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Cart from './components/Cart';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import ArtworkDetail from './pages/ArtworkDetail';
import artworksData from './data/Paintings.json';
import './App.css';

function App() {
  const artworks = artworksData;

  return (
    <Router>
      <div className="app">
        <Header />
        <Cart />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home artworks={artworks} />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/artwork/:id" element={<ArtworkDetail artworks={artworks} />} />
          </Routes>
        </main>

        <footer className="footer">
          <div className="footer-content">
            <p>&copy; {new Date().getFullYear()} OverwhelmingThinking. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
