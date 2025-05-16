
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { getAllPaymentRequests, getProjectById, getProgressUpdateById } from '@/lib/storage';
import { PaymentRequest, ProgressUpdate, Project } from '@/lib/types';
import { CalendarIcon, FileCheck, FileX, Check, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { PhotoPreview } from '@/components/shared/photo-preview';

export default function CheckerReviewHistory() {
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PaymentRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewTab, setReviewTab] = useState<'all' | 'approved' | 'rejected'>('all');
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [selectedProgressUpdate, setSelectedProgressUpdate] = useState<ProgressUpdate | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Load payment requests
  useEffect(() => {
    const requests = getAllPaymentRequests();
    setPaymentRequests(requests);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = paymentRequests;
    
    // Tab filter
    if (reviewTab === 'approved') {
      filtered = filtered.filter(req => req.status === 'approved' || req.status === 'scheduled' || req.status === 'paid');
    } else if (reviewTab === 'rejected') {
      filtered = filtered.filter(req => req.status === 'rejected');
    }
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(req => {
        const project = getProjectById(req.projectId);
        return (
          project?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
    
    setFilteredRequests(filtered);
  }, [paymentRequests, reviewTab, searchTerm]);

  const handleViewDetails = (request: PaymentRequest) => {
    setSelectedRequest(request);
    
    // Get progress update
    if (request.progressUpdateId) {
      const progressUpdate = getProgressUpdateById(request.progressUpdateId);
      setSelectedProgressUpdate(progressUpdate);
    } else {
      setSelectedProgressUpdate(null);
    }
    
    setViewDialogOpen(true);
  };

  // Get project name
  const getProjectName = (projectId: string): string => {
    const project = getProjectById(projectId);
    return project?.name || "Unknown Project";
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'paid':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Review History</h1>
        <p className="text-muted-foreground">
          View your past review decisions and their current status.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by project name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-80"
        />
        
        <Tabs defaultValue="all" className="flex-1" onValueChange={(v) => setReviewTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground text-center">No review history found.</p>
            <p className="text-sm text-muted-foreground text-center mt-2">
              {reviewTab === 'all'
                ? "You haven't reviewed any payment requests yet."
                : reviewTab === 'approved'
                  ? "You haven't approved any payment requests yet."
                  : "You haven't rejected any payment requests yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((request) => {
            const project = getProjectById(request.projectId);
            return (
              <Card key={request.id} className="overflow-hidden">
                <CardHeader className={cn(
                  "flex flex-row items-center gap-4",
                  request.status === 'approved' || request.status === 'scheduled' || request.status === 'paid'
                    ? "bg-green-50 dark:bg-green-900/20" 
                    : request.status === 'rejected'
                      ? "bg-red-50 dark:bg-red-900/20"
                      : "bg-muted/50"
                )}>
                  <div className={cn(
                    "rounded-full p-2",
                    request.status === 'approved' || request.status === 'scheduled' || request.status === 'paid'
                      ? "bg-green-100 dark:bg-green-900" 
                      : request.status === 'rejected'
                        ? "bg-red-100 dark:bg-red-900"
                        : "bg-gray-100 dark:bg-gray-800"
                  )}>
                    {request.status === 'approved' || request.status === 'scheduled' || request.status === 'paid' ? (
                      <FileCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : request.status === 'rejected' ? (
                      <FileX className="h-5 w-5 text-red-600 dark:text-red-400" />
                    ) : (
                      <CalendarIcon className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{getProjectName(request.projectId)}</CardTitle>
                    <CardDescription>
                      <span className={cn(
                        "inline-block px-2 py-1 rounded-full text-xs font-medium mt-1",
                        getStatusColor(request.status)
                      )}>
                        {request.status === 'scheduled' ? 'Scheduled' :
                         request.status === 'paid' ? 'Paid' :
                         request.status === 'approved' ? 'Approved' :
                         request.status === 'rejected' ? 'Rejected' : 'Pending'}
                      </span>
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium text-right">₹{request.totalAmount.toFixed(2)}</span>
                      <span className="text-muted-foreground">Requested on:</span>
                      <span className="text-right">{format(new Date(request.date), 'PPP')}</span>
                      <span className="text-muted-foreground">Purposes:</span>
                      <span className="text-right">
                        {request.purposes.length > 0
                          ? request.purposes.map(p => p.type).join(', ')
                          : 'None'}
                      </span>
                    </div>
                    
                    {request.checkerNotes && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground">Your notes:</p>
                        <p className="text-sm mt-1 italic">{request.checkerNotes}</p>
                      </div>
                    )}
                    
                    {request.status === 'scheduled' && request.scheduledDate && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground">Scheduled payment:</p>
                        <p className="text-sm mt-1">{format(new Date(request.scheduledDate), 'PPP')}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 px-6 py-4">
                  <Button 
                    variant="secondary" 
                    className="w-full" 
                    onClick={() => handleViewDetails(request)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Payment Request Details</DialogTitle>
            <DialogDescription>
              View the details of this payment request and your review decision.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Project Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Project Name:</span>
                    <span>{getProjectName(selectedRequest.projectId)}</span>
                    <span className="text-muted-foreground">Status:</span>
                    <span className={cn(
                      "inline-block px-2 py-1 rounded-full text-xs font-medium",
                      getStatusColor(selectedRequest.status)
                    )}>
                      {selectedRequest.status}
                    </span>
                    <span className="text-muted-foreground">Request Date:</span>
                    <span>{format(new Date(selectedRequest.date), 'PPP')}</span>
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="font-semibold">₹{selectedRequest.totalAmount.toFixed(2)}</span>
                    
                    {selectedRequest.scheduledDate && (
                      <>
                        <span className="text-muted-foreground">Scheduled For:</span>
                        <span>{format(new Date(selectedRequest.scheduledDate), 'PPP')}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Payment Purposes</h3>
                  {selectedRequest.purposes.length === 0 ? (
                    <p className="text-muted-foreground">No payment purposes specified.</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedRequest.purposes.map((purpose, index) => (
                        <div key={index} className="border rounded-md p-3">
                          <div className="flex justify-between items-center">
                            <Badge>{purpose.type}</Badge>
                            <span className="font-semibold">₹{purpose.amount.toFixed(2)}</span>
                          </div>
                          
                          {purpose.images && purpose.images.length > 0 && (
                            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {purpose.images.map((img, imgIndex) => (
                                <div key={imgIndex} className="aspect-video relative">
                                  <img 
                                    src={img.dataUrl} 
                                    alt={`Receipt for ${purpose.type}`} 
                                    className="w-full h-full object-cover rounded-md"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {selectedProgressUpdate && (
                <div className="border-t pt-6 mt-6">
                  <h3 className="font-semibold text-lg mb-4">Progress Update</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <span className="text-muted-foreground">Date:</span>
                        <span>{format(new Date(selectedProgressUpdate.date), 'PPP')}</span>
                        <span className="text-muted-foreground">Work Completed:</span>
                        <span>{selectedProgressUpdate.workCompleted} meters</span>
                        <span className="text-muted-foreground">Time Spent:</span>
                        <span>{selectedProgressUpdate.timeSpent} hours</span>
                      </div>
                      
                      {selectedProgressUpdate.vehicleData && (
                        <>
                          <h4 className="font-semibold mt-4">Vehicle Data</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <span className="text-muted-foreground">Start Reading:</span>
                            <span>{selectedProgressUpdate.vehicleData.startMeter.reading} km</span>
                            <span className="text-muted-foreground">End Reading:</span>
                            <span>{selectedProgressUpdate.vehicleData.endMeter.reading} km</span>
                            <span className="text-muted-foreground">Distance:</span>
                            <span>
                              {selectedProgressUpdate.vehicleData.endMeter.reading - 
                                selectedProgressUpdate.vehicleData.startMeter.reading} km
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold">Progress Photos</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedProgressUpdate.photos.map((photo, index) => (
                          <PhotoPreview key={index} photo={photo} />
                        ))}
                      </div>
                      
                      {selectedProgressUpdate.vehicleData && (
                        <>
                          <h4 className="font-semibold mt-4">Meter Photos</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Start Meter</p>
                              <img 
                                src={selectedProgressUpdate.vehicleData.startMeter.photo}
                                alt="Start Meter" 
                                className="w-full aspect-video object-cover rounded-md"
                              />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">End Meter</p>
                              <img 
                                src={selectedProgressUpdate.vehicleData.endMeter.photo}
                                alt="End Meter" 
                                className="w-full aspect-video object-cover rounded-md"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="border-t pt-6 mt-6">
                <h3 className="font-semibold text-lg mb-4">Your Review</h3>
                <div className="bg-muted p-4 rounded-md">
                  <div className="flex items-start gap-3">
                    {selectedRequest.status === 'approved' || 
                     selectedRequest.status === 'scheduled' || 
                     selectedRequest.status === 'paid' ? (
                      <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                        <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                    ) : selectedRequest.status === 'rejected' ? (
                      <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full">
                        <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                    ) : null}
                    
                    <div className="flex-1">
                      <p className="font-medium">
                        {selectedRequest.status === 'approved' || 
                         selectedRequest.status === 'scheduled' || 
                         selectedRequest.status === 'paid'
                          ? 'You approved this request'
                          : selectedRequest.status === 'rejected'
                            ? 'You rejected this request'
                            : 'This request is pending review'}
                      </p>
                      
                      {selectedRequest.checkerNotes && (
                        <p className="mt-2 text-muted-foreground">
                          "{selectedRequest.checkerNotes}"
                        </p>
                      )}
                      
                      {selectedRequest.status === 'scheduled' && selectedRequest.scheduledDate && (
                        <p className="mt-2 text-sm">
                          The owner has scheduled payment for {format(new Date(selectedRequest.scheduledDate), 'PPP')}
                        </p>
                      )}
                      
                      {selectedRequest.status === 'paid' && (
                        <p className="mt-2 text-sm">
                          The owner has completed the payment.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
