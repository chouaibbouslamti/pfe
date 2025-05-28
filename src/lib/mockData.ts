
import type { UserProfile, Team, Hangar, Batch, Alert, Intervention, KPI } from '@/types';

export const mockUserProfiles: UserProfile[] = [
  // Administrateurs
  { uid: 'superadmin01', email: 'super@example.com', firstName: 'Super', lastName: 'Admin', username: 'superadmin', role: 'SUPER_ADMIN', isActive: true, isApproved: true, createdAt: new Date('2023-01-01'), lastLogin: new Date(), photoURL: 'https://placehold.co/100x100.png?text=SA' },
  { uid: 'admin02', email: 'admin2@example.com', firstName: 'Directeur', lastName: 'Technique', username: 'dirtech', role: 'SUPER_ADMIN', isActive: true, isApproved: true, createdAt: new Date('2023-01-15'), lastLogin: new Date(), photoURL: 'https://placehold.co/100x100.png?text=DT' },
  
  // Chefs d'équipe
  { uid: 'manager01', email: 'manager@example.com', firstName: 'Manager', lastName: 'One', username: 'manager1', role: 'TEAM_MANAGER', teamId: 'team1', isActive: true, isApproved: true, createdAt: new Date('2023-01-02'), lastLogin: new Date(), photoURL: 'https://placehold.co/100x100.png?text=M1' },
  { uid: 'manager02', email: 'manager2@example.com', firstName: 'Sophie', lastName: 'Dubois', username: 'sophie.d', role: 'TEAM_MANAGER', teamId: 'team2', isActive: true, isApproved: true, createdAt: new Date('2023-02-15'), lastLogin: new Date(), photoURL: 'https://placehold.co/100x100.png?text=SD' },
  { uid: 'manager03', email: 'manager3@example.com', firstName: 'Karim', lastName: 'Benzri', username: 'karim.b', role: 'TEAM_MANAGER', teamId: 'team3', isActive: true, isApproved: true, createdAt: new Date('2023-03-10'), lastLogin: new Date(), photoURL: 'https://placehold.co/100x100.png?text=KB' },
  { uid: 'manager04', email: 'manager4@example.com', firstName: 'Amina', lastName: 'Cherif', username: 'amina.c', role: 'TEAM_MANAGER', teamId: 'team4', isActive: true, isApproved: true, createdAt: new Date('2023-04-05'), lastLogin: new Date(), photoURL: 'https://placehold.co/100x100.png?text=AC' },
  
  // Utilisateurs standards
  { uid: 'user01', email: 'user@example.com', firstName: 'User', lastName: 'Person', username: 'user1', role: 'USER', teamId: 'team1', isActive: true, isApproved: true, createdAt: new Date('2023-01-03'), lastLogin: new Date(), photoURL: 'https://placehold.co/100x100.png?text=U1' },
  { uid: 'user02', email: 'user2@example.com', firstName: 'Another', lastName: 'User', username: 'user2', role: 'USER', teamId: 'team2', isActive: false, isApproved: true, createdAt: new Date('2023-01-04'), lastLogin: new Date(), photoURL: 'https://placehold.co/100x100.png?text=U2' },
  { uid: 'user03', email: 'user3@example.com', firstName: 'Ahmed', lastName: 'Bensaid', username: 'ahmed.b', role: 'USER', teamId: 'team1', isActive: true, isApproved: true, createdAt: new Date('2023-02-10'), lastLogin: new Date(), photoURL: 'https://placehold.co/100x100.png?text=AB' },
  { uid: 'user04', email: 'user4@example.com', firstName: 'Marie', lastName: 'Laurent', username: 'marie.l', role: 'USER', teamId: 'team2', isActive: true, isApproved: true, createdAt: new Date('2023-02-20'), lastLogin: new Date(), photoURL: 'https://placehold.co/100x100.png?text=ML' },
  { uid: 'user05', email: 'user5@example.com', firstName: 'Jean', lastName: 'Dupont', username: 'jean.d', role: 'USER', teamId: 'team3', isActive: true, isApproved: true, createdAt: new Date('2023-03-15'), lastLogin: new Date(), photoURL: 'https://placehold.co/100x100.png?text=JD' },
  { uid: 'user06', email: 'user6@example.com', firstName: 'Fatima', lastName: 'Alami', username: 'fatima.a', role: 'USER', teamId: 'team3', isActive: true, isApproved: true, createdAt: new Date('2023-03-25'), lastLogin: new Date(), photoURL: 'https://placehold.co/100x100.png?text=FA' },
  { uid: 'user07', email: 'user7@example.com', firstName: 'Pierre', lastName: 'Martin', username: 'pierre.m', role: 'USER', teamId: 'team4', isActive: true, isApproved: true, createdAt: new Date('2023-04-10'), lastLogin: new Date(), photoURL: 'https://placehold.co/100x100.png?text=PM' },
  { uid: 'user08', email: 'user8@example.com', firstName: 'Leila', lastName: 'Haddad', username: 'leila.h', role: 'USER', teamId: 'team4', isActive: true, isApproved: false, createdAt: new Date('2023-04-30'), lastLogin: null, photoURL: 'https://placehold.co/100x100.png?text=LH' },
  { uid: 'user09', email: 'user9@example.com', firstName: 'Thomas', lastName: 'Petit', username: 'thomas.p', role: 'USER', teamId: 'team1', isActive: false, isApproved: true, createdAt: new Date('2023-05-05'), lastLogin: new Date('2023-06-01'), photoURL: 'https://placehold.co/100x100.png?text=TP' },
  { uid: 'user10', email: 'user10@example.com', firstName: 'Sarah', lastName: 'Benali', username: 'sarah.b', role: 'USER', teamId: 'team2', isActive: true, isApproved: true, createdAt: new Date('2023-05-20'), lastLogin: new Date(), photoURL: 'https://placehold.co/100x100.png?text=SB' },
];

export const mockTeams: Team[] = [
  { id: 'team1', name: 'Équipe Alpha', managerId: 'manager01', members: ['manager01', 'user01', 'user03', 'user09'], contact: 'alpha@example.com', createdAt: new Date('2023-02-01') },
  { id: 'team2', name: 'Équipe Bravo', managerId: 'manager02', members: ['manager02', 'user02', 'user04', 'user10'], contact: 'bravo@example.com', createdAt: new Date('2023-02-05') },
  { id: 'team3', name: 'Équipe Delta', managerId: 'manager03', members: ['manager03', 'user05', 'user06'], contact: 'delta@example.com', createdAt: new Date('2023-03-10') },
  { id: 'team4', name: 'Équipe Echo', managerId: 'manager04', members: ['manager04', 'user07', 'user08'], contact: 'echo@example.com', createdAt: new Date('2023-04-15') },
  { id: 'team5', name: 'Équipe Intervention Spéciale', managerId: 'admin02', members: ['admin02'], contact: 'special@example.com', createdAt: new Date('2023-05-01') },
];

export const mockHangars: Hangar[] = [
  // Hangars principaux actifs
  { id: 'H001', name: 'Hangar Alpha', location: 'Zone Nord', capacity: 1000, status: 'ACTIVE', createdAt: new Date('2023-03-01') },
  { id: 'H002', name: 'Hangar Bravo', location: 'Zone Sud', capacity: 1500, status: 'ACTIVE', createdAt: new Date('2023-03-05') },
  { id: 'H003', name: 'Hangar Gamma', location: 'Zone Est', capacity: 800, status: 'INACTIVE', createdAt: new Date('2023-03-10') },
  { id: 'H004', name: 'Hangar Delta', location: 'Zone Ouest', capacity: 1200, status: 'ACTIVE', createdAt: new Date('2023-04-15') },
  { id: 'H005', name: 'Hangar Echo', location: 'Zone Centre', capacity: 2000, status: 'ACTIVE', createdAt: new Date('2023-05-01') },
  
  // Hangars secondaires
  { id: 'H006', name: 'Dépôt Nord-Est', location: 'Périphérie Nord', capacity: 500, status: 'ACTIVE', createdAt: new Date('2023-06-10') },
  { id: 'H007', name: 'Dépôt Sud-Ouest', location: 'Périphérie Sud', capacity: 600, status: 'ACTIVE', createdAt: new Date('2023-06-15') },
  { id: 'H008', name: 'Hangar Temporaire A', location: 'Zone Expansion', capacity: 300, status: 'INACTIVE', createdAt: new Date('2023-07-01') },
  { id: 'H009', name: 'Nouveau Complexe', location: 'Zone Industrielle', capacity: 2500, status: 'ACTIVE', createdAt: new Date('2023-08-05') },
  { id: 'H010', name: 'Entrepôt Portuaire', location: 'Port Maritime', capacity: 1800, status: 'ACTIVE', createdAt: new Date('2023-09-01') },
];

export const mockBatches: Batch[] = [
  // Lots récents en stock
  { id: 'L0T78', fertilizerType: 'NPK 20-10-10', quantity: 50, unit: 'tonnes', stockedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), expectedTransportDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), maxStorageDays: 30, hangarId: 'H002', teamId: 'team1', status: 'STOCKED', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
  { id: 'L0T79', fertilizerType: 'Urée 46%', quantity: 120, unit: 'tonnes', stockedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), expectedTransportDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000), maxStorageDays: 60, hangarId: 'H001', teamId: 'team2', status: 'PROCESSING', createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
  { id: 'L0T80', fertilizerType: 'Sulfate d\'Ammonium', quantity: 75, unit: 'tonnes', stockedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), expectedTransportDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), maxStorageDays: 30, hangarId: 'H001', status: 'TRANSPORTED', createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
  
  // Lots récents supplémentaires
  { id: 'L0T81', fertilizerType: 'NPK 15-15-15', quantity: 85, unit: 'tonnes', stockedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), expectedTransportDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000), maxStorageDays: 40, hangarId: 'H004', teamId: 'team3', status: 'STOCKED', createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  { id: 'L0T82', fertilizerType: 'Phosphate de Roche', quantity: 200, unit: 'tonnes', stockedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), expectedTransportDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), maxStorageDays: 50, hangarId: 'H005', teamId: 'team4', status: 'STOCKED', createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
  { id: 'L0T83', fertilizerType: 'Potasse', quantity: 110, unit: 'tonnes', stockedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), expectedTransportDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000), maxStorageDays: 50, hangarId: 'H002', teamId: 'team1', status: 'PROCESSING', createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
  
  // Lots plus anciens
  { id: 'L0T84', fertilizerType: 'NPK 10-20-30', quantity: 65, unit: 'tonnes', stockedDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), expectedTransportDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), maxStorageDays: 40, hangarId: 'H009', teamId: 'team2', status: 'STOCKED', createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) },
  { id: 'L0T85', fertilizerType: 'Nitrate d\'Ammonium', quantity: 90, unit: 'tonnes', stockedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), expectedTransportDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), maxStorageDays: 40, hangarId: 'H006', teamId: 'team3', status: 'STOCKED', createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  { id: 'L0T86', fertilizerType: 'Compost Enrichi', quantity: 150, unit: 'tonnes', stockedDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), expectedTransportDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), maxStorageDays: 40, hangarId: 'H007', teamId: 'team4', status: 'TRANSPORTED', createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) },
  
  // Lots à statut spécial
  { id: 'L0T87', fertilizerType: 'Urée 36%', quantity: 70, unit: 'tonnes', stockedDate: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000), expectedTransportDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), maxStorageDays: 30, hangarId: 'H010', teamId: 'team5', status: 'SPOILED', createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000) },
  { id: 'L0T88', fertilizerType: 'Superphosphate', quantity: 100, unit: 'tonnes', stockedDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), expectedTransportDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), maxStorageDays: 40, hangarId: 'H004', teamId: 'team1', status: 'PROCESSING', createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000) },
  { id: 'L0T89', fertilizerType: 'NPK 20-5-10', quantity: 130, unit: 'tonnes', stockedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), expectedTransportDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), maxStorageDays: 50, hangarId: 'H005', teamId: 'team2', status: 'STOCKED', createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
];

export const mockInterventionsData: Intervention[] = [
  { id: "INT012", title: "Calibration capteurs Hangar Delta", description: "Calibration des capteurs de température et d'humidité.", scheduledTime: new Date(Date.now() + 86400000 * 5), hangarId: "H004", teamId: "team2", status: "PLANNED", createdAt: new Date() },
  
  // Interventions en cours
  { id: "INT003", title: "Rotation Stock Hangar Bravo", description: "Déplacement des lots anciens pour optimiser le stockage.", scheduledTime: new Date(Date.now() - 86400000 * 3), hangarId: "H002", teamId: "team1", status: "IN_PROGRESS", createdAt: new Date() },
  { id: "INT013", title: "Maintenance Système Climatisation Hangar Echo", description: "Réparation et entretien du système central de climatisation.", scheduledTime: new Date(Date.now() - 86400000 * 1), hangarId: "H005", teamId: "team3", status: "IN_PROGRESS", createdAt: new Date() },
  { id: "INT014", title: "Assainissement Entrepôt Portuaire", description: "Traitement contre l'humidité excessive suite aux pluies récentes.", scheduledTime: new Date(Date.now() - 86400000 * 2), hangarId: "H010", teamId: "team5", status: "IN_PROGRESS", createdAt: new Date() },
  
  // Interventions terminées
  { id: "INT004", title: "Nettoyage complet Hangar Gamma", description: "Maintenance annuelle et nettoyage.", scheduledTime: new Date(Date.now() - 86400000 * 7), hangarId: "H003", teamId: "team1", status: "COMPLETED", createdAt: new Date(), completedAt: new Date(Date.now() - 86400000 * 5) },
  { id: "INT015", title: "Installation Nouveaux Détecteurs", description: "Installation de détecteurs de fumée et gaz dans le Dépôt Nord-Est.", scheduledTime: new Date(Date.now() - 86400000 * 10), hangarId: "H006", teamId: "team4", status: "COMPLETED", createdAt: new Date(Date.now() - 86400000 * 15), completedAt: new Date(Date.now() - 86400000 * 9) },
  { id: "INT016", title: "Réparation Porte Automatique Hangar Bravo", description: "Réparation du mécanisme d'ouverture défectueux.", scheduledTime: new Date(Date.now() - 86400000 * 12), hangarId: "H002", teamId: "team2", status: "COMPLETED", createdAt: new Date(Date.now() - 86400000 * 14), completedAt: new Date(Date.now() - 86400000 * 11) },
  { id: "INT017", title: "Transport Lot #L0T80", description: "Organisation du transport vers le site de production.", scheduledTime: new Date(Date.now() - 86400000 * 35), hangarId: "H001", batchId: "L0T80", teamId: "team1", status: "COMPLETED", createdAt: new Date(Date.now() - 86400000 * 40), completedAt: new Date(Date.now() - 86400000 * 33) },
  
  // Interventions annulées
  { id: "INT005", title: "Reconditionnement Lot #L0T60", description: "Lot endommagé pendant transport.", scheduledTime: new Date(Date.now() - 86400000 * 5), hangarId: "H001", batchId: "L0T79", teamId: "team2", status: "CANCELLED", createdAt: new Date() },
  { id: "INT018", title: "Fumigation Hangar Temporaire A", description: "Traitement préventif annulé suite à changement de statut du hangar.", scheduledTime: new Date(Date.now() - 86400000 * 8), hangarId: "H008", teamId: "team5", status: "CANCELLED", createdAt: new Date(Date.now() - 86400000 * 15) },
  { id: "INT019", title: "Mise à jour Système Sécurité Dépôt Sud-Ouest", description: "Mise à niveau reportée au trimestre prochain.", scheduledTime: new Date(Date.now() - 86400000 * 20), hangarId: "H007", teamId: "team3", status: "CANCELLED", createdAt: new Date(Date.now() - 86400000 * 25) }
];

export const generateId = () => Math.random().toString(36).substring(2, 9);

// Alerts mock data
export const mockAlertsData: Alert[] = [
  // Alertes critiques
  { 
    id: "ALT001", 
    title: "Expiration imminente", 
    message: "Le lot L0T83 approche de sa date limite de stockage.", 
    type: "STORAGE_EXPIRY", 
    severity: "CRITICAL", 
    status: "ACTIVE", 
    batchId: "L0T83", 
    hangarId: "H002", 
    createdAt: new Date(), 
    detectedAt: new Date(Date.now() - 86400000 * 1),
    estimatedCriticalTime: new Date(Date.now() + 86400000 * 3) 
  },
  { 
    id: "ALT002", 
    title: "Défaillance système climatisation", 
    message: "Panne détectée dans le système de régulation de température du Hangar Echo.", 
    type: "EQUIPMENT_FAILURE", 
    severity: "CRITICAL", 
    status: "ACKNOWLEDGED", 
    hangarId: "H005", 
    assignedTeamIds: ["team3"], 
    createdAt: new Date(), 
    detectedAt: new Date(Date.now() - 86400000 * 2),
    estimatedCriticalTime: new Date(Date.now() + 86400000 * 1),
    acknowledgedAt: new Date(Date.now() - 86400000 * 1)
  },
  
  // Alertes d'urgence
  { 
    id: "ALT003", 
    title: "Niveau d'humidité élevé", 
    message: "Humidité anormale détectée dans le Hangar Alpha. Risque pour les lots L0T79 et L0T88.", 
    type: "INTERVENTION_NEEDED", 
    severity: "EMERGENCY", 
    status: "ACTIVE", 
    hangarId: "H001", 
    createdAt: new Date(), 
    detectedAt: new Date(Date.now() - 86400000 * 1) 
  },
  { 
    id: "ALT004", 
    title: "Stock critique d'urée", 
    message: "Niveau de stock d'urée sous le seuil critique. Approvisionnement nécessaire.", 
    type: "LOW_STOCK", 
    severity: "EMERGENCY", 
    status: "RESOLVED", 
    createdAt: new Date(), 
    detectedAt: new Date(Date.now() - 86400000 * 5),
    acknowledgedAt: new Date(Date.now() - 86400000 * 4),
    resolvedAt: new Date(Date.now() - 86400000 * 2)
  },
  
  // Alertes d'avertissement
  { 
    id: "ALT005", 
    title: "Maintenance préventive requise", 
    message: "Le système de ventilation du Dépôt Nord-Est nécessite une inspection de routine.", 
    type: "INTERVENTION_NEEDED", 
    severity: "WARNING", 
    status: "ACKNOWLEDGED", 
    hangarId: "H006", 
    assignedTeamIds: ["team4"], 
    createdAt: new Date(), 
    detectedAt: new Date(Date.now() - 86400000 * 3),
    acknowledgedAt: new Date() 
  },
  { 
    id: "ALT006", 
    title: "Date de transport approchant", 
    message: "Le lot L0T85 doit être préparé pour le transport dans les 10 prochains jours.", 
    type: "STORAGE_EXPIRY", 
    severity: "WARNING", 
    status: "ACTIVE", 
    batchId: "L0T85", 
    hangarId: "H006", 
    createdAt: new Date(), 
    detectedAt: new Date(Date.now() - 86400000 * 1) 
  },
  { 
    id: "ALT007", 
    title: "Capacité de stockage limitée", 
    message: "Le Hangar Bravo approche de sa capacité maximale (85%).", 
    type: "INTERVENTION_NEEDED", 
    severity: "WARNING", 
    status: "RESOLVED", 
    hangarId: "H002", 
    createdAt: new Date(), 
    detectedAt: new Date(Date.now() - 86400000 * 7),
    acknowledgedAt: new Date(Date.now() - 86400000 * 6),
    resolvedAt: new Date(Date.now() - 86400000 * 3) 
  },
  
  // Alertes informatives
  { 
    id: "ALT008", 
    title: "Nouveau lot réceptionné", 
    message: "Un nouveau lot de NPK 15-15-15 a été réceptionné au Hangar Delta.", 
    type: "INTERVENTION_NEEDED", 
    severity: "INFO", 
    status: "ACKNOWLEDGED", 
    hangarId: "H004", 
    createdAt: new Date(), 
    detectedAt: new Date(Date.now() - 86400000 * 1),
    acknowledgedAt: new Date() 
  },
  { 
    id: "ALT009", 
    title: "Transfert planifié", 
    message: "Planification du transfert de lots du Hangar Alpha vers le Nouveau Complexe.", 
    type: "INTERVENTION_NEEDED", 
    severity: "INFO", 
    status: "ACTIVE", 
    hangarId: "H001", 
    createdAt: new Date(), 
    detectedAt: new Date() 
  },
  { 
    id: "ALT010", 
    title: "Mise à jour du système", 
    message: "Une mise à jour du système de surveillance a été déployée.", 
    type: "EQUIPMENT_FAILURE", 
    severity: "INFO", 
    status: "RESOLVED", 
    createdAt: new Date(), 
    detectedAt: new Date(Date.now() - 86400000 * 4),
    acknowledgedAt: new Date(Date.now() - 86400000 * 4),
    resolvedAt: new Date(Date.now() - 86400000 * 3) 
  },
  { 
    id: "ALT011", 
    title: "Inspection qualité terminée", 
    message: "L'inspection de qualité du lot L0T82 a été complétée avec succès.", 
    type: "INTERVENTION_NEEDED", 
    severity: "INFO", 
    status: "RESOLVED", 
    batchId: "L0T82", 
    hangarId: "H005", 
    createdAt: new Date(), 
    detectedAt: new Date(Date.now() - 86400000 * 2),
    acknowledgedAt: new Date(Date.now() - 86400000 * 2),
    resolvedAt: new Date(Date.now() - 86400000 * 1) 
  }
];

// KPI mock data
export const mockKPIData: KPI[] = [
  { 
    id: "kpi1", 
    totalBatches: 120, 
    riskyBatches: 15, 
    interventionsCompleted: 42, 
    averageStorageTime: 23, 
    capacityUtilization: 78, 
    alertsResolvedRatio: 0.89, 
    calculatedAt: new Date(), 
    period: "monthly" 
  },
  { 
    id: "kpi2", 
    hangarId: "H001", 
    totalBatches: 45, 
    riskyBatches: 5, 
    interventionsCompleted: 12, 
    averageStorageTime: 18, 
    capacityUtilization: 65, 
    alertsResolvedRatio: 0.92, 
    calculatedAt: new Date(), 
    period: "weekly" 
  },
  { 
    id: "kpi3", 
    hangarId: "H002", 
    totalBatches: 32, 
    riskyBatches: 8, 
    interventionsCompleted: 10, 
    averageStorageTime: 26, 
    capacityUtilization: 83, 
    alertsResolvedRatio: 0.76, 
    calculatedAt: new Date(), 
    period: "monthly" 
  },
  { 
    id: "kpi4", 
    hangarId: "H004", 
    totalBatches: 28, 
    riskyBatches: 3, 
    interventionsCompleted: 9, 
    averageStorageTime: 20, 
    capacityUtilization: 55, 
    alertsResolvedRatio: 0.95, 
    calculatedAt: new Date(), 
    period: "daily" 
  },
  { 
    id: "kpi5", 
    hangarId: "H005", 
    totalBatches: 15, 
    riskyBatches: 2, 
    interventionsCompleted: 7, 
    averageStorageTime: 15, 
    capacityUtilization: 90, 
    alertsResolvedRatio: 1.0, 
    calculatedAt: new Date(), 
    period: "weekly" 
  }
];
