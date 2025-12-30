import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import './ArtworkDetail.css';

const ArtworkDetail = ({ artworks }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();

  const artwork = artworks.find(art => art.id === parseInt(id));

  if (!artwork) {
    return (
      <div className="detail-page">
        <div className="detail-container">
          <p>Opera non trovata</p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Torna alla galleria
          </button>
        </div>
      </div>
    );
  }

  const title = typeof artwork.title === 'object'
    ? artwork.title[i18n.language]
    : artwork.title;

  const description = typeof artwork.description === 'object'
    ? artwork.description[i18n.language]
    : artwork.description;

  const technique = typeof artwork.technique === 'object'
    ? artwork.technique[i18n.language]
    : artwork.technique;

  const getCategoryName = (category) => {
    const categoryMap = {
      'Cows and Bulls': i18n.language === 'it' ? 'Mucche e Tori' : 'Cows and Bulls',
      'Pure Abstract': i18n.language === 'it' ? 'Astratto Puro' : 'Pure Abstract',
      'Semi Abstract': i18n.language === 'it' ? 'Semi Astratto' : 'Semi Abstract',
      'Photos': i18n.language === 'it' ? 'Fotografie' : 'Photos'
    };
    return categoryMap[category] || category;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'it' ? 'it-IT' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="detail-page">
      <div className="detail-container">
        <button className="back-btn" onClick={() => navigate('/')}>
          {t('backToGallery')}
        </button>

        <div className="detail-content">
          <div className="detail-image-section">
            <img src={`/${artwork.image}`} alt={title} className="detail-image" />
          </div>

          <div className="detail-info-section">
            <div className="detail-header">
              <span className="category-badge">{getCategoryName(artwork.category)}</span>
              <h1>{title}</h1>
            </div>

            <div className="detail-meta">
              {artwork.publicationDate && (
                <div className="meta-item">
                  <strong>{t('publicationDate')}</strong>
                  <span>{formatDate(artwork.publicationDate)}</span>
                </div>
              )}

              <div className="meta-item">
                <strong>{t('technique')}</strong>
                <span>{technique}</span>
              </div>

              <div className="meta-item">
                <strong>{t('dimensions')}</strong>
                <span>{artwork.dimensions}</span>
              </div>
            </div>

            <div className="detail-description">
              <p>{description}</p>
            </div>

            <div className="detail-price">
              {artwork.price === 'SOLD' ? (
                <span className="sold-tag">VENDUTO</span>
              ) : (
                <span className="price-tag">€{artwork.price}</span>
              )}
            </div>

            <div className="detail-actions">
              {artwork.price !== 'SOLD' && (
                <button
                  className="btn-primary btn-large"
                  onClick={() => addToCart(artwork)}
                >
                  {t('addToCart')}
                </button>
              )}
              <button
                className="btn-secondary btn-large"
                onClick={() => navigate('/contact')}
              >
                {t('contactArtist')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkDetail;
