
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getAllPaymentRequests, getProjectById } from '@/lib/storage';
import { PaymentRequest } from '@/lib/types';

const CheckerReviewHistory = () => {
  const [approvedRequests, setApprovedRequests] = useState<PaymentRequest[]>([]);
  const [rejectedRequests, setRejectedRequests] = useState<PaymentRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState<boolean>(false);
  
  useEffect(() => {
    // Load all payment requests
    const allPayments = getAllPaymentRequests();
    setApprovedRequests(allPayments
      .filter(p => p.status === 'approved' || p.status === 'scheduled' || p.status === 'paid')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
    setRejectedRequests(allPayments
      .filter(p => p.status === 'rejected')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
  }, []);
  
  const handleViewDetails = (request: PaymentRequest) => {
    setSelectedRequest(request);
    setShowDetailsDialog(true);
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-300 hover:bg-red-200">Rejected</Badge>;
      case 'scheduled':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200">Scheduled</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-200">Paid</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  const getProjectName = (projectId: string) => {
    const project = getProjectById(projectId);
    return project ? project.name : 'Unknown Project';
  };
  
  const renderRequestCard = (request: PaymentRequest) => (
    <Card key={request.id}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{getProjectName(request.projectId)}</span>
          <span className="text-lg font-normal">₹ {request.totalAmount}</span>
        </CardTitle>
        <CardDescription>
          Reviewed on {formatDate(request.date)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="font-medium">Status</p>
            <div className="mt-1">{getStatusBadge(request.status)}</div>
          </div>
          
          <div>
            <p className="font-medium">Purposes</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {request.purposes.map((purpose, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-muted rounded-full text-xs"
                >
                  {purpose.type} (₹ {purpose.amount})
                </span>
              ))}
            </div>
          </div>
          
          {request.checkerNotes && (
            <div>
              <p className="font-medium">Your Notes</p>
              <p className="text-sm text-muted-foreground">{request.checkerNotes}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => handleViewDetails(request)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Review History</h1>
      <p className="text-muted-foreground mb-8">
        View history of all payment requests you've reviewed.
      </p>
      
      <Tabs defaultValue="approved" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="approved">
            Approved ({approvedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedRequests.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="approved" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {approvedRequests.length > 0 ? (
              approvedRequests.map(renderRequestCard)
            ) : (
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>No Approved Requests</CardTitle>
                  <CardDescription>
                    You have not approved any payment requests yet.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="rejected" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {rejectedRequests.length > 0 ? (
              rejectedRequests.map(renderRequestCard)
            ) : (
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>No Rejected Requests</CardTitle>
                  <CardDescription>
                    You have not rejected any payment requests yet.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Request Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Payment Request Details</DialogTitle>
            <DialogDescription>
              Reviewed on {selectedRequest && formatDate(selectedRequest.date)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Project Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Project:</span> {getProjectName(selectedRequest.projectId)}</p>
                    <p><span className="font-medium">Date:</span> {formatDate(selectedRequest.date)}</p>
                    <p><span className="font-medium">Total Amount:</span> ₹ {selectedRequest.totalAmount}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Status Information</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Current Status:</span>{' '}
                      {getStatusBadge(selectedRequest.status)}
                    </p>
                    {selectedRequest.checkerNotes && (
                      <p>
                        <span className="font-medium">Your Notes:</span>{' '}
                        {selectedRequest.checkerNotes}
                      </p>
                    )}
                    {selectedRequest.scheduledDate && selectedRequest.status === 'scheduled' && (
                      <p>
                        <span className="font-medium">Payment Scheduled For:</span>{' '}
                        {formatDate(selectedRequest.scheduledDate)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Payment Purposes</h3>
                <div className="space-y-4">
                  {selectedRequest.purposes.map((purpose, index) => (
                    <div key={index} className="border rounded-md p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium capitalize">{purpose.type}</h4>
                        <span>₹ {purpose.amount}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {purpose.images.map((image, imgIndex) => (
                          <div key={imgIndex} className="relative">
                            <img
                              src={image.dataUrl}
                              alt={`${purpose.type} image ${imgIndex + 1}`}
                              className="w-full aspect-video object-cover rounded-md"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1">
                              {new Date(image.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CheckerReviewHistory;
