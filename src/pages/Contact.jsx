import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/useCart';
import './Contact.css';

const Contact = () => {
  const { t, i18n } = useTranslation();
  const { cart } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(t('contactSuccess'));
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  // Pre-fill message with cart items
  React.useEffect(() => {
    if (cart.length > 0) {
      const cartItems = cart.map(item => {
        const title = typeof item.title === 'object' ? item.title[i18n.language] : item.title;
        return `${title} (€${item.price})`;
      }).join('\n');

      setFormData(prev => ({
        ...prev,
        message: t('interestedIn') + cartItems
      }));
    }
  }, [cart, i18n.language, t]);

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <h1>{t('contactTitle')}</h1>
        <p>{t('contactText')}</p>
      </div>

      <div className="contact-container">
        <form className="contact-form" onsubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">{t('contactName')} *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">{t('contactEmail')} *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="subject">{t('contactSubject')} *</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">{t('contactMessage')} *</label>
            <textarea
              id="message"
              name="message"
              rows="8"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            {t('contactSend')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
