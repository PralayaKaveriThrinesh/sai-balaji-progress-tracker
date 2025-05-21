
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { Plus, Trash2 } from 'lucide-react';
import { getProjectsByLeaderId, getProgressUpdatesByProjectId, createPaymentRequest } from '@/lib/storage';
import { Project, ProgressUpdate, PaymentPurpose, PaymentRequest } from '@/lib/types';

type PaymentPurposeType = "food" | "fuel" | "labour" | "vehicle" | "water" | "other";

interface PaymentForm {
  projectId: string;
  progressUpdateId?: string;
  purposes: {
    type: PaymentPurposeType;
    amount: number;
    images: { dataUrl: string; timestamp: string; location: { latitude: number; longitude: number } }[];
  }[];
}

const LeaderRequestPayment: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([]);
  const [formValues, setFormValues] = useState<PaymentForm>({
    projectId: '',
    progressUpdateId: '',
    purposes: [{ type: "labour", amount: 0, images: [] }]
  });
  const [loading, setLoading] = useState(false);

  // Load leader's projects
  useEffect(() => {
    if (user) {
      const userProjects = getProjectsByLeaderId(user.id);
      setProjects(userProjects);
      
      if (userProjects.length > 0 && !formValues.projectId) {
        // Set the first project as default
        setFormValues(prev => ({ ...prev, projectId: userProjects[0].id }));
        
        // Load progress updates for this project
        const updates = getProgressUpdatesByProjectId(userProjects[0].id);
        setProgressUpdates(updates);
      }
    }
  }, [user]);

  // Load progress updates when project changes
  useEffect(() => {
    if (formValues.projectId) {
      const updates = getProgressUpdatesByProjectId(formValues.projectId);
      setProgressUpdates(updates);
      
      // Clear the selected progress update if it doesn't belong to this project
      const currentUpdateBelongsToProject = updates.some(update => update.id === formValues.progressUpdateId);
      if (!currentUpdateBelongsToProject) {
        setFormValues(prev => ({ ...prev, progressUpdateId: updates.length > 0 ? updates[0].id : '' }));
      }
    }
  }, [formValues.projectId]);

  const handleProjectChange = (projectId: string) => {
    setFormValues(prev => ({ ...prev, projectId, progressUpdateId: '' }));
  };

  const handleUpdateChange = (updateId: string) => {
    setFormValues(prev => ({ ...prev, progressUpdateId: updateId }));
  };

  const handlePurposeChange = (index: number, field: keyof PaymentPurpose, value: any) => {
    setFormValues(prev => {
      const newPurposes = [...prev.purposes];
      newPurposes[index] = { ...newPurposes[index], [field]: value };
      return { ...prev, purposes: newPurposes };
    });
  };

  const handleAddPurpose = () => {
    setFormValues(prev => ({
      ...prev,
      purposes: [...prev.purposes, { type: "labour", amount: 0, images: [] }]
    }));
  };

  const handleRemovePurpose = (index: number) => {
    if (formValues.purposes.length <= 1) {
      toast.error("At least one payment purpose is required");
      return;
    }

    setFormValues(prev => ({
      ...prev,
      purposes: prev.purposes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formValues.projectId) {
      toast.error("Please select a project");
      return;
    }
    
    // Check that all purposes have amounts
    const invalidPurpose = formValues.purposes.find(p => p.amount <= 0);
    if (invalidPurpose) {
      toast.error("All payment amounts must be greater than zero");
      return;
    }
    
    setLoading(true);
    
    try {
      // Calculate total amount
      const totalAmount = formValues.purposes.reduce((sum, purpose) => sum + purpose.amount, 0);
      
      // Create payment request
      const paymentRequest: Omit<PaymentRequest, 'id'> = {
        projectId: formValues.projectId,
        progressUpdateId: formValues.progressUpdateId,
        date: new Date().toISOString(),
        purposes: formValues.purposes,
        status: 'pending',
        totalAmount
      };
      
      await createPaymentRequest(paymentRequest);
      
      toast.success("Payment request submitted successfully");
      
      // Reset form or navigate away
      navigate('/leader/view-payment');
      
    } catch (error) {
      console.error("Error submitting payment request:", error);
      toast.error("Failed to submit payment request");
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Find progress update details
  const getSelectedProgressUpdateDetails = () => {
    if (!formValues.progressUpdateId) return null;
    return progressUpdates.find(update => update.id === formValues.progressUpdateId);
  };

  // Get project name
  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Request Payment</h1>
        <p className="text-muted-foreground">
          Submit a payment request related to a project or progress update.
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-12">
          {/* Project Selection */}
          <Card className="md:col-span-12">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                Select the project for which you're requesting payment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="project">Project</Label>
                  <Select 
                    value={formValues.projectId} 
                    onValueChange={handleProjectChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.length > 0 ? (
                        projects.map(project => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No projects found</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                {formValues.projectId && (
                  <div className="space-y-2">
                    <Label htmlFor="progressUpdate">Related Progress Update (Optional)</Label>
                    <Select 
                      value={formValues.progressUpdateId || ''} 
                      onValueChange={handleUpdateChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a progress update" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {progressUpdates.length > 0 ? (
                          progressUpdates.map(update => (
                            <SelectItem key={update.id} value={update.id}>
                              {formatDate(update.date)} - {update.completedWork}m
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>No updates found</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              {/* Display details of selected progress update, if any */}
              {getSelectedProgressUpdateDetails() && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Progress Update Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Date:</span>
                    <span>{formatDate(getSelectedProgressUpdateDetails()!.date)}</span>
                    <span className="text-muted-foreground">Completed Work:</span>
                    <span>{getSelectedProgressUpdateDetails()!.completedWork} meters</span>
                    <span className="text-muted-foreground">Time Taken:</span>
                    <span>{getSelectedProgressUpdateDetails()!.timeTaken} hours</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Payment Purposes */}
          <Card className="md:col-span-12">
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>
                Specify what you're requesting payment for and the amount.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formValues.purposes.map((purpose, index) => (
                <div key={index} className="mb-6 last:mb-0">
                  {index > 0 && <Separator className="my-6" />}
                  
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Payment Purpose {index + 1}</h3>
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemovePurpose(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Purpose Type</Label>
                      <RadioGroup 
                        value={purpose.type}
                        onValueChange={(value) => handlePurposeChange(index, 'type', value as PaymentPurposeType)}
                      >
                        <div className="grid grid-cols-3 gap-2">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="food" id={`food-${index}`} />
                            <Label htmlFor={`food-${index}`} className="cursor-pointer">Food</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fuel" id={`fuel-${index}`} />
                            <Label htmlFor={`fuel-${index}`} className="cursor-pointer">Fuel</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="labour" id={`labour-${index}`} />
                            <Label htmlFor={`labour-${index}`} className="cursor-pointer">Labour</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="vehicle" id={`vehicle-${index}`} />
                            <Label htmlFor={`vehicle-${index}`} className="cursor-pointer">Vehicle</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="water" id={`water-${index}`} />
                            <Label htmlFor={`water-${index}`} className="cursor-pointer">Water</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="other" id={`other-${index}`} />
                            <Label htmlFor={`other-${index}`} className="cursor-pointer">Other</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`amount-${index}`}>Amount (₹)</Label>
                      <Input
                        id={`amount-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={purpose.amount}
                        onChange={(e) => handlePurposeChange(index, 'amount', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <Button 
                type="button"
                variant="outline" 
                className="mt-4 w-full"
                onClick={handleAddPurpose}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Another Purpose
              </Button>
            </CardContent>
            <CardFooter>
              <div className="w-full flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Total Amount:</p>
                  <p className="text-2xl font-bold">
                    ₹ {formValues.purposes.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                  </p>
                </div>
                <Button type="submit" size="lg" disabled={loading}>
                  Submit Request
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default LeaderRequestPayment;
