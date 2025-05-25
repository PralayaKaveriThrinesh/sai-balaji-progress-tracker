import { v4 as uuidv4 } from 'uuid';
import { Project, PaymentRequest, ProgressUpdate, Vehicle, Driver } from './types';

// Projects Storage
export const getProjects = (): Project[] => {
  const projects = localStorage.getItem('projects');
  return projects ? JSON.parse(projects) : [];
};

export const getProjectById = (id: string): Project | undefined => {
    const projects = getProjects();
    return projects.find(project => project.id === id);
};

export const getProjectsByLeaderId = (leaderId: string): Project[] => {
  const projects = getProjects();
  return projects.filter(project => project.leaderId === leaderId);
};

export const saveProject = (project: Omit<Project, 'id' | 'createdAt'>): Project => {
  const projects = getProjects();
  const newProject: Project = {
    ...project,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  projects.push(newProject);
  localStorage.setItem('projects', JSON.stringify(projects));
  return newProject;
};

export const updateProject = (updatedProject: Project): void => {
    const projects = getProjects();
    const updatedProjects = projects.map(project =>
        project.id === updatedProject.id ? updatedProject : project
    );
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
};

// Payment Requests Storage
export const getPaymentRequests = (): PaymentRequest[] => {
  const paymentRequests = localStorage.getItem('paymentRequests');
  return paymentRequests ? JSON.parse(paymentRequests) : [];
};

export const getPaymentRequestsByProjectId = (projectId: string): PaymentRequest[] => {
  const paymentRequests = getPaymentRequests();
  return paymentRequests.filter(request => request.projectId === projectId);
};

export const savePaymentRequest = (paymentRequest: Omit<PaymentRequest, 'id' | 'createdAt'>): PaymentRequest => {
  const paymentRequests = getPaymentRequests();
  const newPaymentRequest: PaymentRequest = {
    ...paymentRequest,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  paymentRequests.push(newPaymentRequest);
  localStorage.setItem('paymentRequests', JSON.stringify(paymentRequests));
  return newPaymentRequest;
};

// Progress Updates Storage
export const getProgressUpdates = (): ProgressUpdate[] => {
  const progressUpdates = localStorage.getItem('progressUpdates');
  return progressUpdates ? JSON.parse(progressUpdates) : [];
};

export const getProgressUpdatesByProjectId = (projectId: string): ProgressUpdate[] => {
  const progressUpdates = getProgressUpdates();
  return progressUpdates.filter(update => update.projectId === projectId);
};

export const addProgressUpdate = (progressUpdate: Omit<ProgressUpdate, 'id'>): void => {
  const progressUpdates = getProgressUpdates();
  const newProgressUpdate: ProgressUpdate = {
    ...progressUpdate,
    id: uuidv4(),
  };
  progressUpdates.push(newProgressUpdate);
  localStorage.setItem('progressUpdates', JSON.stringify(progressUpdates));
};

// Vehicles Storage
export const getAllVehicles = (): Vehicle[] => {
  const vehicles = localStorage.getItem('vehicles');
  return vehicles ? JSON.parse(vehicles) : [];
};

// Drivers Storage
export const getAllDrivers = (): Driver[] => {
  const drivers = localStorage.getItem('drivers');
  return drivers ? JSON.parse(drivers) : [];
};

// Generate Export Data
export const generateExportData = () => {
  const projects = getProjects();
  const paymentRequests = getPaymentRequests();
  const progressUpdates = getProgressUpdates();

  return {
    projects,
    paymentRequests,
    progressUpdates,
  };
};

// Updated getAllProjects to return all projects regardless of user role
export const getAllProjects = (): Project[] => {
  const projects = localStorage.getItem('projects');
  return projects ? JSON.parse(projects) : [];
};

// Updated getAllPaymentRequests to return all payment requests regardless of user role
export const getAllPaymentRequests = (): PaymentRequest[] => {
  const paymentRequests = localStorage.getItem('paymentRequests');
  return paymentRequests ? JSON.parse(paymentRequests) : [];
};

// Updated getAllProgressUpdates to return all progress updates regardless of user role
export const getAllProgressUpdates = (): ProgressUpdate[] => {
  const progressUpdates = localStorage.getItem('progressUpdates');
  return progressUpdates ? JSON.parse(progressUpdates) : [];
};

// Add helper functions for cross-dashboard visibility
export const getProjectsForDashboard = (userRole: string): Project[] => {
  // All roles can see all projects
  return getAllProjects();
};

export const getPaymentRequestsForDashboard = (userRole: string): PaymentRequest[] => {
  // All roles can see all payment requests
  return getAllPaymentRequests();
};

export const getProgressUpdatesForDashboard = (userRole: string): ProgressUpdate[] => {
  // All roles can see all progress updates
  return getAllProgressUpdates();
};
