import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const Marketplace: React.FC = () => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Marketplace</CardTitle>
          <CardDescription>Trade hydrogen credits</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Marketplace functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Marketplace;