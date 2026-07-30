'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Heart, User, Menu, X, LogOut, Shield } from 'lucide-react';
import NotificationBell from '@/components/notifications/NotificationBell';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { logout } from '@/store/slices/authSlice';
import Button from '@/components/ui/Button';

const Header = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const cartItemCount = useSelector((state: RootState) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const wishlistItemCount = useSelector(
    (state: RootState) => state.wishlist.items.length
  );

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Categories', href: '/categories' },
    { name: 'Offers', href: '/offers' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Track Order', href: '/track-order' },
    { name: 'Help', href: '/help' },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await dispatch(logout()).unwrap();
      router.push('/');
    } catch {
      router.push('/');
    } finally {
      setIsLoggingOut(false);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-black">
              AYEZA <span className="text-rose-gold">COSMETICS</span>
            </h1>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-rose-gold transition-colors font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-800 hover:bg-gray-100 hover:text-rose-gold rounded-full transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link href="/wishlist" className="p-2 text-gray-800 hover:bg-gray-100 hover:text-rose-gold rounded-full transition-colors relative" aria-label="Wishlist">
              <Heart className="w-5 h-5" />
              {wishlistItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-gold text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {wishlistItemCount > 99 ? '99+' : wishlistItemCount}
                </span>
              )}
            </Link>

            <Link href="/cart" className="p-2 text-gray-800 hover:bg-gray-100 hover:text-rose-gold rounded-full transition-colors relative" aria-label="Cart">
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-gold text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>

            <NotificationBell />

            {isAuthenticated && user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/account"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-rose-gold/10 transition-colors"
                >
                  <User className="w-4 h-4 text-rose-gold" />
                  <span className="text-sm font-medium text-gray-800 max-w-[100px] truncate">
                    {user.firstName}
                  </span>
                </Link>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="p-2 text-gray-800 hover:bg-gray-100 hover:text-rose-gold rounded-full transition-colors"
                    aria-label="Admin Panel"
                    title="Admin Panel"
                  >
                    <Shield className="w-5 h-5" />
                  </Link>
                )}
                <button
                  onClick={() => void handleLogout()}
                  disabled={isLoggingOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">{isLoggingOut ? 'Logging out…' : 'Logout'}</span>
                </button>
              </div>
            ) : (
              <Link href="/login" className="p-2 text-gray-800 hover:bg-gray-100 hover:text-rose-gold rounded-full transition-colors" aria-label="Account">
                <User className="w-5 h-5" />
              </Link>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100 bg-gray-50"
          >
            <div className="container mx-auto px-4 py-4">
              <form action="/shop" method="get" className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="search"
                  placeholder="Search for products, brands, categories..."
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/30 focus:outline-none"
                  autoFocus
                />
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden border-t border-gray-100 bg-white"
          >
            <nav className="container mx-auto px-4 py-4">
              <div className="flex flex-col gap-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-700 hover:text-rose-gold transition-colors font-medium py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                {isAuthenticated && user ? (
                  <>
                    <Link href="/account" className="text-gray-700 hover:text-rose-gold font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>
                      My Account ({user.firstName})
                    </Link>
                    {user.role === 'admin' && (
                      <Link href="/admin" className="text-gray-700 hover:text-rose-gold font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>
                        Admin Panel
                      </Link>
                    )}
                    <Button variant="outline" onClick={() => void handleLogout()} loading={isLoggingOut} className="w-full">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full">Sign In</Button>
                  </Link>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
