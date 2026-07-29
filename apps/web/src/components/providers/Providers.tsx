'use client';

import { Provider, useDispatch } from 'react-redux';
import { store, AppDispatch } from '@/store';
import { QueryProvider } from '@/lib/api/queryClient';
import { ThemeProvider } from 'next-themes';
import { useEffect } from 'react';
import { fetchCurrentUser, setHydrated } from '@/store/slices/authSlice';
import { cartApi } from '@/lib/api/cartApi';
import { wishlistApi } from '@/lib/api/wishlistApi';
import { setCartItems, setCouponCode, setDiscount } from '@/store/slices/cartSlice';
import { setWishlistItems } from '@/store/slices/wishlistSlice';
import { mapApiCartToReduxItems } from '@/lib/cartUtils';
import { Product } from '@/lib/api/productApi';

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      dispatch(setHydrated());
      return;
    }

    dispatch(fetchCurrentUser())
      .unwrap()
      .then(async () => {
        try {
          const [cart, wishlist] = await Promise.all([
            cartApi.get(),
            wishlistApi.getAll(),
          ]);
          dispatch(setCartItems(mapApiCartToReduxItems(cart)));
          dispatch(setDiscount(cart.couponDiscount ?? 0));
          dispatch(setCouponCode(cart.couponCode ?? null));
          dispatch(
            setWishlistItems(
              wishlist.map((p: Product) => ({
                _id: p._id,
                name: p.name,
                slug: p.slug,
                images: p.images ?? [],
                basePrice: p.basePrice,
                compareAtPrice: p.compareAtPrice,
                rating: p.rating ?? 0,
                reviewCount: p.reviewCount ?? 0,
              }))
            )
          );
        } catch {
          // Cart/wishlist sync is best-effort on hydrate
        }
      })
      .catch(() => {
        // fetchCurrentUser rejection handled in authSlice
      })
      .finally(() => {
        dispatch(setHydrated());
      });
  }, [dispatch]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>
        <QueryProvider>
          <AuthHydrator>{children}</AuthHydrator>
        </QueryProvider>
      </ThemeProvider>
    </Provider>
  );
}
