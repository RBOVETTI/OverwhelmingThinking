import React from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import './Header.css';

const Header = () => {
  const { t, i18n } = useTranslation();
  const { cart, toggleCart } = useCart();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const activeCategory = searchParams.get('category') || 'all';
  const isHomePage = location.pathname === '/';

  return (
    <header className="header">
      {/* Top banner */}
      <div className="header-banner">
         Per gioco, per sfida verso me stesso, sicuramente non con vellietà artistiche mi sono messo a pasticciare .. e questo è il risultato .. Teniamoci in contatto, se possibile
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
            {/* Language switcher - DISABLED temporarily */}
            <div className="language-switcher">
              <button
                className="lang-btn active"
                disabled
                style={{ cursor: 'default' }}
              >
                IT
              </button>
              <span className="lang-divider">|</span>
              <button
                className="lang-btn"
                disabled
                style={{ cursor: 'default', opacity: 0.5 }}
              >
                EN
              </button>
            </div>

            {/* Cart icon */}
            <button className="icon-btn cart-btn" onClick={toggleCart}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 2L7 6H3l2 14h14l2-14h-4l-2-4H9zM9 2v4M15 2v4M9 10v6M15 10v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
            </button>

            {/* Home link to parent site */}
            <a
              href="https://www.rbovetti.com"
              className="icon-btn home-btn"
              title="Torna a rbovetti.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Category navigation */}
      <div className="header-categories">
        <div className="header-container">
          <nav className="category-nav">
            <Link
              to="/?category=all"
              className={`category-link ${isHomePage && activeCategory === 'all' ? 'active' : ''}`}
            >
              {t('allArtworks')}
            </Link>
            <Link
              to="/?category=Cows and Bulls"
              className={`category-link ${isHomePage && activeCategory === 'Cows and Bulls' ? 'active' : ''}`}
            >
              {t('cowsBulls')}
            </Link>
            <Link
              to="/?category=Pure Abstract"
              className={`category-link ${isHomePage && activeCategory === 'Pure Abstract' ? 'active' : ''}`}
            >
              {t('pureAbstract')}
            </Link>
            <Link
              to="/?category=Semi Abstract"
              className={`category-link ${isHomePage && activeCategory === 'Semi Abstract' ? 'active' : ''}`}
            >
              {t('semiAbstract')}
            </Link>
            <Link
              to="/?category=Photos"
              className={`category-link ${isHomePage && activeCategory === 'Photos' ? 'active' : ''}`}
            >
              {t('photos')}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
