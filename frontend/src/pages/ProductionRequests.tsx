import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const ProductionRequests: React.FC = () => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Production Requests</CardTitle>
          <CardDescription>Manage hydrogen production requests</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Production requests functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionRequests;