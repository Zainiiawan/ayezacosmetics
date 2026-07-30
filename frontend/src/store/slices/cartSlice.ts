import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  product: {
    _id: string;
    name: string;
    slug: string;
    images: Array<{ url: string; alt?: string }>;
    basePrice: number;
  };
  variant?: string;
  quantity: number;
  price: number;
  total: number;
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  couponCode: string | null;
  total: number;
  isOpen: boolean;
}

const initialState: CartState = {
  items: [],
  subtotal: 0,
  shippingCost: 0,
  discount: 0,
  couponCode: null,
  total: 0,
  isOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) =>
          item.product._id === action.payload.product._id &&
          item.variant === action.payload.variant
      );

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
        existingItem.total = existingItem.quantity * existingItem.price;
      } else {
        state.items.push(action.payload);
      }

      cartSlice.caseReducers.calculateTotals(state);
    },
    removeItem: (state, action: PayloadAction<{ productId: string; variant?: string }>) => {
      state.items = state.items.filter(
        (item) =>
          !(item.product._id === action.payload.productId && item.variant === action.payload.variant)
      );
      cartSlice.caseReducers.calculateTotals(state);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; variant?: string; quantity: number }>
    ) => {
      const item = state.items.find(
        (item) =>
          item.product._id === action.payload.productId && item.variant === action.payload.variant
      );

      if (item) {
        item.quantity = action.payload.quantity;
        item.total = item.quantity * item.price;
      }

      cartSlice.caseReducers.calculateTotals(state);
    },
    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.shippingCost = 0;
      state.discount = 0;
      state.couponCode = null;
      state.total = 0;
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
    calculateTotals: (state) => {
      state.subtotal = state.items.reduce((sum, item) => sum + item.total, 0);
      state.total = state.subtotal + state.shippingCost - state.discount;
    },
    setDiscount: (state, action: PayloadAction<number>) => {
      state.discount = action.payload;
      cartSlice.caseReducers.calculateTotals(state);
    },
    setCouponCode: (state, action: PayloadAction<string | null>) => {
      state.couponCode = action.payload;
    },
    setShippingCost: (state, action: PayloadAction<number>) => {
      state.shippingCost = action.payload;
      cartSlice.caseReducers.calculateTotals(state);
    },
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      cartSlice.caseReducers.calculateTotals(state);
    },
  },
});

export const {
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  toggleCart,
  setCartOpen,
  setDiscount,
  setCouponCode,
  setShippingCost,
  setCartItems,
} = cartSlice.actions;

export default cartSlice.reducer;