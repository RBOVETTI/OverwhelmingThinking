import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = ({ artworks }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!artworks || artworks.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % artworks.length);
    }, 6000); // Change every 6 seconds

    return () => clearInterval(interval);
  }, [artworks]);

  if (!artworks || artworks.length === 0) {
    return null;
  }

  return (
    <div className="hero">
      <div className="hero-image-container">
        {artworks.map((artwork, index) => (
          <div
            key={artwork.id}
            className={`hero-image ${index === currentIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(/${artwork.image})` }}
          />
        ))}
        <div className="hero-overlay" />
      </div>

      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">{t('heroTitle')}</h1>
          <p className="hero-subtitle">{t('heroSubtitle')}</p>
          <div className="hero-buttons">
            <Link to="/#gallery" className="btn-primary">
              {t('heroButton')}
            </Link>
            <Link to="/about" className="btn-secondary">
              {t('heroLearnMore')}
            </Link>
          </div>
        </div>

        <div className="hero-indicators">
          {artworks.slice(0, 5).map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
