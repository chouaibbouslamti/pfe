
import type { UserProfile, Team, Hangar, Batch, Alert, Intervention, KPI } from '@/types';

export const mockUserProfiles: UserProfile[] = [
  { uid: 'superadmin01', email: 'super@example.com', firstName: 'Super', lastName: 'Admin', username: 'superadmin', role: 'SUPER_ADMIN', isActive: true, isApproved: true, createdAt: new Date('2023-01-01'), lastLogin: new Date(), photoURL: 'https://placehold.co/100x100.png?text=SA' },
  { uid: 'manager01', email: 'manager@example.com', firstName: 'Manager', lastName: 'One', username: 'manager1', role: 'TEAM_MANAGER', teamId: 'team1', isActive: true, isApproved: true, createdAt: new Date('2023-01-02'), lastLogin: new Date(), photoURL: 'https://placehold.co/100x100.png?text=M1' },
  { uid: 'user01', email: 'user@example.com', firstName: 'User', lastName: 'Person', username: 'user1', role: 'USER', teamId: 'team1', isActive: true, isApproved: true, createdAt: new Date('2023-01-03'), lastLogin: new Date(), photoURL: 'https://placehold.co/100x100.png?text=U1' },
  { uid: 'user02', email: 'user2@example.com', firstName: 'Another', lastName: 'User', username: 'user2', role: 'USER', teamId: 'team2', isActive: false, isApproved: true, createdAt: new Date('2023-01-04'), lastLogin: new Date(), photoURL: 'https://placehold.co/100x100.png?text=U2' },
];

export const mockTeams: Team[] = [
  { id: 'team1', name: 'Équipe Alpha', managerId: 'manager01', members: ['manager01', 'user01'], contact: 'alpha@example.com', createdAt: new Date('2023-02-01') },
  { id: 'team2', name: 'Équipe Bravo', managerId: 'superadmin01', members: ['superadmin01', 'user02'], contact: 'bravo@example.com', createdAt: new Date('2023-02-05') },
];

export const mockHangars: Hangar[] = [
  { id: 'H001', name: 'Hangar Alpha', location: 'Zone Nord', capacity: 1000, status: 'ACTIVE', createdAt: new Date('2023-03-01') },
  { id: 'H002', name: 'Hangar Bravo', location: 'Zone Sud', capacity: 1500, status: 'ACTIVE', createdAt: new Date('2023-03-05') },
  { id: 'H003', name: 'Hangar Gamma', location: 'Zone Est', capacity: 800, status: 'INACTIVE', createdAt: new Date('2023-03-10') },
];

export const mockBatches: Batch[] = [
  { id: 'L0T78', fertilizerType: 'NPK 20-10-10', quantity: 50, unit: 'tonnes', stockedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), expectedTransportDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), maxStorageDays: 30, hangarId: 'H002', teamId: 'team1', status: 'STOCKED', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
  { id: 'L0T79', fertilizerType: 'Urée 46%', quantity: 120, unit: 'tonnes', stockedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), expectedTransportDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000), maxStorageDays: 60, hangarId: 'H001', teamId: 'team2', status: 'PROCESSING', createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
  { id: 'L0T80', fertilizerType: 'Sulfate d\'Ammonium', quantity: 75, unit: 'tonnes', stockedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), expectedTransportDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), maxStorageDays: 30, hangarId: 'H001', status: 'TRANSPORTED', createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
];

export const mockAlertsData: Alert[] = [
  { id: "A001", title: "Expiration Imminente Lot #L0T78", message: "Le lot #L0T78 dans Hangar Bravo expire dans 2 jours.", type: "STORAGE_EXPIRY", severity: "CRITICAL", status: "ACTIVE", hangarId: "H002", batchId: "L0T78", createdAt: new Date(Date.now() - 86400000), detectedAt: new Date(Date.now() - 86400000) },
  { id: "A002", title: "Intervention Requise Hangar Alpha", message: "Température anormale détectée dans Hangar Alpha.", type: "INTERVENTION_NEEDED", severity: "EMERGENCY", status: "ACTIVE", hangarId: "H001", createdAt: new Date(Date.now() - 172800000), detectedAt: new Date(Date.now() - 172800000) },
  { id: "A003", title: "Maintenance Préventive Hangar Gamma", message: "Équipement de ventilation nécessite une vérification.", type: "INTERVENTION_NEEDED", severity: "WARNING", status: "ACKNOWLEDGED", hangarId: "H003", createdAt: new Date(Date.now() - 259200000), detectedAt: new Date(Date.now() - 259200000) },
  { id: "A004", title: "Lot #L0T55 Résolu", message: "Problème de stockage pour le lot #L0T55 résolu.", type: "STORAGE_EXPIRY", severity: "INFO", status: "RESOLVED", hangarId: "H001", batchId: "L0T55", createdAt: new Date(Date.now() - 345600000), detectedAt: new Date(Date.now() - 345600000) },
];

export const mockInterventionsData: Intervention[] = [
  { id: "INT001", title: "Contrôle qualité Lot #L0T78", description: "Vérification de l'état du lot suite à alerte expiration.", scheduledTime: new Date(Date.now() + 86400000 * 1), hangarId: "H002", batchId: "L0T78", teamId: "team1", status: "PLANNED", createdAt: new Date() },
  { id: "INT002", title: "Réparation système ventilation Hangar Alpha", description: "Intervention suite à détection de température anormale.", scheduledTime: new Date(Date.now() + 86400000 * 2), hangarId: "H001", teamId: "team2", status: "PLANNED", createdAt: new Date() },
  { id: "INT003", title: "Rotation Stock Hangar Bravo", description: "Déplacement des lots anciens pour optimiser le stockage.", scheduledTime: new Date(Date.now() - 86400000 * 3), hangarId: "H002", teamId: "team1", status: "IN_PROGRESS", createdAt: new Date() },
  { id: "INT004", title: "Nettoyage complet Hangar Gamma", description: "Maintenance annuelle et nettoyage.", scheduledTime: new Date(Date.now() - 86400000 * 7), hangarId: "H003", teamId: "team1", status: "COMPLETED", createdAt: new Date() },
  { id: "INT005", title: "Reconditionnement Lot #L0T60", description: "Lot endommagé pendant transport.", scheduledTime: new Date(Date.now() - 86400000 * 5), hangarId: "H001", batchId: "L0T79", teamId: "team2", status: "CANCELLED", createdAt: new Date() },
];

export const generateId = () => Math.random().toString(36).substr(2, 9);
