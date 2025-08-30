import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const AuditorDashboard: React.FC = () => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Auditor Dashboard</CardTitle>
          <CardDescription>Monitor system activity and generate reports</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Auditor dashboard functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditorDashboard;