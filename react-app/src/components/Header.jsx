import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import './Header.css';

const Header = () => {
  const { t, i18n } = useTranslation();
  const { cart, toggleCart } = useCart();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="header">
      {/* Top banner */}
      <div className="header-banner">
        Nuovi arrivi, selezioni dei curatori, caratteristiche esclusive - iscriviti alla nostra newsletter e ottieni il 10% di sconto sul tuo primo ordine
      </div>

      {/* Main header */}
      <div className="header-main">
        <div className="header-container">
          {/* Logo */}
          <Link to="/" className="logo">
            OverwhelmingThinking
          </Link>

          {/* Navigation */}
          <nav className="main-nav">
            <Link to="/" className="nav-link">{t('navHome')}</Link>
            <Link to="/about" className="nav-link">{t('navAbout')}</Link>
            <Link to="/contact" className="nav-link">{t('navContact')}</Link>
          </nav>

          {/* Right section */}
          <div className="header-right">
            {/* Search */}
            <div className="search-box">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                className="search-input"
              />
            </div>

            {/* Language switcher */}
            <div className="language-switcher">
              <button
                className={`lang-btn ${i18n.language === 'it' ? 'active' : ''}`}
                onClick={() => changeLanguage('it')}
              >
                IT
              </button>
              <span className="lang-divider">|</span>
              <button
                className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
                onClick={() => changeLanguage('en')}
              >
                EN
              </button>
            </div>

            {/* Favorites icon */}
            <button className="icon-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Cart icon */}
            <button className="icon-btn cart-btn" onClick={toggleCart}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 2L7 6H3l2 14h14l2-14h-4l-2-4H9zM9 2v4M15 2v4M9 10v6M15 10v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Category navigation */}
      <div className="header-categories">
        <div className="header-container">
          <nav className="category-nav">
            <Link to="/?category=all" className="category-link">{t('allArtworks')}</Link>
            <Link to="/?category=paintings" className="category-link">Pittura</Link>
            <Link to="/?category=photography" className="category-link">Fotografia</Link>
            <Link to="/?category=sculpture" className="category-link">Scultura</Link>
            <Link to="/?category=design" className="category-link">Disegno</Link>
            <Link to="/artists" className="category-link">Artisti</Link>
            <Link to="/special-offers" className="category-link special">Offerte speciali</Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
