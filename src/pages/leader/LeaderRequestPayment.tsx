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
import { Plus, Trash2, Upload, X, Camera } from 'lucide-react';
import { getProjectsByLeaderId, getProgressUpdatesByProjectId, createPaymentRequest } from '@/lib/storage';
import { Project, ProgressUpdate, PaymentPurpose, PaymentRequest } from '@/lib/types';
import { useCamera } from '@/hooks/use-camera';

type PaymentPurposeType = "food" | "fuel" | "labour" | "vehicle" | "water" | "other";

interface PaymentForm {
  projectId: string;
  progressUpdateId: string; // Changed from optional to required
  purposes: {
    type: PaymentPurposeType;
    amount: number;
    remarks?: string;
    images: { dataUrl: string; timestamp: string; location: { latitude: number; longitude: number } }[];
  }[];
}

const LeaderRequestPayment: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { captureImage } = useCamera();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([]);
  const [formValues, setFormValues] = useState<PaymentForm>({
    projectId: '',
    progressUpdateId: '', // Now required
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
        
        // Set first progress update as default if available
        if (updates.length > 0) {
          setFormValues(prev => ({ ...prev, progressUpdateId: updates[0].id }));
        }
      }
    }
  }, [user]);

  // Load progress updates when project changes
  useEffect(() => {
    if (formValues.projectId) {
      const updates = getProgressUpdatesByProjectId(formValues.projectId);
      setProgressUpdates(updates);
      
      // Set first progress update as default if available
      if (updates.length > 0) {
        setFormValues(prev => ({ ...prev, progressUpdateId: updates[0].id }));
      } else {
        setFormValues(prev => ({ ...prev, progressUpdateId: '' }));
      }
    }
  }, [formValues.projectId]);

  const handleProjectChange = (projectId: string) => {
    setFormValues(prev => ({ ...prev, projectId, progressUpdateId: '' }));
  };

  const handleUpdateChange = (updateId: string) => {
    setFormValues(prev => ({ ...prev, progressUpdateId: updateId }));
  };

  const handlePurposeChange = (index: number, field: keyof PaymentPurpose | 'remarks', value: any) => {
    setFormValues(prev => {
      const newPurposes = [...prev.purposes];
      if (field === 'remarks') {
        newPurposes[index] = { 
          ...newPurposes[index], 
          remarks: value 
        };
      } else {
        newPurposes[index] = { 
          ...newPurposes[index], 
          [field]: value 
        };
      }
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
      toast.error(t("app.payments.minOnePurpose"));
      return;
    }

    setFormValues(prev => ({
      ...prev,
      purposes: prev.purposes.filter((_, i) => i !== index)
    }));
  };

  // New function to handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, purposeIndex: number) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    try {
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        
        reader.onload = (e) => {
          if (e.target && typeof e.target.result === 'string') {
            const dataUrl = e.target.result;
            
            // Get current position
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                
                setFormValues(prev => {
                  const newPurposes = [...prev.purposes];
                  newPurposes[purposeIndex].images = [
                    ...newPurposes[purposeIndex].images,
                    {
                      dataUrl,
                      timestamp: new Date().toISOString(),
                      location: { latitude, longitude }
                    }
                  ];
                  return { ...prev, purposes: newPurposes };
                });
              },
              (error) => {
                console.error("Geolocation error:", error);
                // Use default location if geolocation fails
                setFormValues(prev => {
                  const newPurposes = [...prev.purposes];
                  newPurposes[purposeIndex].images = [
                    ...newPurposes[purposeIndex].images,
                    {
                      dataUrl,
                      timestamp: new Date().toISOString(),
                      location: { latitude: 0, longitude: 0 }
                    }
                  ];
                  return { ...prev, purposes: newPurposes };
                });
              }
            );
          }
        };
        
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(t("common.uploadError"));
    }
  };

  // Function to capture image using device camera
  const handleCaptureImage = async (purposeIndex: number) => {
    try {
      const result = await captureImage();
      if (result && typeof result !== 'string') {
        setFormValues(prev => {
          const newPurposes = [...prev.purposes];
          newPurposes[purposeIndex].images = [
            ...newPurposes[purposeIndex].images,
            {
              dataUrl: result.dataUrl,
              timestamp: new Date().toISOString(),
              location: result.location
            }
          ];
          return { ...prev, purposes: newPurposes };
        });
      }
    } catch (error) {
      console.error("Camera capture error:", error);
      toast.error(t("common.cameraError"));
    }
  };

  // Function to remove uploaded image
  const handleRemoveImage = (purposeIndex: number, imageIndex: number) => {
    setFormValues(prev => {
      const newPurposes = [...prev.purposes];
      newPurposes[purposeIndex].images = newPurposes[purposeIndex].images.filter((_, i) => i !== imageIndex);
      return { ...prev, purposes: newPurposes };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formValues.projectId) {
      toast.error(t("app.payments.selectProject"));
      return;
    }
    
    // Validate progress update is selected (now mandatory)
    if (!formValues.progressUpdateId) {
      toast.error(t("app.payments.selectProgressUpdate"));
      return;
    }
    
    // Check that all purposes have amounts
    const invalidPurpose = formValues.purposes.find(p => p.amount <= 0);
    if (invalidPurpose) {
      toast.error(t("app.payments.validAmounts"));
      return;
    }
    
    // Check that "other" type has remarks
    const otherTypeWithoutRemarks = formValues.purposes.find(p => 
      p.type === "other" && (!p.remarks || p.remarks.trim() === "")
    );
    if (otherTypeWithoutRemarks) {
      toast.error(t("app.payments.remarksRequired"));
      return;
    }
    
    setLoading(true);
    
    try {
      // Calculate total amount
      const totalAmount = formValues.purposes.reduce((sum, purpose) => sum + purpose.amount, 0);
      
      // Create payment request with images
      const paymentRequest: Omit<PaymentRequest, 'id'> = {
        projectId: formValues.projectId,
        progressUpdateId: formValues.progressUpdateId,
        date: new Date().toISOString(),
        purposes: formValues.purposes,
        status: 'pending',
        totalAmount
      };
      
      await createPaymentRequest(paymentRequest);
      
      toast.success(t("app.payments.requestSubmitted"));
      
      // Reset form or navigate away
      navigate('/leader/view-payment');
      
    } catch (error) {
      console.error("Error submitting payment request:", error);
      toast.error(t("app.payments.submitError"));
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
    return project ? project.name : t("common.unknownProject");
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t("app.payments.requestPayment")}</h1>
        <p className="text-muted-foreground">
          {t("app.payments.requestDescription")}
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-12">
          {/* Project Selection */}
          <Card className="md:col-span-12">
            <CardHeader>
              <CardTitle>{t("app.payments.projectDetails")}</CardTitle>
              <CardDescription>
                {t("app.payments.selectProjectDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="project">{t("app.common.project")}</Label>
                  <Select 
                    value={formValues.projectId} 
                    onValueChange={handleProjectChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("app.payments.selectProject")} />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.length > 0 ? (
                        projects.map(project => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-projects" disabled>{t("app.common.noProjects")}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                {formValues.projectId && (
                  <div className="space-y-2">
                    <Label htmlFor="progressUpdate">
                      {t("app.payments.relatedProgressUpdate")} <span className="text-destructive">*</span>
                    </Label>
                    <Select 
                      value={formValues.progressUpdateId} 
                      onValueChange={handleUpdateChange}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("app.payments.selectProgressUpdate")} />
                      </SelectTrigger>
                      <SelectContent>
                        {progressUpdates.length > 0 ? (
                          progressUpdates.map(update => (
                            <SelectItem key={update.id} value={update.id}>
                              {formatDate(update.date)} - {update.completedWork}m
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-updates" disabled>{t("app.common.noUpdates")}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              {/* Display details of selected progress update, if any */}
              {getSelectedProgressUpdateDetails() && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">{t("app.progress.updateDetails")}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">{t("app.common.date")}:</span>
                    <span>{formatDate(getSelectedProgressUpdateDetails()!.date)}</span>
                    <span className="text-muted-foreground">{t("app.progress.completedWork")}:</span>
                    <span>{getSelectedProgressUpdateDetails()!.completedWork} meters</span>
                    <span className="text-muted-foreground">{t("app.progress.timeTaken")}:</span>
                    <span>{getSelectedProgressUpdateDetails()!.timeTaken} hours</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Payment Purposes */}
          <Card className="md:col-span-12">
            <CardHeader>
              <CardTitle>{t("app.payments.paymentDetails")}</CardTitle>
              <CardDescription>
                {t("app.payments.specifyPurpose")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formValues.purposes.map((purpose, index) => (
                <div key={index} className="mb-6 last:mb-0">
                  {index > 0 && <Separator className="my-6" />}
                  
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">{t("app.payments.purpose")} {index + 1}</h3>
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
                      <Label>{t("app.payments.purposeType")}</Label>
                      <RadioGroup 
                        value={purpose.type}
                        onValueChange={(value) => handlePurposeChange(index, 'type', value as PaymentPurposeType)}
                      >
                        <div className="grid grid-cols-3 gap-2">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="food" id={`food-${index}`} />
                            <Label htmlFor={`food-${index}`} className="cursor-pointer">{t("app.payments.types.food")}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fuel" id={`fuel-${index}`} />
                            <Label htmlFor={`fuel-${index}`} className="cursor-pointer">{t("app.payments.types.fuel")}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="labour" id={`labour-${index}`} />
                            <Label htmlFor={`labour-${index}`} className="cursor-pointer">{t("app.payments.types.labour")}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="vehicle" id={`vehicle-${index}`} />
                            <Label htmlFor={`vehicle-${index}`} className="cursor-pointer">{t("app.payments.types.vehicle")}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="water" id={`water-${index}`} />
                            <Label htmlFor={`water-${index}`} className="cursor-pointer">{t("app.payments.types.water")}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="other" id={`other-${index}`} />
                            <Label htmlFor={`other-${index}`} className="cursor-pointer">{t("app.payments.types.other")}</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`amount-${index}`}>{t("app.payments.amount")} (₹)</Label>
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
                  
                  {/* Remarks field for "other" type */}
                  {purpose.type === "other" && (
                    <div className="mt-4">
                      <Label htmlFor={`remarks-${index}`}>{t("app.payments.remarks")} <span className="text-destructive">*</span></Label>
                      <Textarea
                        id={`remarks-${index}`}
                        value={purpose.remarks || ''}
                        onChange={(e) => handlePurposeChange(index, 'remarks', e.target.value)}
                        placeholder={t("app.payments.remarksPlaceholder")}
                        className="mt-1"
                        required
                      />
                    </div>
                  )}
                  
                  {/* Image upload section */}
                  <div className="mt-4 space-y-2">
                    <Label>{t("app.payments.imageProof")}</Label>
                    <div className="flex flex-wrap gap-2">
                      {purpose.images.map((image, imageIndex) => (
                        <div key={imageIndex} className="relative w-24 h-24">
                          <img
                            src={image.dataUrl}
                            alt={`Proof ${imageIndex + 1}`}
                            className="w-full h-full object-cover rounded-md"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            onClick={() => handleRemoveImage(index, imageIndex)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      
                      <div className="flex gap-2">
                        <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50">
                          <Upload className="w-6 h-6 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground mt-1">{t("app.common.upload")}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, index)}
                            multiple
                          />
                        </label>
                        
                        <Button
                          type="button"
                          variant="outline"
                          className="w-24 h-24 flex flex-col items-center justify-center"
                          onClick={() => handleCaptureImage(index)}
                        >
                          <Camera className="w-6 h-6 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground mt-1">{t("app.common.capture")}</span>
                        </Button>
                      </div>
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
                <Plus className="mr-2 h-4 w-4" /> {t("app.payments.addPurpose")}
              </Button>
            </CardContent>
            <CardFooter>
              <div className="w-full flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{t("app.payments.totalAmount")}:</p>
                  <p className="text-2xl font-bold">
                    ₹ {formValues.purposes.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                  </p>
                </div>
                <Button type="submit" size="lg" disabled={loading}>
                  {t("app.payments.submitRequest")}
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
