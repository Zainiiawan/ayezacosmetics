import { Product } from '@/lib/api/productApi';

export function getEffectivePrice(product: Pick<Product, 'basePrice' | 'discount'>): number {
  if (!product.discount) return product.basePrice;
  if (product.discount.type === 'percentage') {
    return product.basePrice * (1 - product.discount.value / 100);
  }
  return Math.max(0, product.basePrice - product.discount.value);
}

export function getDiscountPercentage(
  product: Pick<Product, 'basePrice' | 'compareAtPrice' | 'discount'>
): number {
  const effectivePrice = getEffectivePrice(product);
  if (product.compareAtPrice && product.compareAtPrice > effectivePrice) {
    return Math.round(((product.compareAtPrice - effectivePrice) / product.compareAtPrice) * 100);
  }
  if (product.discount?.type === 'percentage') return product.discount.value;
  return 0;
}
