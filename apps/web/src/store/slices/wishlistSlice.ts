import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WishlistItem {
  _id: string;
  name: string;
  slug: string;
  images: Array<{ url: string; alt?: string }>;
  basePrice: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
}

interface WishlistState {
  items: WishlistItem[];
  isOpen: boolean;
}

const initialState: WishlistState = {
  items: [],
  isOpen: false,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<WishlistItem>) => {
      const exists = state.items.find((item) => item._id === action.payload._id);
      if (!exists) {
        state.items.push(action.payload);
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
    },
    clearWishlist: (state) => {
      state.items = [];
    },
    toggleWishlist: (state) => {
      state.isOpen = !state.isOpen;
    },
    setWishlistOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
    setWishlistItems: (state, action: PayloadAction<WishlistItem[]>) => {
      state.items = action.payload;
    },
  },
});

export const {
  addItem,
  removeItem,
  clearWishlist,
  toggleWishlist,
  setWishlistOpen,
  setWishlistItems,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;