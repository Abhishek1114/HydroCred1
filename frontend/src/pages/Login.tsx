import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Wallet, Shield, Users, Factory, ShoppingCart, Eye } from 'lucide-react';

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { account, isConnected, connect, signMessage } = useWallet();
  const navigate = useNavigate();

  const handleWalletLogin = async () => {
    if (!isConnected) {
      await connect();
      return;
    }

    if (!account) {
      return;
    }

    setIsLoading(true);
    try {
      // Create a unique message for signing
      const message = `Login to HydroCred\n\nWallet: ${account}\nTimestamp: ${Date.now()}\n\nSign this message to authenticate with HydroCred.`;
      
      // Sign the message
      const signature = await signMessage(message);
      
      // Login with signature
      await login(account, signature, message);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Secure Authentication',
      description: 'Wallet-based login with cryptographic signatures'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Role-Based Access',
      description: 'Hierarchical admin system with granular permissions'
    },
    {
      icon: <Factory className="h-6 w-6" />,
      title: 'Production Tracking',
      description: 'End-to-end green hydrogen production certification'
    },
    {
      icon: <ShoppingCart className="h-6 w-6" />,
      title: 'Marketplace',
      description: 'Trade hydrogen credits on the blockchain'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side - Features */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-center"
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              HydroCred
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Blockchain-powered Green Hydrogen Credit System
            </p>
            <Badge variant="secondary" className="w-fit">
              <Eye className="h-4 w-4 mr-2" />
              Transparent & Auditable
            </Badge>
          </div>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex items-start space-x-4"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-center"
        >
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>
                Connect your wallet to access HydroCred
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Button
                  onClick={handleWalletLogin}
                  disabled={isLoading}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  <Wallet className="h-5 w-5 mr-2" />
                  {isLoading ? 'Connecting...' : isConnected ? 'Sign Message & Login' : 'Connect Wallet'}
                </Button>

                {account && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Connected Wallet:</p>
                    <p className="text-sm font-mono text-gray-900 break-all">
                      {account}
                    </p>
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Register here
                  </Link>
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                  How it works:
                </h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Connect your MetaMask wallet</li>
                  <li>2. Sign a message to authenticate</li>
                  <li>3. Access your role-based dashboard</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;