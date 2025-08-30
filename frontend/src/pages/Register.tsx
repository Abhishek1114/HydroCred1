import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const Register: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Register</CardTitle>
          <CardDescription>
            Create your HydroCred account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600 mb-4">
            Registration functionality will be implemented here.
          </p>
          <div className="text-center">
            <Link
              to="/login"
              className="text-teal-600 hover:text-teal-700 font-medium"
            >
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;