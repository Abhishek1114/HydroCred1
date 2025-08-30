import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Factory, 
  ShoppingCart, 
  FileText, 
  Settings,
  Shield,
  Building,
  MapPin,
  UserCheck
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['main_admin', 'country_admin', 'state_admin', 'city_admin', 'producer', 'buyer', 'auditor']
    },
    {
      name: 'Admin Panel',
      href: '/admin',
      icon: Shield,
      roles: ['main_admin', 'country_admin', 'state_admin', 'city_admin']
    },
    {
      name: 'Producer Dashboard',
      href: '/producer',
      icon: Factory,
      roles: ['producer']
    },
    {
      name: 'Buyer Dashboard',
      href: '/buyer',
      icon: ShoppingCart,
      roles: ['buyer']
    },
    {
      name: 'Auditor Dashboard',
      href: '/auditor',
      icon: FileText,
      roles: ['auditor', 'main_admin', 'country_admin', 'state_admin', 'city_admin']
    },
    {
      name: 'Production Requests',
      href: '/production-requests',
      icon: Building,
      roles: ['producer', 'city_admin', 'state_admin', 'country_admin', 'main_admin']
    },
    {
      name: 'Marketplace',
      href: '/marketplace',
      icon: ShoppingCart,
      roles: ['producer', 'buyer', 'auditor', 'main_admin', 'country_admin', 'state_admin', 'city_admin']
    },
    {
      name: 'Audit',
      href: '/audit',
      icon: FileText,
      roles: ['auditor', 'main_admin', 'country_admin', 'state_admin', 'city_admin']
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: Settings,
      roles: ['main_admin', 'country_admin', 'state_admin', 'city_admin', 'producer', 'buyer', 'auditor']
    }
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user.role)
  );

  return (
    <div className="w-64 bg-white shadow-sm border-r min-h-screen">
      <div className="p-4">
        <nav className="space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-teal-100 text-teal-700 border-r-2 border-teal-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Role Info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <UserCheck className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Your Role</span>
          </div>
          <div className="text-sm text-gray-600">
            {user.role === 'main_admin' && (
              <div className="space-y-1">
                <p>• Appoint Country Admins</p>
                <p>• Full system access</p>
                <p>• Register Auditors</p>
              </div>
            )}
            {user.role === 'country_admin' && (
              <div className="space-y-1">
                <p>• Appoint State Admins</p>
                <p>• Manage country operations</p>
                <p>• View country statistics</p>
              </div>
            )}
            {user.role === 'state_admin' && (
              <div className="space-y-1">
                <p>• Appoint City Admins</p>
                <p>• Manage state operations</p>
                <p>• View state statistics</p>
              </div>
            )}
            {user.role === 'city_admin' && (
              <div className="space-y-1">
                <p>• Certify production requests</p>
                <p>• Approve producers</p>
                <p>• Manage city operations</p>
              </div>
            )}
            {user.role === 'producer' && (
              <div className="space-y-1">
                <p>• Submit production requests</p>
                <p>• Mint hydrogen credits</p>
                <p>• Trade credits</p>
              </div>
            )}
            {user.role === 'buyer' && (
              <div className="space-y-1">
                <p>• Purchase hydrogen credits</p>
                <p>• Retire credits</p>
                <p>• View transaction history</p>
              </div>
            )}
            {user.role === 'auditor' && (
              <div className="space-y-1">
                <p>• View all transactions</p>
                <p>• Export audit reports</p>
                <p>• Monitor system activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;