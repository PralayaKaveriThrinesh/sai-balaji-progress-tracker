import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PhotoPreview } from '@/components/shared/photo-preview';
import { Project, PaymentRequest, PaymentPurpose, PhotoWithMetadata } from '@/lib/types';
import { getAllProjects, createPaymentRequest, getProjectById } from '@/lib/storage';
import { Plus, X } from 'lucide-react';

const LeaderRequestPayment: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [purposes, setPurposes] = useState<PaymentPurpose[]>([]);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [amount, setAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fix the type issues
  const [paymentType, setPaymentType] = useState<"food" | "fuel" | "labour" | "vehicle" | "water" | "other">("food");

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const allProjects = getAllProjects().filter(project => project.leaderId === user.id);
    setProjects(allProjects);
  }, [user, navigate]);

  useEffect(() => {
    // Calculate total amount whenever purposes change
    const newTotal = purposes.reduce((acc, purpose) => acc + purpose.amount, 0);
    setTotalAmount(newTotal);
  }, [purposes]);

  const addPurpose = () => {
    if (!amount) {
      toast({
        title: "Error",
        description: "Please enter an amount for the payment purpose.",
        variant: "destructive",
      });
      return;
    }

    // Replace any instances of empty string "" with "food" as the default value
    // And ensure all payment purposes have a valid type
    const newPurpose: PaymentPurpose = {
      type: paymentType, // Use "food" instead of ""
      amount: Number(amount),
      images: []
    };

    setPurposes([...purposes, newPurpose]);
    setAmount(''); // Clear the amount input after adding
  };

  const removePurpose = (index: number) => {
    const newPurposes = [...purposes];
    newPurposes.splice(index, 1);
    setPurposes(newPurposes);
  };

  const handleImageCapture = (index: number, photo: PhotoWithMetadata) => {
    const newPurposes = [...purposes];
    newPurposes[index].images = [...newPurposes[index].images, photo];
    setPurposes(newPurposes);
  };

  const removeImage = (purposeIndex: number, imageIndex: number) => {
    const newPurposes = [...purposes];
    newPurposes[purposeIndex].images.splice(imageIndex, 1);
    setPurposes(newPurposes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!selectedProject) {
      toast({
        title: "Error",
        description: "Please select a project.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (purposes.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one payment purpose.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const project = getProjectById(selectedProject);
    if (!project) {
      toast({
        title: "Error",
        description: "Selected project not found.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const newPaymentRequest: PaymentRequest = {
      id: `payment-${Date.now()}`,
      projectId: selectedProject,
      date: date,
      purposes: purposes,
      status: "pending",
      totalAmount: totalAmount,
    };

    createPaymentRequest(newPaymentRequest);

    toast({
      title: "Success",
      description: "Payment request submitted successfully!",
    });

    navigate('/leader/view-payment');
    setIsSubmitting(false);
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-3xl mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Request Payment</CardTitle>
          <CardDescription>Submit a payment request for your project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="project">Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="paymentType">Payment Purpose</Label>
              <div className="flex space-x-2">
                <Select value={paymentType} onValueChange={setPaymentType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select purpose" />
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
                <Input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <Button type="button" onClick={addPurpose}><Plus className="mr-2" />Add</Button>
              </div>
            </div>
            <div>
              <Label>Payment Purposes</Label>
              {purposes.map((purpose, index) => (
                <Card key={index} className="mb-4">
                  <CardHeader>
                    <CardTitle>{purpose.type}</CardTitle>
                    <CardDescription>Amount: {purpose.amount}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <Label>Photos</Label>
                      <div className="flex space-x-2">
                        {purpose.images.map((photo, photoIndex) => (
                          <div key={photoIndex} className="relative w-32">
                            <img src={photo.dataUrl} alt="Payment" className="w-full aspect-square object-cover rounded-md" />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-0 right-0 rounded-sm opacity-0 group-hover:opacity-100 transition"
                              onClick={() => removeImage(index, photoIndex)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {purpose.images.length < 3 && (
                          <div className="w-32">
                            <PhotoPreview
                              buttonText="Add Photo"
                              onCapture={(photo) => handleImageCapture(index, photo)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="button" variant="destructive" size="sm" onClick={() => removePurpose(index)}>
                      Remove
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <div>
              <Label>Total Amount: ₹{totalAmount}</Label>
            </div>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderRequestPayment;
