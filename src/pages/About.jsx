import React from 'react';
import { useTranslation } from 'react-i18next';
import './About.css';

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="about-page">
      <div className="about-hero">
        <h1>{t('aboutTitle')}</h1>
      </div>

      <div className="about-container">
        <div className="about-content">
          <div className="about-text">
            <p className="about-paragraph">{t('aboutText1')}</p>
            <p className="about-paragraph">{t('aboutText2')}</p>
            <p className="about-paragraph">{t('aboutText3')}</p>
          </div>

          <div className="about-image-section">
            <div className="about-image-placeholder">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <p>Foto dell'artista</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
