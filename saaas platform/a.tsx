import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Define the interface for our Store state and actions
interface Store {
  cart: any[];
  wishlist: any[];
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  addToWishlist: (product: any) => void;
  removeFromWishlist: (id: string) => void;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],

      // Logic to add item to cart
      addToCart: (product: any) => {
        const isExist = get().cart.find((item) => item.id === product.id);
        if (!isExist) {
          set((state) => ({
            cart: [...state.cart, product],
          }));
        }
      },

      // Logic to remove item from cart
      removeFromCart: (id: string) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        }));
      },

      // Logic to add item to wishlist
      addToWishlist: (product: any) => {
        const isExist = get().wishlist.find((item) => item.id === product.id);
        if (!isExist) {
          set((state) => ({
            wishlist: [...state.wishlist, product],
          }));
        }
      },

      // Logic to remove item from wishlist
      removeFromWishlist: (id: string) => {
        set((state) => ({
          wishlist: state.wishlist.filter((item) => item.id !== id),
        }));
      },
    }),
    {
      name: "cart-storage", // Key name for LocalStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
















https://microservice-store.preview.emergentagent.com/?utm_source=share





//
main.ts

import express from 'express';
import * as path from 'path';

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to kafka-service!' });
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});

server.on('error', console.error);
//






