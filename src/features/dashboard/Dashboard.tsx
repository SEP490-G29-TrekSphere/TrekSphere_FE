import React from 'react';
import { Button } from '@/shared/ui/Button';

const Dashboard: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome to TrekSphere!</p>
      <div className="flex gap-4">
        <Button variant="primary">Primary Action</Button>
        <Button variant="secondary">Secondary Action</Button>
      </div>
    </div>
  );
};

export default Dashboard;
