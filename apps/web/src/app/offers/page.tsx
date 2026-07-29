'use client';

import { useQuery } from '@tanstack/react-query';
import ProductCard from '@/components/products/ProductCard';
import { productApi } from '@/lib/api/productApi';
import { getEffectivePrice } from '@/lib/productUtils';

export default function OffersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['offers-products'],
    queryFn: () => productApi.getAll({ limit: 100 }),
  });

  const products = (data?.products ?? []).filter((p) => {
    const effective = getEffectivePrice(p);
    return (p.discount && p.discount.value > 0) || (p.compareAtPrice && p.compareAtPrice > effective);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-rose-gold text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-serif font-bold mb-4">Special Offers</h1>
          <p className="text-white/90">Exclusive deals on luxury beauty — limited time only</p>
        </div>
      </section>
      <div className="container mx-auto px-4 py-10">
        {isLoading ? (
          <p className="text-center text-gray-500 py-12">Loading offers…</p>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No active offers right now. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
