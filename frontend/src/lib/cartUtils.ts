import { ApiCart } from '@/lib/api/cartApi';
import { CartItem } from '@/store/slices/cartSlice';

export function mapApiCartToReduxItems(cart: ApiCart): CartItem[] {
  return (cart.items ?? []).map((item) => ({
    product: {
      _id: String(item.product),
      name: item.name,
      slug: item.slug ?? '',
      images: item.image ? [{ url: item.image, alt: item.name }] : [],
      basePrice: item.price,
    },
    variant: item.variant,
    quantity: item.quantity,
    price: item.price,
    total: item.total,
  }));
}
