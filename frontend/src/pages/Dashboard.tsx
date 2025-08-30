import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Shield, 
  Factory, 
  ShoppingCart, 
  FileText, 
  TrendingUp, 
  Users,
  Activity,
  Award
} from 'lucide-react';
import { getRoleDisplayName, getRoleColor } from '../lib/utils';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  const getDashboardContent = () => {
    switch (user.role) {
      case 'main_admin':
        return {
          title: 'Main Admin Dashboard',
          description: 'System-wide administration and oversight',
          icon: Shield,
          stats: [
            { label: 'Total Users', value: '1,234', icon: Users },
            { label: 'Active Credits', value: '45,678', icon: Award },
            { label: 'Transactions', value: '890', icon: Activity },
            { label: 'Countries', value: '12', icon: TrendingUp }
          ],
          actions: [
            { title: 'Appoint Country Admin', description: 'Add new country administrators' },
            { title: 'Register Auditors', description: 'Grant auditor access to users' },
            { title: 'System Statistics', description: 'View comprehensive system metrics' },
            { title: 'Global Settings', description: 'Configure system-wide parameters' }
          ]
        };

      case 'country_admin':
        return {
          title: 'Country Admin Dashboard',
          description: 'Manage country operations and state administrators',
          icon: Shield,
          stats: [
            { label: 'States', value: '8', icon: Users },
            { label: 'Cities', value: '156', icon: Award },
            { label: 'Producers', value: '234', icon: Activity },
            { label: 'Credits Issued', value: '12,345', icon: TrendingUp }
          ],
          actions: [
            { title: 'Appoint State Admin', description: 'Add new state administrators' },
            { title: 'Country Statistics', description: 'View country-wide metrics' },
            { title: 'Manage States', description: 'Oversee state operations' },
            { title: 'Reports', description: 'Generate country reports' }
          ]
        };

      case 'state_admin':
        return {
          title: 'State Admin Dashboard',
          description: 'Manage state operations and city administrators',
          icon: Shield,
          stats: [
            { label: 'Cities', value: '24', icon: Users },
            { label: 'City Admins', value: '24', icon: Award },
            { label: 'Producers', value: '67', icon: Activity },
            { label: 'Credits Issued', value: '3,456', icon: TrendingUp }
          ],
          actions: [
            { title: 'Appoint City Admin', description: 'Add new city administrators' },
            { title: 'State Statistics', description: 'View state-wide metrics' },
            { title: 'Manage Cities', description: 'Oversee city operations' },
            { title: 'Reports', description: 'Generate state reports' }
          ]
        };

      case 'city_admin':
        return {
          title: 'City Admin Dashboard',
          description: 'Certify production and manage local operations',
          icon: Shield,
          stats: [
            { label: 'Producers', value: '12', icon: Users },
            { label: 'Pending Requests', value: '5', icon: Award },
            { label: 'Certified Credits', value: '789', icon: Activity },
            { label: 'This Month', value: '123', icon: TrendingUp }
          ],
          actions: [
            { title: 'Certify Production', description: 'Review and approve production requests' },
            { title: 'Approve Producers', description: 'Grant producer access to users' },
            { title: 'City Statistics', description: 'View city-wide metrics' },
            { title: 'Reports', description: 'Generate city reports' }
          ]
        };

      case 'producer':
        return {
          title: 'Producer Dashboard',
          description: 'Manage hydrogen production and credit minting',
          icon: Factory,
          stats: [
            { label: 'Total Credits', value: '456', icon: Award },
            { label: 'Pending Requests', value: '2', icon: Activity },
            { label: 'Sold Credits', value: '234', icon: TrendingUp },
            { label: 'Available', value: '222', icon: Users }
          ],
          actions: [
            { title: 'Submit Production', description: 'Submit new production request' },
            { title: 'Mint Credits', description: 'Mint tokens for approved production' },
            { title: 'Sell Credits', description: 'List credits for sale' },
            { title: 'Production History', description: 'View all production records' }
          ]
        };

      case 'buyer':
        return {
          title: 'Buyer Dashboard',
          description: 'Purchase and manage hydrogen credits',
          icon: ShoppingCart,
          stats: [
            { label: 'Purchased Credits', value: '123', icon: Award },
            { label: 'Retired Credits', value: '45', icon: Activity },
            { label: 'Available', value: '78', icon: Users },
            { label: 'Carbon Offset', value: '45 kg', icon: TrendingUp }
          ],
          actions: [
            { title: 'Browse Marketplace', description: 'View available credits for purchase' },
            { title: 'Purchase Credits', description: 'Buy hydrogen credits' },
            { title: 'Retire Credits', description: 'Retire credits for carbon offset' },
            { title: 'Transaction History', description: 'View all transactions' }
          ]
        };

      case 'auditor':
        return {
          title: 'Auditor Dashboard',
          description: 'Monitor system activity and generate reports',
          icon: FileText,
          stats: [
            { label: 'Total Transactions', value: '1,234', icon: Activity },
            { label: 'Active Credits', value: '45,678', icon: Award },
            { label: 'Retired Credits', value: '12,345', icon: TrendingUp },
            { label: 'Users', value: '567', icon: Users }
          ],
          actions: [
            { title: 'View Transactions', description: 'Browse all system transactions' },
            { title: 'Export Reports', description: 'Generate audit reports' },
            { title: 'System Statistics', description: 'View comprehensive metrics' },
            { title: 'Compliance Check', description: 'Verify regulatory compliance' }
          ]
        };

      default:
        return {
          title: 'Dashboard',
          description: 'Welcome to HydroCred',
          icon: Shield,
          stats: [],
          actions: []
        };
    }
  };

  const content = getDashboardContent();

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <content.icon className="h-8 w-8 text-teal-600" />
            <h1 className="text-3xl font-bold text-gray-900">{content.title}</h1>
          </div>
          <p className="text-gray-600">{content.description}</p>
          <div className="mt-2">
            <Badge className={getRoleColor(user.role)}>
              {getRoleDisplayName(user.role)}
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        {content.stats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {content.stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <stat.icon className="h-8 w-8 text-teal-600" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Actions Grid */}
        {content.actions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.actions.map((action, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {/* Welcome Message */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Welcome to HydroCred</CardTitle>
            <CardDescription>
              Blockchain-powered Green Hydrogen Credit System
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              You are logged in as <strong>{user.name}</strong> with the role of{' '}
              <Badge className={getRoleColor(user.role)}>
                {getRoleDisplayName(user.role)}
              </Badge>
            </p>
            <p className="text-gray-600 mt-2">
              Use the sidebar navigation to access your role-specific features and manage your hydrogen credit operations.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;