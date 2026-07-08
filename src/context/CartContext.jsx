import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CartContext } from './cart-context';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { t } = useTranslation();

  const addToCart = (artwork) => {
    if (!cart.find(item => item.id === artwork.id)) {
      setCart([...cart, artwork]);
      alert(t('addedToCart'));
    } else {
      alert(t('alreadyInCart'));
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => {
      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        getTotal,
        isCartOpen,
        toggleCart,
        closeCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
