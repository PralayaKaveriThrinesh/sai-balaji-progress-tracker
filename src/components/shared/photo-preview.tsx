
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PhotoWithMetadata, Location } from '@/lib/types';
import { getCurrentLocation } from '@/lib/storage';

interface PhotoPreviewProps {
  photo?: PhotoWithMetadata;
  onRemove?: () => void;
  onCapture?: (photo: PhotoWithMetadata) => void;
}

export function PhotoPreview({ photo, onRemove, onCapture }: PhotoPreviewProps) {
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Format timestamp to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };
  
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Camera access denied or not available. Please check permissions.");
    }
  };
  
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/jpeg');
    
    // Get current location
    const location = await getCurrentLocation();
    
    // Create photo with metadata
    const photoData: PhotoWithMetadata = {
      dataUrl,
      timestamp: new Date().toISOString(),
      location,
    };
    
    // Stop the camera
    stopCamera();
    
    // Call onCapture callback with the photo data
    if (onCapture) {
      onCapture(photoData);
    }
  };
  
  const stopCamera = () => {
    if (!videoRef.current) return;
    
    const stream = videoRef.current.srcObject as MediaStream;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setIsCapturing(false);
  };
  
  if (photo) {
    // Display captured photo
    return (
      <Card className="overflow-hidden relative group">
        <img
          src={photo.dataUrl}
          alt="Captured"
          className="w-full aspect-video object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-3">
          <div className="text-sm">
            <div>{formatDate(photo.timestamp)}</div>
            <div className="text-xs">
              GPS: {photo.location.latitude.toFixed(6)}, {photo.location.longitude.toFixed(6)}
            </div>
          </div>
        </div>

        {onRemove && (
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remove photo"
          >
            ✕
          </button>
        )}
      </Card>
    );
  }
  
  // Display camera view or capture button
  return (
    <div className="relative">
      {isCapturing ? (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full aspect-video object-cover rounded-md"
          />
          <div className="absolute bottom-4 inset-x-0 flex justify-center">
            <Button 
              onClick={capturePhoto}
              className="rounded-full w-16 h-16 bg-white border-4 border-primary"
              variant="outline"
              aria-label="Take photo"
            />
          </div>
          <Button
            onClick={stopCamera}
            className="absolute top-4 right-4"
            variant="destructive"
            size="sm"
          >
            Cancel
          </Button>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      ) : (
        <Button 
          onClick={startCamera} 
          className="w-full py-8 border-2 border-dashed border-muted-foreground"
          variant="outline"
        >
          Capture Photo
        </Button>
      )}
    </div>
  );
}
