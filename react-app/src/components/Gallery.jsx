import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ArtworkCard from './ArtworkCard';
import './Gallery.css';

const Gallery = ({ artworks }) => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { key: 'all', label: t('allArtworks') },
    { key: 'Cows and Bulls', label: t('cowsBulls') },
    { key: 'Pure Abstract', label: t('pureAbstract') },
    { key: 'Semi Abstract', label: t('semiAbstract') },
    { key: 'Photos', label: t('photos') }
  ];

  const filteredArtworks = activeCategory === 'all'
    ? artworks
    : artworks.filter(art => art.category === activeCategory);

  return (
    <div className="gallery-section" id="gallery">
      <div className="gallery-container">
        {/* Category filters */}
        <div className="category-filters">
          {categories.map(cat => (
            <button
              key={cat.key}
              className={`category-filter-btn ${activeCategory === cat.key ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Artwork grid */}
        <div className="gallery-grid">
          {filteredArtworks.map(artwork => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>

        {filteredArtworks.length === 0 && (
          <div className="no-artworks">
            <p>Nessuna opera trovata in questa categoria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
