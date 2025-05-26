
// Base ID type, can be number for DB entities, string for mocks if needed
export type DbId = number; // Prisma typically uses number for BigInt that fits in JS number, or BigInt if too large. Sticking to number for simplicity.

export type UserRole = "SUPER_ADMIN" | "TEAM_MANAGER" | "USER";

export interface UserProfile {
  uid: string; // Keeping string for client-side mock user object compatibility, maps to User.id (BigInt/number) from DB
  id?: DbId; // Actual DB id
  email: string | null;
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber?: string;
  role: UserRole;
  teamId?: DbId; // Changed to DbId
  isActive: boolean;
  isApproved: boolean;
  createdAt: Date;
  lastLogin: Date | null;
  photoURL?: string | null;
}

export interface Team {
  id: DbId;
  name: string;
  managerId?: DbId; // UID of the Team Manager (User ID)
  members?: UserProfile[]; // Array of UserProfiles for display, or just user IDs
  memberIds?: DbId[]; // Array of user IDs from DB
  contact?: string;
  createdAt: Date;
}

export interface Hangar {
  id: DbId;
  name: string;
  location: string;
  capacity: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
}

export interface Batch {
  id: DbId;
  fertilizerType: string;
  quantity: number;
  unit: string;
  stockedDate: Date;
  expectedTransportDate: Date;
  maxStorageDays: number;
  hangarId: DbId;
  teamId?: DbId;
  status: "STOCKED" | "PROCESSING" | "TRANSPORTED" | "SPOILED";
  createdAt: Date;
}

export interface Alert {
  id: DbId;
  title: string;
  message: string;
  type: "STORAGE_EXPIRY" | "INTERVENTION_NEEDED" | "LOW_STOCK" | "EQUIPMENT_FAILURE";
  severity: "CRITICAL" | "EMERGENCY" | "WARNING" | "INFO";
  status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
  batchId?: DbId;
  hangarId?: DbId;
  assignedTeamIds?: DbId[]; // Changed from string[]
  createdAt: Date;
  detectedAt: Date;
  estimatedCriticalTime?: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}

export interface Intervention {
  id: DbId;
  title: string;
  description: string;
  scheduledTime: Date;
  expectedResolutionTime?: Date;
  actualResolutionTime?: Date;
  hangarId: DbId;
  batchId?: DbId;
  teamId: DbId;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  notes?: string;
  createdAt: Date;
}

export interface KPI {
  id: DbId;
  hangarId?: DbId;
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
// This remains for client-side state representation after login.
export interface MockUser {
  uid: string; // Corresponds to UserProfile.uid, which is the client-facing string ID
  id: DbId; // Actual DB id
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  role: UserRole; // Add role here for easy access
}
