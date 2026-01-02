import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ArtworkCard from './ArtworkCard';
import './Gallery.css';

const Gallery = ({ artworks }) => {
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';

  const filteredArtworks = activeCategory === 'all'
    ? artworks
    : artworks.filter(art => art.category === activeCategory);

  return (
    <div className="gallery-section" id="gallery">
      <div className="gallery-container">
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
