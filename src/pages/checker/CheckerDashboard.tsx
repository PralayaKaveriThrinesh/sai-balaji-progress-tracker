
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAllProjects, getAllPaymentRequests } from '@/lib/storage';
import { Project, PaymentRequest } from '@/lib/types';

const CheckerDashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PaymentRequest[]>([]);
  const [approvedPayments, setApprovedPayments] = useState<PaymentRequest[]>([]);
  const [rejectedPayments, setRejectedPayments] = useState<PaymentRequest[]>([]);
  
  useEffect(() => {
    // Load all projects
    setProjects(getAllProjects());
    
    // Load all payment requests
    const allPayments = getAllPaymentRequests();
    setPendingPayments(allPayments.filter(p => p.status === 'pending'));
    setApprovedPayments(allPayments.filter(p => p.status === 'approved'));
    setRejectedPayments(allPayments.filter(p => p.status === 'rejected'));
  }, []);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Checker Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Review submissions, verify accuracy, and approve or reject payment requests.
      </p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total construction projects
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Requests awaiting review
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedPayments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Requests approved by you
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejected Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedPayments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Requests rejected by you
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Review Submissions</CardTitle>
            <CardDescription>
              Check and validate payment requests from leaders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {pendingPayments.length} payment requests awaiting your review
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/checker/review-submissions" className="w-full">
              <Button className="w-full">Review Now</Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Review History</CardTitle>
            <CardDescription>
              View previously reviewed submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {approvedPayments.length + rejectedPayments.length} payment requests previously reviewed
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/checker/review-history" className="w-full">
              <Button variant="outline" className="w-full">View History</Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>
              View all construction projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Monitor progress and track work across all projects
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/checker/projects" className="w-full">
              <Button variant="outline" className="w-full">View Projects</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CheckerDashboard;
