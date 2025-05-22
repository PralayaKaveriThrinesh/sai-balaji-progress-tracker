import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { Project, PaymentPurpose, PhotoWithMetadata } from '@/lib/types';
import { useLanguage } from '@/context/language-context';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "@radix-ui/react-icons"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Camera } from 'lucide-react';
import { takePhoto } from '@/lib/camera';

const LeaderRequestPayment = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [purposes, setPurposes] = useState<PaymentPurpose[]>([
    { type: "food", amount: 0, images: [], remarks: "" }
  ]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Fetch projects from API or local storage
    const mockProjects: Project[] = [
      { id: '1', name: 'Project A', leaderId: '1', createdAt: '2024-01-01', workers: 10, totalWork: 1000, completedWork: 500 },
      { id: '2', name: 'Project B', leaderId: '1', createdAt: '2024-01-01', workers: 10, totalWork: 1000, completedWork: 500 },
    ];
    setProjects(mockProjects);
  }, []);

  useEffect(() => {
    // Calculate total amount whenever purposes change
    const newTotal = purposes.reduce((acc, purpose) => acc + (purpose.amount || 0), 0);
    setTotalAmount(newTotal);
  }, [purposes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProject || !date || purposes.length === 0) {
      toast.error(t("app.paymentRequest.allFieldsRequired"));
      return;
    }

    setLoading(true);

    try {
      // Prepare payment request data
      const paymentRequest = {
        projectId: selectedProject,
        date: date.toISOString(),
        purposes: purposes,
        totalAmount: totalAmount,
      };

      // Send payment request to API
      console.log('Payment Request Data:', paymentRequest);
      toast.success(t("app.paymentRequest.requestSent"));
      navigate('/leader/view-payment');
    } catch (error) {
      console.error('Payment request error:', error);
      toast.error(t("app.paymentRequest.requestFailed"));
    } finally {
      setLoading(false);
    }
  };

  // Fix: Handle camera results with proper null checks
  const handleCameraCapture = async (purpose: PaymentPurpose) => {
    try {
      const result = await takePhoto();
      
      // Add null check for result
      if (!result) {
        toast.error("Failed to capture photo");
        return;
      }
      
      // Update purposes with the new photo
      setPurposes(prevPurposes =>
        prevPurposes.map(p => {
          if (p === purpose) {
            return {
              ...p,
              images: [...p.images, {
                dataUrl: result.dataUrl,
                timestamp: new Date().toISOString(),
                location: result.location || { latitude: 0, longitude: 0 }
              }]
            };
          }
          return p;
        })
      );
      
      toast.success("Photo captured successfully");
    } catch (error) {
      console.error("Error capturing photo:", error);
      toast.error("Failed to capture photo");
    }
  };

  // Fix: Implement the missing handler functions
  const handleRemovePurpose = (index: number) => {
    setPurposes(prevPurposes => prevPurposes.filter((_, i) => i !== index));
  };
  
  const handlePurposeChange = (index: number, field: keyof PaymentPurpose, value: any) => {
    setPurposes(prevPurposes => 
      prevPurposes.map((purpose, i) => 
        i === index ? { ...purpose, [field]: value } : purpose
      )
    );
  };
  
  const handleAddPurpose = () => {
    setPurposes(prevPurposes => [
      ...prevPurposes, 
      { 
        type: "food", 
        amount: 0, 
        images: [],
        remarks: "" 
      }
    ]);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">{t("app.paymentRequest.title")}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="project">{t("app.paymentRequest.project")}</Label>
          <Select onValueChange={setSelectedProject}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("app.paymentRequest.selectProject")} />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>{t("app.paymentRequest.date")}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                {date ? format(date, "PPP") : <span>{t("app.paymentRequest.pickDate")}</span>}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) =>
                  date > new Date()
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label>{t("app.paymentRequest.purposes")}</Label>
          {purposes.map((purpose, index) => (
            <div key={index} className="mb-4 p-4 border rounded">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`type-${index}`}>{t("app.paymentRequest.type")}</Label>
                  <Select value={purpose.type} onValueChange={(value) => handlePurposeChange(index, 'type', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("app.paymentRequest.selectType")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food">{t("app.paymentRequest.food")}</SelectItem>
                      <SelectItem value="fuel">{t("app.paymentRequest.fuel")}</SelectItem>
                      <SelectItem value="labour">{t("app.paymentRequest.labour")}</SelectItem>
                      <SelectItem value="vehicle">{t("app.paymentRequest.vehicle")}</SelectItem>
                      <SelectItem value="water">{t("app.paymentRequest.water")}</SelectItem>
                      <SelectItem value="other">{t("app.paymentRequest.other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`amount-${index}`}>{t("app.paymentRequest.amount")}</Label>
                  <Input
                    type="number"
                    id={`amount-${index}`}
                    value={purpose.amount?.toString() || ''}
                    onChange={(e) => handlePurposeChange(index, 'amount', Number(e.target.value))}
                    placeholder={t("app.paymentRequest.amountPlaceholder")}
                  />
                </div>
                <div>
                  <Label>{t("app.paymentRequest.images")}</Label>
                  <div className="flex space-x-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => handleCameraCapture(purpose)}>
                      <Camera className="mr-2 h-4 w-4" />
                      {t("app.paymentRequest.capture")}
                    </Button>
                  </div>
                  <div className="flex mt-2 space-x-2">
                    {purpose.images.map((image, i) => (
                      <img key={i} src={image.dataUrl} alt="Purpose" className="w-16 h-16 object-cover rounded" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <Label htmlFor={`remarks-${index}`}>{t("app.paymentRequest.remarks")}</Label>
                <Textarea
                  id={`remarks-${index}`}
                  placeholder={t("app.paymentRequest.remarksPlaceholder")}
                  value={purpose.remarks || ''}
                  onChange={(e) => handlePurposeChange(index, 'remarks', e.target.value)}
                />
              </div>
              <Button type="button" variant="destructive" size="sm" className="mt-2" onClick={() => handleRemovePurpose(index)}>
                {t("app.paymentRequest.removePurpose")}
              </Button>
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={handleAddPurpose}>
            {t("app.paymentRequest.addPurpose")}
          </Button>
        </div>

        <div>
          <Label htmlFor="total">{t("app.paymentRequest.totalAmount")}</Label>
          <Input type="number" id="total" value={totalAmount.toString()} readOnly />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? t("common.loading") : t("app.paymentRequest.submit")}
        </Button>
      </form>
    </div>
  );
};

export default LeaderRequestPayment;
