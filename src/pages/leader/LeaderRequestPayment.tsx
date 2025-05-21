import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  getAllProjects,
  getProgressUpdatesByProjectId,
  createPaymentRequest
} from '@/lib/storage';
import { Project, ProgressUpdate, PaymentPurpose } from '@/lib/types';
import { Camera, Plus, Trash2, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCamera } from '@/hooks/use-camera';
import { formatCurrency } from '@/lib/utils';

const LeaderRequestPayment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { captureImage } = useCamera();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([]);
  const [selectedProgressUpdate, setSelectedProgressUpdate] = useState<string>('');
  
  const [purposes, setPurposes] = useState<PaymentPurpose[]>([]);
  const [purposeType, setPurposeType] = useState<"food" | "fuel" | "labour" | "vehicle" | "water" | "other">("food");
  const [purposeAmount, setPurposeAmount] = useState<string>('');
  const [purposeImages, setPurposeImages] = useState<string[]>([]);
  const [showCameraDialog, setShowCameraDialog] = useState<boolean>(false);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  
  // Load projects on mount
  useEffect(() => {
    if (user) {
      const userProjects = getAllProjects().filter(project => project.leaderId === user.id);
      setProjects(userProjects);
    }
  }, [user]);
  
  // Load progress updates when project changes
  useEffect(() => {
    if (selectedProject) {
      const updates = getProgressUpdatesByProjectId(selectedProject);
      setProgressUpdates(updates);
      setSelectedProgressUpdate('');
    } else {
      setProgressUpdates([]);
    }
  }, [selectedProject]);
  
  // Calculate total amount when purposes change
  useEffect(() => {
    const total = purposes.reduce((sum, purpose) => sum + purpose.amount, 0);
    setTotalAmount(total);
  }, [purposes]);
  
  const handleAddPurpose = () => {
    if (!purposeType || !purposeAmount || parseFloat(purposeAmount) <= 0) {
      toast.error("Please select a purpose type and enter a valid amount");
      return;
    }
    
    if (purposeImages.length === 0) {
      toast.error("Please add at least one image for verification");
      return;
    }
    
    const newPurpose: PaymentPurpose = {
      type: purposeType,
      amount: parseFloat(purposeAmount),
      images: purposeImages.map(dataUrl => ({
        dataUrl,
        timestamp: new Date().toISOString(),
        location: { latitude: 0, longitude: 0 } // In a real app, get actual location
      }))
    };
    
    setPurposes([...purposes, newPurpose]);
    
    // Reset form
    setPurposeType("food");
    setPurposeAmount('');
    setPurposeImages([]);
  };
  
  const handleRemovePurpose = (index: number) => {
    const newPurposes = [...purposes];
    newPurposes.splice(index, 1);
    setPurposes(newPurposes);
  };
  
  const handleCaptureImage = async () => {
    try {
      const imageData = await captureImage();
      if (imageData) {
        setPurposeImages([...purposeImages, imageData]);
      }
      setShowCameraDialog(false);
    } catch (error) {
      console.error("Error capturing image:", error);
      toast.error("Failed to capture image");
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        setPurposeImages([...purposeImages, event.target.result]);
      }
    };
    
    reader.readAsDataURL(file);
    
    // Reset the input
    e.target.value = '';
  };
  
  const handleRemoveImage = (index: number) => {
    const newImages = [...purposeImages];
    newImages.splice(index, 1);
    setPurposeImages(newImages);
  };
  
  const handleSubmitRequest = () => {
    if (!selectedProject) {
      toast.error("Please select a project");
      return;
    }
    
    if (purposes.length === 0) {
      toast.error("Please add at least one payment purpose");
      return;
    }
    
    try {
      const paymentRequest = createPaymentRequest({
        projectId: selectedProject,
        progressUpdateId: selectedProgressUpdate || undefined,
        date: new Date().toISOString(),
        purposes: purposes,
        status: "pending",
        totalAmount: totalAmount
      });
      
      if (paymentRequest) {
        toast.success("Payment request submitted successfully");
        navigate("/leader/view-payment");
      } else {
        toast.error("Failed to submit payment request");
      }
    } catch (error) {
      console.error("Error submitting payment request:", error);
      toast.error("Failed to submit payment request");
    }
  };
  
  const getPurposeTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      'food': 'Food',
      'fuel': 'Fuel',
      'labour': 'Labour',
      'vehicle': 'Vehicle',
      'water': 'Water',
      'other': 'Other'
    };
    
    return typeMap[type] || type;
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Request Payment</h1>
      <p className="text-muted-foreground mb-8">
        Submit payment requests for project expenses with supporting documentation.
      </p>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Payment Request Details</CardTitle>
              <CardDescription>
                Select your project and provide payment details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Select
                  value={selectedProject}
                  onValueChange={setSelectedProject}
                >
                  <SelectTrigger id="project">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedProject && progressUpdates.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="progress-update">Related Progress Update (Optional)</Label>
                  <Select
                    value={selectedProgressUpdate}
                    onValueChange={setSelectedProgressUpdate}
                  >
                    <SelectTrigger id="progress-update">
                      <SelectValue placeholder="Select a progress update" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {progressUpdates.map(update => (
                        <SelectItem key={update.id} value={update.id}>
                          {new Date(update.date).toLocaleDateString()} - {update.completedWork}m
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Add Payment Purpose</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="purpose-type">Purpose Type</Label>
                      <Select
                        value={purposeType}
                        onValueChange={(value) => setPurposeType(value as "food" | "fuel" | "labour" | "vehicle" | "water" | "other")}
                      >
                        <SelectTrigger id="purpose-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="fuel">Fuel</SelectItem>
                          <SelectItem value="labour">Labour</SelectItem>
                          <SelectItem value="vehicle">Vehicle</SelectItem>
                          <SelectItem value="water">Water</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="purpose-amount">Amount</Label>
                      <Input
                        id="purpose-amount"
                        type="number"
                        placeholder="0.00"
                        value={purposeAmount}
                        onChange={(e) => setPurposeAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Supporting Images</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {purposeImages.map((image, index) => (
                        <div key={index} className="relative w-20 h-20">
                          <img 
                            src={image} 
                            alt={`Supporting image ${index + 1}`} 
                            className="w-full h-full object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowCameraDialog(true)}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Capture
                      </Button>
                      
                      <div className="relative">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          className="relative"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    type="button" 
                    onClick={handleAddPurpose}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Purpose
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
              <CardDescription>
                Review and submit your payment request
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {purposes.length > 0 ? (
                <div className="space-y-4">
                  {purposes.map((purpose, index) => (
                    <div key={index} className="border rounded-md p-4 relative">
                      <button
                        type="button"
                        onClick={() => handleRemovePurpose(index)}
                        className="absolute top-2 right-2 text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{getPurposeTypeLabel(purpose.type)}</span>
                        <span className="font-bold">{formatCurrency(purpose.amount)}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {purpose.images.map((image, imgIndex) => (
                          <div key={imgIndex} className="w-12 h-12">
                            <img 
                              src={image.dataUrl} 
                              alt={`Supporting image ${imgIndex + 1}`} 
                              className="w-full h-full object-cover rounded-md"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="font-medium">Total Amount:</span>
                    <span className="text-xl font-bold">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No payment purposes added yet.</p>
                  <p className="text-sm">Add at least one payment purpose to continue.</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSubmitRequest} 
                disabled={purposes.length === 0 || !selectedProject}
                className="w-full"
              >
                Submit Payment Request
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Camera Dialog */}
      <Dialog open={showCameraDialog} onOpenChange={setShowCameraDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Capture Image</DialogTitle>
            <DialogDescription>
              Take a photo of your receipt or supporting document
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center">
            <div id="camera-container" className="w-full h-64 bg-muted rounded-md flex items-center justify-center">
              <Camera className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCameraDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCaptureImage}>
              Capture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaderRequestPayment;
