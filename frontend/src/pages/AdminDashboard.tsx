import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const AdminDashboard: React.FC = () => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>Role-based administration panel</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Admin dashboard functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;