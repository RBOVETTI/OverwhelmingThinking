import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/useCart';
import './Cart.css';

const Cart = () => {
  const { t, i18n } = useTranslation();
  const { cart, removeFromCart, getTotal, isCartOpen, closeCart } = useCart();
  const navigate = useNavigate();

  const handleContactForPurchase = () => {
    closeCart();
    navigate('/contact');
  };

  return (
    <>
      {/* Overlay */}
      {isCartOpen && <div className="cart-overlay" onClick={closeCart} />}

      {/* Cart Sidebar */}
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>{t('cartTitle')}</h2>
          <button className="close-btn" onClick={closeCart}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="cart-content">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M9 2L7 6H3l2 14h14l2-14h-4l-2-4H9zM9 2v4M15 2v4M9 10v6M15 10v6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p>{t('cartEmpty')}</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map(item => {
                  const title = typeof item.title === 'object' ? item.title[i18n.language] : item.title;
                  const price = typeof item.price === 'string' ? item.price : item.price?.toString();

                  return (
                    <div key={item.id} className="cart-item">
                      <img src={`/${item.image}`} alt={title} className="cart-item-image" />
                      <div className="cart-item-info">
                        <h3>{title}</h3>
                        <p className="cart-item-price">€{price}</p>
                        <button
                          className="remove-btn"
                          onClick={() => removeFromCart(item.id)}
                        >
                          {t('removeBtn')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="cart-footer">
                <div className="cart-total">
                  <span>{t('cartTotal')}</span>
                  <span className="total-amount">€{getTotal().toFixed(2)}</span>
                </div>
                <button
                  className="contact-btn"
                  onClick={handleContactForPurchase}
                >
                  {t('cartContactBtn')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
