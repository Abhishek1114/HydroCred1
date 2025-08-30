import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { LogOut, Wallet, User } from 'lucide-react';
import { formatAddress, getRoleDisplayName, getRoleColor } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { account, isConnected, disconnect } = useWallet();

  const handleLogout = () => {
    logout();
    disconnect();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                HydroCred
              </h1>
              <Badge variant="secondary" className="ml-2">
                Beta
              </Badge>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  {/* User Role */}
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <Badge className={getRoleColor(user.role)}>
                      {getRoleDisplayName(user.role)}
                    </Badge>
                  </div>

                  {/* Wallet Info */}
                  {isConnected && account && (
                    <div className="flex items-center space-x-2">
                      <Wallet className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600 font-mono">
                        {formatAddress(account)}
                      </span>
                    </div>
                  )}

                  {/* User Name */}
                  <div className="text-sm text-gray-700">
                    {user.name}
                  </div>

                  {/* Logout Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;