
export type UserRole = "leader" | "checker" | "owner" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface Project {
  id: string;
  name: string;
  leaderId: string;
  createdAt: string;
  workers: number;
  totalWork: number; // in meters
  completedWork: number; // in meters
}

export interface Vehicle {
  id: string;
  model: string;
  registrationNumber: string;
  pollutionCertExpiry: string;
  fitnessCertExpiry: string;
  additionalDetails: string;
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseType: string;
  experience: number;
  experienceYears?: number; // For backward compatibility
  isExternal: boolean;
  contactNumber?: string;
  address?: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface PhotoWithMetadata {
  dataUrl: string;
  timestamp: string;
  location: Location;
}

export interface ProgressUpdate {
  id: string;
  projectId: string;
  date: string;
  completedWork: number; // in meters
  timeTaken: number; // in hours
  photos: PhotoWithMetadata[];
  notes?: string;
  vehicleId?: string;
  startMeterReading?: PhotoWithMetadata;
  endMeterReading?: PhotoWithMetadata;
}

export interface PaymentRequest {
  id: string;
  projectId: string;
  progressUpdateId?: string;
  date: string;
  purposes: PaymentPurpose[];
  status: "pending" | "approved" | "rejected" | "scheduled" | "paid";
  checkerNotes?: string;
  scheduledDate?: string;
  totalAmount: number;
}

export interface PaymentPurpose {
  type: "food" | "fuel" | "labour" | "vehicle" | "water" | "other";
  amount: number;
  images: PhotoWithMetadata[];
}

export interface CorrectionRequest {
  id: string;
  progressUpdateId: string;
  message: string;
  type: "text" | "voice";
  dataUrl?: string; // For voice message
  timestamp: string;
  status: "pending" | "approved" | "rejected";
  checkerNotes?: string;
}

// Enhanced interfaces for tracking progress
export interface LeaderProgressStats {
  leaderId: string;
  leaderName: string;
  projectCount: number;
  totalDistance: number; // Total distance covered
  totalTime: number; // Total time spent
  completionPercentage: number; // Overall completion percentage
  recentUpdates: ProgressUpdate[];
}
