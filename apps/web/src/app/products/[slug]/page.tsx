'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star, Share2, Truck, Shield, RefreshCw, Check } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { getDiscountPercentage, getEffectivePrice } from '@/lib/productUtils';
import Button from '@/components/ui/Button';
import ProductReviews from '@/components/products/ProductReviews';
import { productApi } from '@/lib/api/productApi';
import { useDispatch, useSelector } from 'react-redux';
import { addItem as addToCart } from '@/store/slices/cartSlice';
import { addItem as addToWishlist, removeItem as removeFromWishlist } from '@/store/slices/wishlistSlice';
import { RootState } from '@/store';
import { cartApi } from '@/lib/api/cartApi';
import { wishlistApi } from '@/lib/api/wishlistApi';
import Link from 'next/link';

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23f9f0f3'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%23c29375'%3EAYEZA%3C/text%3E%3C/svg%3E";

export default function ProductPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productApi.getBySlug(slug),
    enabled: !!slug,
  });

  const isWishlisted = useSelector((state: RootState) =>
    product ? state.wishlist.items.some((item) => item._id === product._id) : false
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading product...</div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Product not found</p>
        <Link href="/shop">
          <Button>Back to Shop</Button>
        </Link>
      </div>
    );
  }

  const effectivePrice = getEffectivePrice(product);
  const discountPercentage = getDiscountPercentage(product);
  const brandName = typeof product.brand === 'object' ? product.brand?.name : product.brand;
  const images = product.images?.length ? product.images : [{ url: PLACEHOLDER, alt: product.name, isMain: true }];

  const handleAddToCart = async () => {
    dispatch(
      addToCart({
        product: {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          images: product.images ?? [],
          basePrice: product.basePrice,
        },
        quantity,
        price: effectivePrice,
        total: effectivePrice * quantity,
      })
    );
    if (isAuthenticated) {
      try {
        await cartApi.addItem({ productId: product._id, quantity });
      } catch {
        // optimistic UI
      }
    }
    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 2000);
  };

  const handleWishlist = async () => {
    if (isWishlisted) {
      dispatch(removeFromWishlist(product._id));
      if (isAuthenticated) {
        try {
          await wishlistApi.remove(product._id);
        } catch {
          // best-effort
        }
      }
    } else {
      dispatch(
        addToWishlist({
          _id: product._id,
          name: product.name,
          slug: product.slug,
          images: product.images ?? [],
          basePrice: product.basePrice,
          compareAtPrice: product.compareAtPrice,
          rating: product.rating,
          reviewCount: product.reviewCount,
        })
      );
      if (isAuthenticated) {
        try {
          await wishlistApi.add(product._id);
        } catch {
          // best-effort
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-rose-gold">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-rose-gold">Shop</Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden luxury-border">
              <img
                src={images[selectedImage]?.url || PLACEHOLDER}
                alt={images[selectedImage]?.alt || product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PLACEHOLDER;
                }}
              />
              {discountPercentage > 0 && (
                <div className="absolute top-4 left-4 bg-rose-gold text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{discountPercentage}%
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-4">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all',
                      selectedImage === index ? 'border-rose-gold' : 'border-gray-200'
                    )}
                  >
                    <img src={image.url || PLACEHOLDER} alt={image.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              {brandName && <p className="text-rose-gold text-sm font-medium mb-2">{brandName}</p>}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-5 h-5',
                        i < Math.floor(product.rating) ? 'fill-rose-gold text-rose-gold' : 'text-gray-300'
                      )}
                    />
                  ))}
                </div>
                <span className="text-gray-600">({product.reviewCount} reviews)</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-gray-900">{formatPrice(effectivePrice)}</span>
              {product.compareAtPrice && product.compareAtPrice > effectivePrice && (
                <span className="text-xl text-gray-500 line-through">{formatPrice(product.compareAtPrice)}</span>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed">
              {product.description || product.shortDescription || 'Luxury cosmetics crafted for you.'}
            </p>

            <div className="flex items-center gap-4">
              <span className="text-gray-900 font-medium">Quantity:</span>
              <div className="flex items-center border-2 border-gray-200 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-2 border-x border-gray-200">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
              </div>
              <span className="text-sm text-gray-500">{product.stock} in stock</span>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={cn(
                  'flex-1 py-4 text-lg font-medium flex items-center justify-center gap-2',
                  isAddedToCart ? 'bg-green-600 hover:bg-green-700' : ''
                )}
              >
                {isAddedToCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </Button>
              <Button
                onClick={handleWishlist}
                variant="outline"
                className={cn(
                  'px-6 py-4 border-2',
                  isWishlisted
                    ? 'border-rose-gold bg-rose-gold text-white hover:bg-rose-gold-dark'
                    : 'border-gray-300 bg-white text-gray-800 hover:border-rose-gold hover:text-rose-gold'
                )}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-pressed={isWishlisted}
              >
                <Heart className={cn('w-5 h-5', isWishlisted && 'fill-current')} />
              </Button>
              <Button variant="outline" className="px-6 py-4 border-2 border-gray-300 bg-white text-gray-800 hover:border-rose-gold hover:text-rose-gold">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto mb-2 text-rose-gold" />
                <p className="text-sm text-gray-600">Free Shipping</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto mb-2 text-rose-gold" />
                <p className="text-sm text-gray-600">Secure Payment</p>
              </div>
              <div className="text-center">
                <RefreshCw className="w-6 h-6 mx-auto mb-2 text-rose-gold" />
                <p className="text-sm text-gray-600">Easy Returns</p>
              </div>
            </div>
          </motion.div>
        </div>

        <ProductReviews productId={product._id} />
      </div>
    </div>
  );
}
