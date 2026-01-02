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
            <div className="about-image-container">
              <img
                src="/IMG/artist-photo.jpeg"
                alt="Artist portrait"
                className="about-artist-photo"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
