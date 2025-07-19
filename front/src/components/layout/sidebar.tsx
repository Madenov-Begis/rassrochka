import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Store,
  Users,
  CreditCard,
  UserCheck,
  ShoppingBag,
  Calendar,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';

const adminNavItems = [
  {
    title: 'Дашборд',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Магазины',
    href: '/admin/stores',
    icon: Store,
  },
  {
    title: 'Пользователи',
    href: '/admin/users',
    icon: Users,
  },
  // {
  //   title: "Статистика",
  //   href: "/admin/stats",
  //   icon: BarChart3,
  // },
];

const storeNavItems = [
  {
    title: 'Дашборд',
    href: '/store',
    icon: LayoutDashboard,
  },
  {
    title: 'Клиенты',
    href: '/store/customers',
    icon: UserCheck,
  },
  {
    title: 'Рассрочки',
    href: '/store/installments',
    icon: CreditCard,
  },
  {
    title: 'Платежи',
    href: '/store/payments',
    icon: ShoppingBag,
  },
  {
    title: 'Календарь',
    href: '/store/calendar',
    icon: Calendar,
  },
  // {
  //   title: "Статистика",
  //   href: "/store/stats",
  //   icon: BarChart3,
  // },
];

export function Sidebar({ onItemClick }: { onItemClick?: () => void }) {
  const location = useLocation();
  const { user } = useAuthStore();

  const navItems = user?.role === 'admin' ? adminNavItems : storeNavItems;

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <CreditCard className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-semibold text-lg">QOLAY</h1>
          <p className="text-xs text-gray-500">
            {user?.role === 'admin' ? 'Админ-панель' : 'Панель магазина'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.href ||
            (item.href !== '/admin' &&
              item.href !== '/store' &&
              location.pathname.startsWith(item.href));

          return (
            <Link key={item.href} to={item.href} onClick={onItemClick}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3',
                  isActive && 'bg-blue-50 text-blue-700 hover:bg-blue-100',
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Store Info */}
      {user?.role === 'store_manager' && user?.store && (
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-3">
            <h3 className="font-medium text-sm">{user.store.name}</h3>
            <p className="text-xs text-gray-500 mt-1">{user.store.address}</p>
            <div
              className={cn(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2',
                user.store.status === 'active' && 'bg-green-100 text-green-800',
                user.store.status === 'payment_overdue' &&
                  'bg-yellow-100 text-yellow-800',
                user.store.status === 'blocked' && 'bg-red-100 text-red-800',
              )}
            >
              {user.store.status === 'active' && 'Активен'}
              {user.store.status === 'payment_overdue' && 'Просрочка'}
              {user.store.status === 'blocked' && 'Заблокирован'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
