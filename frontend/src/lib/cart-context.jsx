import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('elite-catering-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('elite-catering-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const [globalGuests, setGlobalGuests] = useState(1);

  useEffect(() => {
    const savedGlobalGuests = localStorage.getItem('elite-catering-global-guests');
    if (savedGlobalGuests) setGlobalGuests(parseInt(savedGlobalGuests));
  }, []);

  useEffect(() => {
    localStorage.setItem('elite-catering-global-guests', globalGuests.toString());
  }, [globalGuests]);

  const addToCart = (item) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev;
      }
      return [...prev, { ...item, quantity: globalGuests }];
    });
  };

  const updateGlobalGuests = (count) => {
    const val = parseInt(count) || 1;
    setGlobalGuests(val);
    setCartItems(prev => prev.map(item => ({ ...item, quantity: val })));
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    setCartItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, quantity: Math.max(1, parseInt(newQuantity) || 1) }
          : i
      )
    );
  };

  const clearCart = () => setCartItems([]);

  const totalItemsCount = cartItems.length;

  const totalGuests = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      totalItems: totalItemsCount,
      totalGuests,
      globalGuests,
      updateGlobalGuests
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
