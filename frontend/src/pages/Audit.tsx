import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const Audit: React.FC = () => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Audit</CardTitle>
          <CardDescription>View transaction history and generate reports</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Audit functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Audit;