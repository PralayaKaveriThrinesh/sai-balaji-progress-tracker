
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { getProjectsByLeaderId, createPaymentRequest } from '@/lib/storage';
import { Project, PaymentPurpose, PhotoWithMetadata } from '@/lib/types';
import { PhotoPreview } from '@/components/shared/photo-preview';
import { Check, Plus, X } from 'lucide-react';

const PAYMENT_TYPES = ["food", "fuel", "labour", "vehicle", "water", "other"];

const LeaderRequestPayment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [purposes, setPurposes] = useState<Partial<PaymentPurpose>[]>([
    { type: "", amount: 0, images: [] }
  ]);
  
  useEffect(() => {
    if (user) {
      const userProjects = getProjectsByLeaderId(user.id);
      setProjects(userProjects);
    }
  }, [user]);
  
  useEffect(() => {
    // Calculate total amount whenever purposes change
    const sum = purposes.reduce((total, purpose) => {
      return total + (purpose.amount || 0);
    }, 0);
    setTotalAmount(sum);
  }, [purposes]);
  
  const handlePurposeTypeChange = (index: number, value: string) => {
    const updatedPurposes = [...purposes];
    updatedPurposes[index] = { ...updatedPurposes[index], type: value };
    setPurposes(updatedPurposes);
  };
  
  const handlePurposeAmountChange = (index: number, value: string) => {
    const amount = parseFloat(value) || 0;
    const updatedPurposes = [...purposes];
    updatedPurposes[index] = { ...updatedPurposes[index], amount };
    setPurposes(updatedPurposes);
  };
  
  const handleAddPhoto = (index: number, photo: PhotoWithMetadata) => {
    const updatedPurposes = [...purposes];
    const currentImages = updatedPurposes[index].images || [];
    updatedPurposes[index] = { 
      ...updatedPurposes[index], 
      images: [...currentImages, photo] 
    };
    setPurposes(updatedPurposes);
  };
  
  const handleRemovePhoto = (purposeIndex: number, photoIndex: number) => {
    const updatedPurposes = [...purposes];
    const currentImages = [...(updatedPurposes[purposeIndex].images || [])];
    currentImages.splice(photoIndex, 1);
    updatedPurposes[purposeIndex] = { 
      ...updatedPurposes[purposeIndex], 
      images: currentImages
    };
    setPurposes(updatedPurposes);
  };
  
  const addPurpose = () => {
    setPurposes([...purposes, { type: "", amount: 0, images: [] }]);
  };
  
  const removePurpose = (index: number) => {
    if (purposes.length > 1) {
      const updatedPurposes = [...purposes];
      updatedPurposes.splice(index, 1);
      setPurposes(updatedPurposes);
    }
  };
  
  const validatePurposes = () => {
    let valid = true;
    purposes.forEach((purpose, index) => {
      if (!purpose.type) {
        toast.error(`Please select a purpose type for entry #${index + 1}`);
        valid = false;
      }
      
      if (!purpose.amount || purpose.amount <= 0) {
        toast.error(`Please enter a valid amount for ${purpose.type || `entry #${index + 1}`}`);
        valid = false;
      }
      
      if (!purpose.images || purpose.images.length === 0) {
        toast.error(`Please add at least one photo for ${purpose.type || `entry #${index + 1}`}`);
        valid = false;
      }
    });
    
    return valid;
  };
  
  const handleSubmit = () => {
    if (!selectedProject) {
      toast.error("Please select a project");
      return;
    }
    
    if (!validatePurposes()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Find the most recent progress update to link to this payment request
      const paymentData = {
        projectId: selectedProject,
        date: new Date().toISOString(),
        totalAmount,
        purposes: purposes as PaymentPurpose[],
        status: 'pending' as const,
        progressUpdateId: '', // This would typically come from the most recent progress update
      };
      
      createPaymentRequest(paymentData);
      
      toast.success("Payment request submitted successfully");
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/leader/view-payment');
      }, 1500);
      
    } catch (error) {
      console.error("Error submitting payment request:", error);
      toast.error("Failed to submit payment request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Request Payment</h1>
      <p className="text-muted-foreground mb-8">
        Submit payment requests for project expenses.
      </p>
      
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Project Selection</CardTitle>
            <CardDescription>
              Select the project for which you're requesting payment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedProject}
              onValueChange={setSelectedProject}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-2xl font-bold mb-4">Payment Details</h2>
      <p className="text-muted-foreground mb-4">
        Enter the different purposes and amounts for your payment request
      </p>
      
      {purposes.map((purpose, index) => (
        <Card key={index} className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Purpose {index + 1}</CardTitle>
              <CardDescription>
                Select category, enter amount, and upload supporting images
              </CardDescription>
            </div>
            {purposes.length > 1 && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => removePurpose(index)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`purpose-type-${index}`}>Purpose Type</Label>
                <Select
                  value={purpose.type}
                  onValueChange={(value) => handlePurposeTypeChange(index, value)}
                >
                  <SelectTrigger id={`purpose-type-${index}`}>
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type} className="capitalize">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`purpose-amount-${index}`}>Amount (₹)</Label>
                <Input
                  id={`purpose-amount-${index}`}
                  type="number"
                  placeholder="Enter amount"
                  min="1"
                  value={purpose.amount || ''}
                  onChange={(e) => handlePurposeAmountChange(index, e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Supporting Images</Label>
              <PhotoPreview onCapture={(photo) => handleAddPhoto(index, photo)} />
              
              {(purpose.images?.length || 0) > 0 && (
                <div className="mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {purpose.images?.map((image, imgIndex) => (
                      <div key={imgIndex} className="relative">
                        <img
                          src={image.dataUrl}
                          alt={`Support image ${imgIndex + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                        <button
                          onClick={() => handleRemovePhoto(index, imgIndex)}
                          className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          type="button"
                        >
                          ×
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1">
                          {new Date(image.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      
      <div className="flex justify-center mb-8">
        <Button onClick={addPurpose} variant="outline" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Another Purpose
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between font-medium">
              <span>Total Amount:</span>
              <span>₹ {totalAmount.toFixed(2)}</span>
            </div>
            
            <div className="border-t pt-4">
              <ul className="space-y-2">
                {purposes.map((purpose, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{purpose.type || `Purpose ${index + 1}`}</span>
                    <span className="text-sm">₹ {(purpose.amount || 0).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Submitting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4" /> Submit Payment Request
              </span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LeaderRequestPayment;
