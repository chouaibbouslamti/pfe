
export type UserRole = "SUPER_ADMIN" | "TEAM_MANAGER" | "USER";

export interface UserProfile {
  uid: string;
  email: string | null;
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber?: string;
  role: UserRole;
  teamId?: string; 
  isActive: boolean;
  isApproved: boolean; // Will be true by default in mock context
  createdAt: Date;
  lastLogin: Date | null;
  photoURL?: string | null;
}

export interface Team {
  id: string;
  name: string;
  managerId: string; // UID of the Team Manager
  members: string[]; // Array of user UIDs
  contact?: string;
  createdAt: Date;
}

export interface Hangar {
  id: string;
  name: string;
  location: string;
  capacity: number; 
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
}

export interface Batch {
  id: string;
  fertilizerType: string;
  quantity: number; 
  unit: string; 
  stockedDate: Date;
  expectedTransportDate: Date;
  maxStorageDays: number;
  hangarId: string;
  teamId?: string; 
  status: "STOCKED" | "PROCESSING" | "TRANSPORTED" | "SPOILED"; 
  createdAt: Date;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  type: "STORAGE_EXPIRY" | "INTERVENTION_NEEDED" | "LOW_STOCK" | "EQUIPMENT_FAILURE";
  severity: "CRITICAL" | "EMERGENCY" | "WARNING" | "INFO";
  status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
  batchId?: string;
  hangarId?: string;
  assignedTeams?: string[];
  createdAt: Date;
  detectedAt: Date;
  estimatedCriticalTime?: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}

export interface Intervention {
  id: string;
  title: string; 
  description: string;
  scheduledTime: Date;
  expectedResolutionTime?: Date; 
  actualResolutionTime?: Date; 
  hangarId: string;
  batchId?: string; 
  teamId: string; 
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  notes?: string; 
  createdAt: Date;
}

export interface KPI {
  id: string; 
  hangarId?: string;
  totalBatches: number;
  riskyBatches: number; 
  interventionsCompleted: number;
  averageStorageTime: number; 
  capacityUtilization?: number; 
  alertsResolvedRatio?: number; 
  calculatedAt: Date;
  period: "daily" | "weekly" | "monthly"; 
}

// Simplified Mock User type for auth context if Firebase User is too complex
export interface MockUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}
