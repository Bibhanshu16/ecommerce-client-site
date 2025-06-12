// CartContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const stored = localStorage.getItem('cartItems');
    return stored ? JSON.parse(stored) : [];
  });

  const [savedItems, setSavedItems] = useState(() => {
    const stored = localStorage.getItem('savedItems');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('savedItems', JSON.stringify(savedItems));
  }, [savedItems]);

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product_id === product.product_id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const increaseQuantity = (productId) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.product_id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (productId) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.product_id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const moveToSaved = (productId) => {
    setCartItems((prev) => {
      const toSave = prev.find((item) => item.product_id === productId);
      if (toSave) {
        setSavedItems((s) => [...s, toSave]);
        return prev.filter((item) => item.product_id !== productId);
      }
      return prev;
    });
  };

  const moveToCart = (productId) => {
    setSavedItems((prev) => {
      const toMove = prev.find((item) => item.product_id === productId);
      if (toMove) {
        addToCart(toMove);
        return prev.filter((item) => item.product_id !== productId);
      }
      return prev;
    });
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        savedItems,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        moveToSaved,
        moveToCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
