import { 
  User, Project, Vehicle, Driver, ProgressUpdate, 
  PaymentRequest, CorrectionRequest, Location, UserRole, 
  LeaderProgressStats
} from "./types";

// LocalStorage keys
const STORAGE_KEYS = {
  USERS: 'saibalaji_users',
  CURRENT_USER: 'saibalaji_current_user',
  PROJECTS: 'saibalaji_projects',
  VEHICLES: 'saibalaji_vehicles',
  DRIVERS: 'saibalaji_drivers',
  PROGRESS_UPDATES: 'saibalaji_progress_updates',
  PAYMENT_REQUESTS: 'saibalaji_payment_requests',
  CORRECTION_REQUESTS: 'saibalaji_correction_requests',
};

// Initialize with some default data if storage is empty
export const initializeStorage = () => {
  // Default admin user
  if (!getItem(STORAGE_KEYS.USERS)) {
    const defaultUsers: User[] = [
      {
        id: "admin-1",
        name: "Admin User",
        email: "admin@saibalaji.com",
        password: "admin123",
        role: "admin",
      },
      {
        id: "leader-1",
        name: "Leader User",
        email: "leader@saibalaji.com",
        password: "leader123",
        role: "leader",
      },
      {
        id: "checker-1",
        name: "Checker User",
        email: "checker@saibalaji.com",
        password: "checker123",
        role: "checker",
      },
      {
        id: "owner-1",
        name: "Owner User",
        email: "owner@saibalaji.com",
        password: "owner123",
        role: "owner",
      },
    ];
    setItem(STORAGE_KEYS.USERS, defaultUsers);
  }

  // Other initializations can be added here
  if (!getItem(STORAGE_KEYS.VEHICLES)) {
    const defaultVehicles: Vehicle[] = [
      {
        id: "vehicle-1",
        model: "Tata Truck 407",
        registrationNumber: "MH12AB1234",
        pollutionCertExpiry: "2025-12-31",
        fitnessCertExpiry: "2025-10-15",
        additionalDetails: "Capacity: 2.5 tons",
      },
      {
        id: "vehicle-2",
        model: "JCB 3DX",
        registrationNumber: "MH12CD5678",
        pollutionCertExpiry: "2025-11-20",
        fitnessCertExpiry: "2025-09-30",
        additionalDetails: "Excavator",
      },
    ];
    setItem(STORAGE_KEYS.VEHICLES, defaultVehicles);
  }

  if (!getItem(STORAGE_KEYS.DRIVERS)) {
    const defaultDrivers: Driver[] = [
      {
        id: "driver-1",
        name: "Rajesh Kumar",
        licenseNumber: "MH1220210012345",
        licenseType: "Heavy Vehicle",
        experience: 5,
        isExternal: false,
      },
      {
        id: "driver-2",
        name: "Sunil Patil",
        licenseNumber: "MH1220180067890",
        licenseType: "Heavy Vehicle",
        experience: 8,
        isExternal: false,
      },
    ];
    setItem(STORAGE_KEYS.DRIVERS, defaultDrivers);
  }

  if (!getItem(STORAGE_KEYS.PROJECTS)) {
    setItem(STORAGE_KEYS.PROJECTS, []);
  }

  if (!getItem(STORAGE_KEYS.PROGRESS_UPDATES)) {
    setItem(STORAGE_KEYS.PROGRESS_UPDATES, []);
  }

  if (!getItem(STORAGE_KEYS.PAYMENT_REQUESTS)) {
    setItem(STORAGE_KEYS.PAYMENT_REQUESTS, []);
  }

  if (!getItem(STORAGE_KEYS.CORRECTION_REQUESTS)) {
    setItem(STORAGE_KEYS.CORRECTION_REQUESTS, []);
  }
};

// Generic helper functions
export function getItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  } catch (error) {
    console.error(`Error getting item from storage: ${key}`, error);
    return null;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting item to storage: ${key}`, error);
  }
}

// User management
export function getAllUsers(): User[] {
  return getItem<User[]>(STORAGE_KEYS.USERS) || [];
}

export function getUserById(id: string): User | null {
  const users = getAllUsers();
  return users.find(user => user.id === id) || null;
}

export function getUserByEmail(email: string): User | null {
  const users = getAllUsers();
  return users.find(user => user.email === email) || null;
}

export function createUser(user: Omit<User, 'id'>): User {
  const users = getAllUsers();
  const newUser = {
    ...user,
    id: `user-${Date.now()}`
  };
  users.push(newUser);
  setItem(STORAGE_KEYS.USERS, users);
  return newUser;
}

export function updateUser(user: User): void {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index !== -1) {
    users[index] = user;
    setItem(STORAGE_KEYS.USERS, users);
  }
}

export function deleteUser(id: string): void {
  const users = getAllUsers();
  const filteredUsers = users.filter(user => user.id !== id);
  setItem(STORAGE_KEYS.USERS, filteredUsers);
}

export function setCurrentUser(user: User): void {
  setItem(STORAGE_KEYS.CURRENT_USER, user);
}

export function getCurrentUser(): User | null {
  return getItem<User>(STORAGE_KEYS.CURRENT_USER);
}

export function logoutUser(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// Project management
export function getAllProjects(): Project[] {
  return getItem<Project[]>(STORAGE_KEYS.PROJECTS) || [];
}

export function getProjectById(id: string): Project | null {
  const projects = getAllProjects();
  return projects.find(project => project.id === id) || null;
}

export function getProjectsByLeaderId(leaderId: string): Project[] {
  const projects = getAllProjects();
  return projects.filter(project => project.leaderId === leaderId);
}

export function createProject(project: Omit<Project, 'id'>): Project {
  const projects = getAllProjects();
  const newProject = {
    ...project,
    id: `project-${Date.now()}`
  };
  projects.push(newProject);
  setItem(STORAGE_KEYS.PROJECTS, projects);
  return newProject;
}

export function updateProject(project: Project): void {
  const projects = getAllProjects();
  const index = projects.findIndex(p => p.id === project.id);
  if (index !== -1) {
    projects[index] = project;
    setItem(STORAGE_KEYS.PROJECTS, projects);
  }
}

export function deleteProject(id: string): void {
  const projects = getAllProjects();
  const filteredProjects = projects.filter(project => project.id !== id);
  setItem(STORAGE_KEYS.PROJECTS, filteredProjects);
}

// Vehicle management
export function getAllVehicles(): Vehicle[] {
  return getItem<Vehicle[]>(STORAGE_KEYS.VEHICLES) || [];
}

export function getVehicles(): Vehicle[] {
  return getAllVehicles();
}

export function getVehicleById(id: string): Vehicle | null {
  const vehicles = getAllVehicles();
  return vehicles.find(vehicle => vehicle.id === id) || null;
}

export function createVehicle(vehicle: Omit<Vehicle, 'id'>): Vehicle {
  const vehicles = getAllVehicles();
  const newVehicle = {
    ...vehicle,
    id: `vehicle-${Date.now()}`
  };
  vehicles.push(newVehicle);
  setItem(STORAGE_KEYS.VEHICLES, vehicles);
  return newVehicle;
}

export function updateVehicle(vehicle: Vehicle): void {
  const vehicles = getAllVehicles();
  const index = vehicles.findIndex(v => v.id === vehicle.id);
  if (index !== -1) {
    vehicles[index] = vehicle;
    setItem(STORAGE_KEYS.VEHICLES, vehicles);
  }
}

export function deleteVehicle(id: string): void {
  const vehicles = getAllVehicles();
  const filteredVehicles = vehicles.filter(vehicle => vehicle.id !== id);
  setItem(STORAGE_KEYS.VEHICLES, filteredVehicles);
}

// Driver management
export function getAllDrivers(): Driver[] {
  return getItem<Driver[]>(STORAGE_KEYS.DRIVERS) || [];
}

export function getDriverById(id: string): Driver | null {
  const drivers = getAllDrivers();
  return drivers.find(driver => driver.id === id) || null;
}

export function createDriver(driver: Omit<Driver, 'id'>): Driver {
  const drivers = getAllDrivers();
  const newDriver = {
    ...driver,
    id: `driver-${Date.now()}`
  };
  drivers.push(newDriver);
  setItem(STORAGE_KEYS.DRIVERS, drivers);
  return newDriver;
}

export function updateDriver(driver: Driver): void {
  const drivers = getAllDrivers();
  const index = drivers.findIndex(d => d.id === driver.id);
  if (index !== -1) {
    drivers[index] = driver;
    setItem(STORAGE_KEYS.DRIVERS, drivers);
  }
}

export function deleteDriver(id: string): void {
  const drivers = getAllDrivers();
  const filteredDrivers = drivers.filter(driver => driver.id !== id);
  setItem(STORAGE_KEYS.DRIVERS, filteredDrivers);
}

// Progress updates
export function getAllProgressUpdates(): ProgressUpdate[] {
  return getItem<ProgressUpdate[]>(STORAGE_KEYS.PROGRESS_UPDATES) || [];
}

export function getProgressUpdateById(id: string): ProgressUpdate | null {
  const updates = getAllProgressUpdates();
  return updates.find(update => update.id === id) || null;
}

export function getProgressUpdatesByProjectId(projectId: string): ProgressUpdate[] {
  const updates = getAllProgressUpdates();
  return updates.filter(update => update.projectId === projectId);
}

export function addProgressUpdate(update: Omit<ProgressUpdate, 'id'>): ProgressUpdate {
  const updates = getAllProgressUpdates();
  const newUpdate = {
    ...update,
    id: `progress-${Date.now()}`
  };
  updates.push(newUpdate);
  setItem(STORAGE_KEYS.PROGRESS_UPDATES, updates);
  return newUpdate;
}

export function updateProgressUpdate(update: ProgressUpdate): void {
  const updates = getAllProgressUpdates();
  const index = updates.findIndex(u => u.id === update.id);
  if (index !== -1) {
    updates[index] = update;
    setItem(STORAGE_KEYS.PROGRESS_UPDATES, updates);
  }
}

export function deleteProgressUpdate(id: string): void {
  const updates = getAllProgressUpdates();
  const filteredUpdates = updates.filter(update => update.id !== id);
  setItem(STORAGE_KEYS.PROGRESS_UPDATES, filteredUpdates);
}

// Payment requests
export function getAllPaymentRequests(): PaymentRequest[] {
  return getItem<PaymentRequest[]>(STORAGE_KEYS.PAYMENT_REQUESTS) || [];
}

export function getPaymentRequestById(id: string): PaymentRequest | null {
  const requests = getAllPaymentRequests();
  return requests.find(request => request.id === id) || null;
}

export function getPaymentRequestsByProjectId(projectId: string): PaymentRequest[] {
  const requests = getAllPaymentRequests();
  return requests.filter(request => request.projectId === projectId);
}

export function getPaymentRequestsByStatus(status: PaymentRequest['status']): PaymentRequest[] {
  const requests = getAllPaymentRequests();
  return requests.filter(request => request.status === status);
}

export function createPaymentRequest(request: Omit<PaymentRequest, 'id'>): PaymentRequest {
  const requests = getAllPaymentRequests();
  const newRequest = {
    ...request,
    id: `payment-${Date.now()}`
  };
  requests.push(newRequest);
  setItem(STORAGE_KEYS.PAYMENT_REQUESTS, requests);
  return newRequest;
}

export function updatePaymentRequest(request: PaymentRequest): void {
  const requests = getAllPaymentRequests();
  const index = requests.findIndex(r => r.id === request.id);
  if (index !== -1) {
    requests[index] = request;
    setItem(STORAGE_KEYS.PAYMENT_REQUESTS, requests);
  }
}

export function deletePaymentRequest(id: string): void {
  const requests = getAllPaymentRequests();
  const filteredRequests = requests.filter(request => request.id !== id);
  setItem(STORAGE_KEYS.PAYMENT_REQUESTS, filteredRequests);
}

// Helper function specifically for finding payment requests by leader ID
export function getPaymentRequestsByLeaderId(leaderId: string): PaymentRequest[] {
  // First get all projects belonging to this leader
  const leaderProjects = getProjectsByLeaderId(leaderId);
  const projectIds = leaderProjects.map(project => project.id);
  
  // Then get all payment requests for these projects
  const allPayments = getAllPaymentRequests();
  return allPayments.filter(payment => projectIds.includes(payment.projectId));
}

// Correction requests
export function getAllCorrectionRequests(): CorrectionRequest[] {
  return getItem<CorrectionRequest[]>(STORAGE_KEYS.CORRECTION_REQUESTS) || [];
}

export function getCorrectionRequestById(id: string): CorrectionRequest | null {
  const requests = getAllCorrectionRequests();
  return requests.find(request => request.id === id) || null;
}

export function getCorrectionRequestsByProgressId(progressId: string): CorrectionRequest[] {
  const requests = getAllCorrectionRequests();
  return requests.filter(request => request.progressUpdateId === progressId);
}

export function createCorrectionRequest(request: Omit<CorrectionRequest, 'id'>): CorrectionRequest {
  const requests = getAllCorrectionRequests();
  const newRequest = {
    ...request,
    id: `correction-${Date.now()}`
  };
  requests.push(newRequest);
  setItem(STORAGE_KEYS.CORRECTION_REQUESTS, requests);
  return newRequest;
}

export function updateCorrectionRequest(request: CorrectionRequest): void {
  const requests = getAllCorrectionRequests();
  const index = requests.findIndex(r => r.id === request.id);
  if (index !== -1) {
    requests[index] = request;
    setItem(STORAGE_KEYS.CORRECTION_REQUESTS, requests);
  }
}

export function deleteCorrectionRequest(id: string): void {
  const requests = getAllCorrectionRequests();
  const filteredRequests = requests.filter(request => request.id !== id);
  setItem(STORAGE_KEYS.CORRECTION_REQUESTS, filteredRequests);
}

// Helper for getting current location
export async function getCurrentLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      resolve({ latitude: 0, longitude: 0 }); // Fallback if geolocation not available
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        resolve(location);
      },
      (error) => {
        console.error("Error getting location:", error);
        resolve({ latitude: 0, longitude: 0 }); // Fallback on error
      }
    );
  });
}

// Get users by role
export function getUsersByRole(role: UserRole): User[] {
  const users = getAllUsers();
  return users.filter(user => user.role === role);
}

// Get leader progress statistics for admin dashboard
export function getLeaderProgressStats(): LeaderProgressStats[] {
  const leaders = getUsersByRole('leader');
  const projects = getAllProjects();
  const progressUpdates = getAllProgressUpdates();
  
  return leaders.map(leader => {
    const leaderProjects = projects.filter(project => project.leaderId === leader.id);
    const projectIds = leaderProjects.map(project => project.id);
    
    const leaderProgressUpdates = progressUpdates.filter(update => 
      projectIds.includes(update.projectId)
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const totalDistance = leaderProjects.reduce((sum, project) => sum + project.completedWork, 0);
    const totalPlannedDistance = leaderProjects.reduce((sum, project) => sum + project.totalWork, 0);
    const totalTime = leaderProgressUpdates.reduce((sum, update) => sum + update.timeTaken, 0);
    
    const completionPercentage = totalPlannedDistance > 0 
      ? Math.min(100, Math.round((totalDistance / totalPlannedDistance) * 100))
      : 0;
    
    return {
      leaderId: leader.id,
      leaderName: leader.name,
      projectCount: leaderProjects.length,
      totalDistance,
      totalTime,
      completionPercentage,
      recentUpdates: leaderProgressUpdates.slice(0, 5) // Get latest 5 updates
    };
  });
}

export const registerUser = (name: string, email: string, password: string, role: UserRole): { success: boolean, message?: string } => {
  // Check if email exists
  const existingUser = getUserByEmail(email);
  if (existingUser) {
    return { 
      success: false, 
      message: "Email already registered. Please use a different email or login." 
    };
  }

  // Generate a new ID
  const users = getAllUsers();
  const id = `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Create the new user
  const newUser: User = {
    id,
    name,
    email,
    password,
    role
  };
  
  // Add to localStorage
  const updatedUsers = [...users, newUser];
  localStorage.setItem('saibalaji_users', JSON.stringify(updatedUsers));
  
  return { success: true };
};
