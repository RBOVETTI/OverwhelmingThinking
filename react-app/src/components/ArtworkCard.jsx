import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import './ArtworkCard.css';

const ArtworkCard = ({ artwork }) => {
  const { i18n } = useTranslation();
  const { addToCart } = useCart();

  const title = typeof artwork.title === 'object'
    ? artwork.title[i18n.language]
    : artwork.title;

  const getCategoryName = (category) => {
    const categoryMap = {
      'Cows and Bulls': i18n.language === 'it' ? 'Mucche e Tori' : 'Cows and Bulls',
      'Pure Abstract': i18n.language === 'it' ? 'Astratto Puro' : 'Pure Abstract',
      'Semi Abstract': i18n.language === 'it' ? 'Semi Astratto' : 'Semi Abstract',
      'Photos': i18n.language === 'it' ? 'Fotografie' : 'Photos'
    };
    return categoryMap[category] || category;
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(artwork);
  };

  return (
    <Link to={`/artwork/${artwork.id}`} className="artwork-card">
      <div className="artwork-image-wrapper">
        <img src={`/${artwork.image}`} alt={title} className="artwork-image" loading="lazy" />
        <div className="artwork-overlay">
          <button className="quick-add-btn" onClick={handleAddToCart}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 2L7 6H3l2 14h14l2-14h-4l-2-4H9zM9 2v4M15 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Aggiungi al carrello
          </button>
        </div>
      </div>
      <div className="artwork-info">
        <h3 className="artwork-title">{title}</h3>
        <p className="artwork-category">{getCategoryName(artwork.category)}</p>
        <div className="artwork-bottom">
          <p className="artwork-dimensions">{artwork.dimensions}</p>
          <p className="artwork-price">
            {artwork.price === 'SOLD' ? 'VENDUTO' : `€${artwork.price}`}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ArtworkCard;
