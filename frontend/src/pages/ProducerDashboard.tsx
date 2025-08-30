import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const ProducerDashboard: React.FC = () => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Producer Dashboard</CardTitle>
          <CardDescription>Manage hydrogen production and credits</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Producer dashboard functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProducerDashboard;