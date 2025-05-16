
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhotoPreview } from '@/components/shared/photo-preview';
import { MapView } from '@/components/shared/map-view';
import { toast } from '@/components/ui/sonner';
import { 
  getAllPaymentRequests, 
  updatePaymentRequest, 
  getProjectById,
  getProgressUpdateById 
} from '@/lib/storage';
import { PaymentRequest, Project, ProgressUpdate } from '@/lib/types';

const CheckerReviewSubmissions = () => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<PaymentRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedProgressUpdate, setSelectedProgressUpdate] = useState<ProgressUpdate | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState<boolean>(false);
  const [checkerNotes, setCheckerNotes] = useState<string>('');
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isRejecting, setIsRejecting] = useState<boolean>(false);
  
  // Load all pending payment requests
  useEffect(() => {
    loadPendingRequests();
  }, []);
  
  const loadPendingRequests = () => {
    const allPayments = getAllPaymentRequests();
    const pending = allPayments.filter(p => p.status === 'pending');
    setPendingRequests(pending);
    
    // Clear selected request if it's no longer pending
    if (selectedRequest && !pending.some(p => p.id === selectedRequest.id)) {
      setSelectedRequest(null);
      setSelectedProject(null);
      setSelectedProgressUpdate(null);
    }
  };
  
  const handleReviewRequest = (request: PaymentRequest) => {
    setSelectedRequest(request);
    const project = getProjectById(request.projectId);
    setSelectedProject(project);
    
    const progressUpdate = getProgressUpdateById(request.progressUpdateId);
    setSelectedProgressUpdate(progressUpdate);
    
    setCheckerNotes('');
    setShowReviewDialog(true);
  };
  
  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    setIsApproving(true);
    
    try {
      const updatedRequest = {
        ...selectedRequest,
        status: 'approved',
        checkerNotes: checkerNotes.trim() || undefined,
      };
      
      updatePaymentRequest(updatedRequest);
      toast.success('Payment request approved');
      setShowReviewDialog(false);
      loadPendingRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve payment request');
    } finally {
      setIsApproving(false);
    }
  };
  
  const handleReject = async () => {
    if (!selectedRequest) return;
    
    if (!checkerNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setIsRejecting(true);
    
    try {
      const updatedRequest = {
        ...selectedRequest,
        status: 'rejected',
        checkerNotes: checkerNotes.trim(),
      };
      
      updatePaymentRequest(updatedRequest);
      toast.success('Payment request rejected');
      setShowReviewDialog(false);
      loadPendingRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject payment request');
    } finally {
      setIsRejecting(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Review Submissions</h1>
      <p className="text-muted-foreground mb-8">
        Validate payment requests and review supporting documentation.
      </p>
      
      <div className="grid gap-6 md:grid-cols-2">
        {pendingRequests.map((request) => {
          const project = getProjectById(request.projectId);
          
          return (
            <Card key={request.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{project?.name || 'Unknown Project'}</span>
                  <span className="text-lg font-normal">₹ {request.totalAmount}</span>
                </CardTitle>
                <CardDescription>
                  Requested on {formatDate(request.date)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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
                  
                  <div>
                    <p className="font-medium">Supporting Images</p>
                    <p className="text-sm text-muted-foreground">
                      {request.purposes.reduce((total, purpose) => total + purpose.images.length, 0)} images provided
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => handleReviewRequest(request)}
                >
                  Review Request
                </Button>
              </CardFooter>
            </Card>
          );
        })}
        
        {pendingRequests.length === 0 && (
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>No Pending Submissions</CardTitle>
              <CardDescription>
                There are no payment requests awaiting review.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
      
      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Review Payment Request</DialogTitle>
            <DialogDescription>
              Carefully review all documentation before approving or rejecting.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && selectedProject && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Project Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Project:</span> {selectedProject.name}</p>
                    <p><span className="font-medium">Request Date:</span> {formatDate(selectedRequest.date)}</p>
                    <p><span className="font-medium">Total Amount:</span> ₹ {selectedRequest.totalAmount}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Progress Information</h3>
                  <div className="space-y-1 text-sm">
                    {selectedProgressUpdate ? (
                      <>
                        <p><span className="font-medium">Update Date:</span> {formatDate(selectedProgressUpdate.date)}</p>
                        <p><span className="font-medium">Work Completed:</span> {selectedProgressUpdate.workCompleted} meters</p>
                        <p><span className="font-medium">Time Spent:</span> {selectedProgressUpdate.timeSpent} hours</p>
                      </>
                    ) : (
                      <p>Progress information not available</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Payment Purposes</h3>
                  <div className="space-y-1">
                    {selectedRequest.purposes.map((purpose, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="capitalize">{purpose.type}:</span>
                        <span>₹ {purpose.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <Tabs defaultValue="documentation">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="documentation">Documentation</TabsTrigger>
                  <TabsTrigger value="progress">Progress Photos</TabsTrigger>
                </TabsList>
                <TabsContent value="documentation" className="space-y-4">
                  {selectedRequest.purposes.map((purpose, index) => (
                    <div key={index}>
                      <h3 className="text-lg font-semibold capitalize mb-2">{purpose.type} Documentation</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {purpose.images.map((image, imgIndex) => (
                          <div key={imgIndex} className="space-y-2">
                            <div className="aspect-video overflow-hidden rounded-md">
                              <img
                                src={image.dataUrl}
                                alt={`${purpose.type} documentation ${imgIndex + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <p>Timestamp: {new Date(image.timestamp).toLocaleString()}</p>
                              <p>Location: {image.location.latitude.toFixed(6)}, {image.location.longitude.toFixed(6)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="progress" className="space-y-4">
                  {selectedProgressUpdate ? (
                    <>
                      <h3 className="text-lg font-semibold mb-2">Progress Photos</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {selectedProgressUpdate.photos.map((photo, index) => (
                          <PhotoPreview key={index} photo={photo} />
                        ))}
                      </div>
                      
                      {selectedProgressUpdate.vehicleData && (
                        <div className="mt-6 space-y-4">
                          <h3 className="text-lg font-semibold mb-2">Vehicle Data</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium">Start Meter</h4>
                              <p className="text-sm mb-2">Reading: {selectedProgressUpdate.vehicleData.startMeter.reading}</p>
                              <div className="aspect-video overflow-hidden rounded-md">
                                <img
                                  src={selectedProgressUpdate.vehicleData.startMeter.photo}
                                  alt="Start meter"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium">End Meter</h4>
                              <p className="text-sm mb-2">Reading: {selectedProgressUpdate.vehicleData.endMeter.reading}</p>
                              <div className="aspect-video overflow-hidden rounded-md">
                                <img
                                  src={selectedProgressUpdate.vehicleData.endMeter.photo}
                                  alt="End meter"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          </div>
                          <p className="text-sm">
                            <span className="font-medium">Driver:</span> {selectedProgressUpdate.vehicleData.driver}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-8">
                      <p>No progress update information available</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add notes about your decision (required for rejection)"
                  value={checkerNotes}
                  onChange={(e) => setCheckerNotes(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-4">
                <Button 
                  variant="destructive" 
                  onClick={handleReject}
                  disabled={isApproving || isRejecting}
                >
                  {isRejecting ? 'Rejecting...' : 'Reject Request'}
                </Button>
                <Button 
                  onClick={handleApprove}
                  disabled={isApproving || isRejecting}
                >
                  {isApproving ? 'Approving...' : 'Approve Request'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CheckerReviewSubmissions;
