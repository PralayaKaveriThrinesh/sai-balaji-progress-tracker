
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { Upload, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { getProjectsByLeaderId } from '@/lib/storage';
import { saveFinalSubmission, updateFinalSubmission, getFinalSubmissionsByLeader } from '@/lib/tender-storage';
import { FinalSubmission, PhotoWithMetadata } from '@/lib/tender-types';
import { Project } from '@/lib/types';
import { Progress } from '@/components/ui/progress';

const LeaderFinalSubmission = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeSubmission, setActiveSubmission] = useState<FinalSubmission | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [projectImages, setProjectImages] = useState<Record<string, PhotoWithMetadata[]>>({});

  useEffect(() => {
    if (user) {
      const userProjects = getProjectsByLeaderId(user.id);
      setProjects(userProjects);
      
      // Check for active submission
      const submissions = getFinalSubmissionsByLeader(user.id);
      const inProgress = submissions.find(s => s.status === 'in_progress');
      if (inProgress) {
        setActiveSubmission(inProgress);
        setSelectedProject(inProgress.projectId);
        setNotes(inProgress.notes || '');
        
        // Calculate remaining time
        const startTime = new Date(inProgress.timerStartedAt).getTime();
        const duration = inProgress.timerDuration * 1000; // Convert to milliseconds
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, duration - elapsed);
        setTimeRemaining(remaining);
        
        // Set up existing images
        const imagesByProject: Record<string, PhotoWithMetadata[]> = {};
        inProgress.images.forEach(image => {
          if (!imagesByProject[inProgress.projectId]) {
            imagesByProject[inProgress.projectId] = [];
          }
          imagesByProject[inProgress.projectId].push(image);
        });
        setProjectImages(imagesByProject);
      }
    }
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeSubmission && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1000) {
            // Timer expired
            handleTimerExpired();
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSubmission, timeRemaining]);

  const handleStartSubmission = () => {
    if (!selectedProject) {
      toast.error('Please select a project first');
      return;
    }

    const submission = saveFinalSubmission({
      projectId: selectedProject,
      leaderId: user?.id || '',
      submissionDate: new Date().toISOString(),
      timerDuration: 600, // 10 minutes
      timerStartedAt: new Date().toISOString(),
      status: 'in_progress',
      images: [],
      notes: notes
    });

    setActiveSubmission(submission);
    setTimeRemaining(600000); // 10 minutes in milliseconds
    toast.success('Final submission timer started! You have 10 minutes to upload images.');
  };

  const handleTimerExpired = () => {
    if (activeSubmission) {
      const allImages = Object.values(projectImages).flat();
      updateFinalSubmission(activeSubmission.id, {
        status: 'expired',
        timerEndedAt: new Date().toISOString(),
        images: allImages,
        notes: notes
      });
      
      setActiveSubmission(null);
      setTimeRemaining(0);
      toast.warning('Time expired! Submission has been finalized automatically.');
    }
  };

  const handleCompleteSubmission = () => {
    if (activeSubmission) {
      const allImages = Object.values(projectImages).flat();
      updateFinalSubmission(activeSubmission.id, {
        status: 'completed',
        timerEndedAt: new Date().toISOString(),
        images: allImages,
        notes: notes
      });
      
      setActiveSubmission(null);
      setTimeRemaining(0);
      setProjectImages({});
      setNotes('');
      toast.success('Final submission completed successfully! Admin, Checker, and Owner have been notified.');
    }
  };

  const handleImageUpload = (projectId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const newImage: PhotoWithMetadata = {
        dataUrl: reader.result as string,
        timestamp: new Date().toISOString(),
        location: { latitude: 0, longitude: 0 }
      };

      setProjectImages(prev => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), newImage]
      }));
      
      toast.success('Image uploaded successfully');
    };
    
    reader.onerror = () => {
      toast.error('Failed to upload image');
    };
    
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (projectId: string, imageIndex: number) => {
    setProjectImages(prev => ({
      ...prev,
      [projectId]: prev[projectId]?.filter((_, index) => index !== imageIndex) || []
    }));
  };

  const formatTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    if (!activeSubmission) return 0;
    const totalDuration = activeSubmission.timerDuration * 1000;
    const elapsed = totalDuration - timeRemaining;
    return (elapsed / totalDuration) * 100;
  };

  if (user?.role !== 'leader') {
    return <div>Access denied. Leader only.</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Final Submission</h1>
        <p className="text-muted-foreground">
          Upload all required project images within the time limit
        </p>
      </div>

      {!activeSubmission ? (
        <Card>
          <CardHeader>
            <CardTitle>Start Final Submission</CardTitle>
            <CardDescription>
              Begin the 10-minute timer to upload all project documentation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select a project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes for the submission"
                rows={3}
              />
            </div>
            
            <Button onClick={handleStartSubmission} className="w-full" disabled={!selectedProject}>
              <Clock className="mr-2 h-4 w-4" />
              Start 10-Minute Timer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Timer Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Time Remaining: {formatTime(timeRemaining)}
              </CardTitle>
              <CardDescription>
                {timeRemaining > 0 ? 'Upload images for your projects before time runs out' : 'Time expired!'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={getProgressPercentage()} className="w-full" />
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-muted-foreground">
                  Total images uploaded: {Object.values(projectImages).flat().length}
                </span>
                {timeRemaining > 0 && (
                  <Button onClick={handleCompleteSubmission}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Submission
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Project Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Project Documentation</CardTitle>
              <CardDescription>
                Upload images for {projects.find(p => p.id === selectedProject)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Images ({(projectImages[selectedProject] || []).length})
                  </span>
                  {timeRemaining > 0 && (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(selectedProject, e)}
                        className="hidden"
                        id={`upload-${selectedProject}`}
                      />
                      <label htmlFor={`upload-${selectedProject}`}>
                        <Button variant="outline" size="sm" asChild>
                          <span>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Image
                          </span>
                        </Button>
                      </label>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {(projectImages[selectedProject] || []).map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image.dataUrl}
                        alt={`Project image ${index + 1}`}
                        className="w-full h-32 object-cover rounded border"
                      />
                      {timeRemaining > 0 && (
                        <button
                          onClick={() => handleRemoveImage(selectedProject, index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1">
                        {new Date(image.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Submission Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes for the submission"
                rows={3}
                disabled={timeRemaining === 0}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LeaderFinalSubmission;
