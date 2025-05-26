import type { Timestamp } from "firebase/firestore";

export type UserRole = "SUPER_ADMIN" | "TEAM_MANAGER" | "USER";

export interface UserProfile {
  uid: string;
  email: string | null;
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber?: string;
  role: UserRole;
  teamId?: string; // Optional, as a user might not be assigned to a team initially
  isActive: boolean;
  isApproved: boolean;
  createdAt: Timestamp;
  lastLogin: Timestamp | null;
  photoURL?: string | null;
}

export interface Team {
  id: string;
  name: string;
  managerId: string; // UID of the Team Manager
  members: string[]; // Array of user UIDs
  contact?: string;
  createdAt: Timestamp;
}

export interface Hangar {
  id: string;
  name: string;
  location: string;
  capacity: number; // Assuming capacity is in some unit, e.g., tons or m^3
  status: "ACTIVE" | "INACTIVE";
  createdAt: Timestamp;
}

export interface Batch {
  id: string;
  fertilizerType: string;
  quantity: number; // Added quantity field
  unit: string; // e.g., "kg", "tonnes"
  stockedDate: Timestamp;
  expectedTransportDate: Timestamp;
  maxStorageDays: number;
  hangarId: string;
  teamId?: string; // Team responsible for this batch, if any
  status: "STOCKED" | "PROCESSING" | "TRANSPORTED" | "SPOILED"; // Added status
  createdAt: Timestamp;
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
  createdAt: Timestamp;
  detectedAt: Timestamp;
  estimatedCriticalTime?: Timestamp;
  acknowledgedAt?: Timestamp;
  resolvedAt?: Timestamp;
}

export interface Intervention {
  id: string;
  title: string; // Added title
  description: string;
  scheduledTime: Timestamp;
  expectedResolutionTime?: Timestamp; // Made optional
  actualResolutionTime?: Timestamp; // Added actual resolution time
  hangarId: string;
  batchId?: string; // Optional, as an intervention might be for a hangar issue
  teamId: string; // Team assigned to the intervention
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  notes?: string; // Added notes field
  createdAt: Timestamp;
}

export interface KPI {
  id: string; // Could be hangarId or "overall"
  hangarId?: string;
  totalBatches: number;
  riskyBatches: number; // Batches nearing expiry or spoiled
  interventionsCompleted: number;
  averageStorageTime: number; // in days
  capacityUtilization?: number; // percentage
  alertsResolvedRatio?: number; // percentage of alerts resolved
  calculatedAt: Timestamp;
  period: "daily" | "weekly" | "monthly"; // Added period for KPI calculation
}
