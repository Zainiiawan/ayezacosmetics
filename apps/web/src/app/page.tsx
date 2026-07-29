'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Sparkles, Truck, Shield, Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/products/ProductCard';
import { productApi } from '@/lib/api/productApi';
import { categoryApi } from '@/lib/api/categoryApi';

const whyChooseUs = [
  { title: 'Premium Quality', description: 'Only the finest ingredients for your skin', icon: Star },
  { title: 'Cruelty Free', description: 'We never test on animals — 100% ethical', icon: Shield },
  { title: 'Fast Delivery', description: 'Free shipping on orders over PKR 5,000', icon: Truck },
];

export default function Home() {
  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productApi.getAll({ isFeatured: true, limit: 4 }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getAll,
  });

  const featuredProducts = featuredData?.products ?? [];
  const featuredCategories = categories.slice(0, 3);

  return (
    <div className="flex flex-col">
      <section className="relative bg-gradient-to-br from-gray-50 to-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 bg-rose-gold/10 text-rose-gold px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                New Collection Available
              </span>
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-black mb-6 leading-tight">
                Discover Your <span className="text-rose-gold">True Beauty</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Luxury cosmetics curated for the modern woman. Experience the difference with premium skincare, makeup, and fragrances.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/shop">
                  <Button size="lg" className="w-full sm:w-auto">
                    Shop Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/categories">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Explore Categories
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-black mb-3">
              Shop by Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our carefully curated collections designed to enhance your natural beauty
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCategories.map((category, index) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/categories/${category.slug}`} className="block group">
                  <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 hover:shadow-luxury transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-rose-gold/0 group-hover:bg-rose-gold/5 transition-colors" />
                    <div className="relative">
                      {category.image?.url ? (
                        <img
                          src={category.image.url}
                          alt={category.name}
                          className="w-16 h-16 rounded-full object-cover mb-4"
                        />
                      ) : (
                        <div className="text-4xl mb-4">✨</div>
                      )}
                      <h3 className="text-2xl font-serif font-bold text-black mb-2 group-hover:text-rose-gold transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {category.description ?? 'Explore our collection'}
                      </p>
                      <span className="inline-flex items-center gap-1 text-rose-gold font-medium group-hover:gap-2 transition-all">
                        Shop Now
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-black mb-3">
              Featured Products
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our most loved products, trusted by thousands of customers
            </p>
          </motion.div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl aspect-square animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link href="/shop">
              <Button variant="outline" size="lg">
                View All Products
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-black mb-3">
              Why Choose AYEZA COSMETICS
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We are committed to delivering the best beauty experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyChooseUs.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-rose-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-rose-gold" />
                </div>
                <h3 className="text-xl font-serif font-bold text-black mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-black">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
              Get <span className="text-rose-gold">20% Off</span> Your First Order
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Subscribe to our newsletter and receive an exclusive discount on your first purchase.
            </p>
            <form
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-gold"
              />
              <button
                type="submit"
                className="bg-rose-gold text-white px-6 py-3 rounded-lg font-medium hover:bg-rose-gold-dark transition-colors whitespace-nowrap"
              >
                Get Discount
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
