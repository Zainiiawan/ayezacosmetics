'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { RootState } from '@/store';
import ProductCard from '@/components/products/ProductCard';
import Button from '@/components/ui/Button';
import { removeItem, setWishlistItems } from '@/store/slices/wishlistSlice';
import { addItem as addToCart } from '@/store/slices/cartSlice';
import { wishlistApi } from '@/lib/api/wishlistApi';
import { cartApi } from '@/lib/api/cartApi';
import { Product } from '@/lib/api/productApi';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;
    wishlistApi.getAll().then((products: Product[]) => {
      dispatch(
        setWishlistItems(
          products.map((p) => ({
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
    }).catch(() => {});
  }, [isAuthenticated, dispatch]);

  const handleRemoveFromWishlist = async (productId: string) => {
    dispatch(removeItem(productId));
    if (isAuthenticated) {
      try {
        await wishlistApi.remove(productId);
      } catch {
        // best-effort
      }
    }
  };

  const handleAddAllToCart = async () => {
    for (const product of wishlistItems) {
      dispatch(
        addToCart({
          product: {
            _id: product._id,
            name: product.name,
            slug: product.slug,
            images: product.images,
            basePrice: product.basePrice,
          },
          quantity: 1,
          price: product.basePrice,
          total: product.basePrice,
        })
      );
      if (isAuthenticated) {
        try {
          await cartApi.addItem({ productId: product._id, quantity: 1 });
        } catch {
          // continue
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-black mb-1">My Wishlist</h1>
              <p className="text-gray-600">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
            {wishlistItems.length > 0 && (
              <Button onClick={handleAddAllToCart}>
                <ShoppingBag className="w-4 h-4 mr-2" />
                Add All to Cart
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {wishlistItems.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {wishlistItems.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  <ProductCard
                    product={{
                      ...product,
                      isFeatured: false,
                      images: product.images.map((img) => ({ ...img, isMain: true })),
                    }}
                  />
                  <button
                    onClick={() => handleRemoveFromWishlist(product._id)}
                    className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-red-50 transition-colors z-20"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </motion.div>
              ))}
            </div>
            <div className="text-center">
              <Link href="/shop">
                <Button variant="outline">Continue Shopping</Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-rose-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-rose-gold" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-black mb-2">Your wishlist is empty</h2>
              <p className="text-gray-600 mb-6">
                Save your favorite products by clicking the heart icon on any product
              </p>
              <Link href="/shop">
                <Button>Start Shopping</Button>
              </Link>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
