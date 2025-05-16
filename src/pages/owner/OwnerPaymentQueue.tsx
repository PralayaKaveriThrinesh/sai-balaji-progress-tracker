
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';
import { getAllPaymentRequests, getProjectById, updatePaymentRequest } from '@/lib/storage';
import { PaymentRequest } from '@/lib/types';

const OwnerPaymentQueue = () => {
  const [approvedRequests, setApprovedRequests] = useState<PaymentRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState<boolean>(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState<boolean>(false);
  const [scheduledDate, setScheduledDate] = useState<Date>(
    new Date(new Date().setDate(new Date().getDate() + 1)) // Default to tomorrow
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  useEffect(() => {
    loadApprovedRequests();
  }, []);
  
  const loadApprovedRequests = () => {
    const allPayments = getAllPaymentRequests();
    setApprovedRequests(allPayments
      .filter(p => p.status === 'approved')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
    
    // Clear selected request if it's no longer in the approved list
    if (selectedRequest && !approvedRequests.some(p => p.id === selectedRequest.id)) {
      setSelectedRequest(null);
    }
  };
  
  const handlePayNow = async (request: PaymentRequest) => {
    setSelectedRequest(request);
    setShowPaymentDialog(true);
  };
  
  const handleSchedule = async (request: PaymentRequest) => {
    setSelectedRequest(request);
    setScheduledDate(new Date(new Date().setDate(new Date().getDate() + 1))); // Reset to tomorrow
    setShowScheduleDialog(true);
  };
  
  const confirmPayment = async () => {
    if (!selectedRequest) return;
    
    setIsProcessing(true);
    
    try {
      const updatedRequest = {
        ...selectedRequest,
        status: 'paid',
      };
      
      updatePaymentRequest(updatedRequest);
      toast.success('Payment processed successfully');
      setShowPaymentDialog(false);
      loadApprovedRequests();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const confirmSchedule = async () => {
    if (!selectedRequest) return;
    
    // Ensure scheduled date is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (scheduledDate < today) {
      toast.error('Scheduled date must be in the future');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const updatedRequest = {
        ...selectedRequest,
        status: 'scheduled',
        scheduledDate: scheduledDate.toISOString(),
      };
      
      updatePaymentRequest(updatedRequest);
      toast.success('Payment scheduled successfully');
      setShowScheduleDialog(false);
      loadApprovedRequests();
    } catch (error) {
      console.error('Error scheduling payment:', error);
      toast.error('Failed to schedule payment');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  const getProjectName = (projectId: string) => {
    const project = getProjectById(projectId);
    return project ? project.name : 'Unknown Project';
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Payment Queue</h1>
      <p className="text-muted-foreground mb-8">
        Process or schedule payments for approved requests.
      </p>
      
      <div className="grid gap-6 md:grid-cols-2">
        {approvedRequests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{getProjectName(request.projectId)}</span>
                <span className="text-lg font-normal">₹ {request.totalAmount}</span>
              </CardTitle>
              <CardDescription>
                Requested on {formatDate(request.date)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Status</p>
                  <div className="mt-1">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200">
                      Approved by Checker
                    </Badge>
                  </div>
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
                    <p className="font-medium">Checker Notes</p>
                    <p className="text-sm text-muted-foreground">{request.checkerNotes}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col md:flex-row gap-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleSchedule(request)}
              >
                Schedule Payment
              </Button>
              <Button 
                className="w-full"
                onClick={() => handlePayNow(request)}
              >
                Pay Now
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        {approvedRequests.length === 0 && (
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>No Approved Requests</CardTitle>
              <CardDescription>
                There are no payment requests awaiting your action.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
      
      {/* Payment Confirmation Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              Are you sure you want to process this payment now?
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 rounded-md bg-muted">
                <p><span className="font-medium">Project:</span> {getProjectName(selectedRequest.projectId)}</p>
                <p className="mt-1"><span className="font-medium">Amount:</span> ₹ {selectedRequest.totalAmount}</p>
                <p className="mt-1"><span className="font-medium">Requested:</span> {formatDate(selectedRequest.date)}</p>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPaymentDialog(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmPayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Confirm Payment'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Schedule Payment Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Payment</DialogTitle>
            <DialogDescription>
              Select a date to schedule this payment.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 rounded-md bg-muted">
                <p><span className="font-medium">Project:</span> {getProjectName(selectedRequest.projectId)}</p>
                <p className="mt-1"><span className="font-medium">Amount:</span> ₹ {selectedRequest.totalAmount}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Payment Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scheduledDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={(date) => date && setScheduledDate(date)}
                      disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  Select a future date to schedule the payment.
                </p>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowScheduleDialog(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmSchedule}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Scheduling...' : 'Schedule Payment'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OwnerPaymentQueue;
