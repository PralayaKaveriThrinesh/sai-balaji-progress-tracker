
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
  isExternal: boolean;
}

export interface ProgressUpdate {
  id: string;
  projectId: string;
  date: string;
  workCompleted: number; // in meters
  timeSpent: number; // in hours
  photos: ProgressPhoto[];
  vehicleData?: {
    vehicleId: string;
    startMeter: {
      reading: number;
      photo: string;
      timestamp: string;
      location: Location;
    };
    endMeter: {
      reading: number;
      photo: string;
      timestamp: string;
      location: Location;
    };
    driver: string; // driverId
  };
}

export interface ProgressPhoto {
  id: string;
  dataUrl: string;
  timestamp: string;
  location: Location;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface PaymentRequest {
  id: string;
  projectId: string;
  progressUpdateId: string;
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
  images: {
    dataUrl: string;
    timestamp: string;
    location: Location;
  }[];
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
