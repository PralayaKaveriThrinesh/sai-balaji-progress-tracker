
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-4xl font-bold mb-8 gradient-text-animated">Welcome to Sai Balaji Progress Tracker</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="card-glow card-gradient-1">
          <CardHeader>
            <CardTitle>Project Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Manage your ongoing projects and track their progress efficiently.</p>
            <Button onClick={() => navigate('/leader/create-project')}>Create Project</Button>
          </CardContent>
        </Card>
        
        <Card className="card-glow card-gradient-2">
          <CardHeader>
            <CardTitle>Progress Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Track daily progress and monitor completion status of various tasks.</p>
            <Button onClick={() => navigate('/leader/add-progress')}>Add Progress</Button>
          </CardContent>
        </Card>
        
        <Card className="card-glow card-gradient-3">
          <CardHeader>
            <CardTitle>Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Manage payment requests and view payment history.</p>
            <Button onClick={() => navigate('/leader/request-payment')}>Request Payment</Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-card p-6 rounded-lg shadow-md border border-border/40">
        <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li>Create a new project from the Projects menu</li>
          <li>Add progress updates daily to track work completed</li>
          <li>Submit payment requests as milestones are completed</li>
          <li>Monitor project statistics and performance</li>
        </ol>
      </div>
    </div>
  );
};

export default Index;
