import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Adicionada a propriedade opcional 'image' para evitar o erro TS2339 no CartPage
export interface CartItem {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  image?: string; 
  qty: number;
}

// 2. Adicionada a assinatura da função clearCart na tipagem do Contexto
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void; 
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Carregar carrinho do localStorage ao iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCartItems(JSON.parse(savedCart));
  }, []);

  const addToCart = (product: any) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item._id === product._id);
      let newCart;
      if (existingItem) {
        newCart = prev.map((item) => item._id === product._id ? { ...item, qty: item.qty + 1 } : item);
      } else {
        newCart = [...prev, { ...product, qty: 1 }];
      }
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeFromCart = (id: string) => {
    const newCart = cartItems.filter((item) => item._id !== id);
    setCartItems(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateQty = (id: string, qty: number) => {
    if (qty < 1) return; // Não permite zero ou negativo
    setCartItems((prev) => {
      const newCart = prev.map((item) => item._id === id ? { ...item, qty } : item);
      localStorage.setItem('cart', JSON.stringify(newCart)); // Atualiza também o localStorage
      return newCart;
    });
  };

  // 3. Implementação da função clearCart que limpa o estado e o localStorage
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart deve ser usado dentro de um CartProvider');
  return context;
};