import React, { memo, useCallback } from 'react';
import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import Dock from '@/components/ui/dock';

type MobileTab = 'home' | 'orders' | 'stores' | 'cart' | 'profile' | 'admin' | 'printhub';

interface BottomNavbarProps {
  mobileTab: MobileTab;
  cartItemCount: number;
  onTabChange: (tab: MobileTab) => void;
  onOrdersClick: () => void;
  onProfileHover: () => void;
}

const CartIcon = ({ count, className }: { count: number; className?: string }) => (
  <div className="relative">
    <ShoppingCart className={className} />
    {count > 0 && (
      <span className="absolute -top-2 -right-2 bg-red-500 text-white font-mono text-[8px] h-[14px] min-w-[14px] px-0.5 rounded-full flex items-center justify-center font-bold border-[1.5px] border-white leading-none">
        {count > 9 ? '9+' : count}
      </span>
    )}
  </div>
);

export const BottomNavbar = memo(function BottomNavbar({
  mobileTab,
  cartItemCount,
  onTabChange,
  onOrdersClick,
  onProfileHover,
}: BottomNavbarProps) {
  const CartIconComponent = useCallback(
    ({ className }: { className?: string }) => (
      <CartIcon count={cartItemCount} className={className} />
    ),
    [cartItemCount]
  );

  const activeLabel =
    mobileTab === 'home'
      ? 'Home'
      : mobileTab === 'orders'
      ? 'Orders'
      : mobileTab === 'cart'
      ? 'Cart'
      : mobileTab === 'printhub'
      ? 'PrintHub'
      : mobileTab === 'profile' || mobileTab === 'admin'
      ? 'Profile'
      : 'Home';

  const navItems = [
    {
      icon: Home,
      label: 'Home',
      onClick: () => onTabChange('home'),
    },
    {
      icon: ShoppingBag,
      label: 'Orders',
      onClick: () => {
        onTabChange('orders');
        onOrdersClick();
      },
    },
    {
      icon: CartIconComponent,
      label: 'Cart',
      onClick: () => onTabChange('cart'),
    },
    {
      icon: User,
      label: 'Profile',
      onClick: () => onTabChange('profile'),
      onHover: onProfileHover,
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-[45] flex items-center justify-center pb-safe"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 6px)' }}
    >
      <Dock
        activeLabel={activeLabel}
        className="py-1"
        items={navItems}
      />
    </nav>
  );
});
