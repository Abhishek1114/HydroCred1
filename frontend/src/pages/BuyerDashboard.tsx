import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const BuyerDashboard: React.FC = () => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Buyer Dashboard</CardTitle>
          <CardDescription>Purchase and manage hydrogen credits</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Buyer dashboard functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BuyerDashboard;