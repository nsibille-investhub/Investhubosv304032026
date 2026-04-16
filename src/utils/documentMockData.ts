export type DocumentType = 'pdf' | 'excel' | 'word' | 'image' | 'video' | 'folder';
export type DocumentStatus = 'published' | 'draft';
export type AccessLevel = 'view' | 'download' | 'edit' | 'admin';
export type TargetType = 'all' | 'segment' | 'investor' | 'subscription' | 'participation';

export interface DocumentAccess {
  level: AccessLevel;
  watermark: boolean;
  expiresAt?: string;
  downloadable: boolean;
  printable: boolean;
}

export interface DocumentTarget {
  type: TargetType;
  segments?: string[];
  investors?: string[];
  subscriptions?: string[];
  participations?: string[];
  excludedEmails?: string[];
}

export interface DocumentActivity {
  id: string;
  type: 'view' | 'download' | 'upload' | 'edit' | 'share';
  user: string;
  timestamp: string;
  details?: string;
}

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  size?: string;
  format?: string;
  parentId?: string;
  path: string;
  children?: Document[];
  
  // Metadata
  uploadedBy: string;
  uploadedAt: string;
  updatedAt: string;
  version: number;
  
  // Targeting & Access
  target: DocumentTarget;
  access: DocumentAccess;
  
  // Flags
  isNew: boolean;
  notifyOnUpload: boolean;
  reporting: boolean;
  
  // Stats
  views: number;
  downloads: number;
  
  // Activity
  activities?: DocumentActivity[];
  
  // Tags
  tags?: string[];
  description?: string;
  
  // Root marker
  isRoot?: boolean;
  
  // Folder-specific metadata
  metadata?: {
    fund?: string;
    disclaimer?: string;
    segments?: string[];
  };

  // Navigator helper metadata (Data Room list)
  navigatorTargeting?: {
    mode: 'generic' | 'nominative';
    fund?: string;
    shareClass?: string;
    segment?: string;
    investor?: string;
    structure?: string;
    subscription?: string;
  };
}

export const mockDocuments: Document[] = [
  {
    id: 'root',
    name: 'Racine',
    type: 'folder',
    status: 'published',
    path: '/',
    uploadedBy: 'System',
    uploadedAt: '2024-01-01',
    updatedAt: '2024-01-01',
    version: 1,
    target: { type: 'all' },
    access: { level: 'view', watermark: false, downloadable: true, printable: true },
    isNew: false,
    notifyOnUpload: false,
    reporting: false,
    views: 0,
    downloads: 0,
    isRoot: true,
    children: [
      {
        id: 'cat-1',
        name: 'PERE 1',
        type: 'folder',
        status: 'published',
        parentId: 'root',
        path: '/PERE 1',
        uploadedBy: 'System',
        uploadedAt: '2024-01-01',
        updatedAt: '2024-03-10',
        version: 1,
        target: { type: 'all' },
        access: { level: 'view', watermark: false, downloadable: true, printable: true },
        isNew: false,
        notifyOnUpload: false,
        reporting: true,
        views: 1250,
        downloads: 320,
        metadata: {
          fund: 'pere1'
        },
        children: [
          {
            id: 'cat-1-1',
            name: 'Comités consultatifs',
            type: 'folder',
            status: 'published',
            parentId: 'cat-1',
            path: '/PERE 1/Comités consultatifs',
            uploadedBy: 'J. Miller',
            uploadedAt: '2024-01-15',
            updatedAt: '2024-03-08',
            version: 3,
            target: { 
              type: 'segment',
              segments: ['Investisseurs Qualifiés', 'Comité Stratégique']
            },
            access: { level: 'view', watermark: true, downloadable: true, printable: false },
            isNew: false,
            notifyOnUpload: true,
            reporting: true,
            views: 450,
            downloads: 120,
            tags: ['Comité', 'Stratégie'],
            children: [
              {
                id: 'doc-1',
                name: '2024-04-22 - Comité consultatif - Document de présentation.pdf',
                type: 'pdf',
                format: 'PDF',
                size: '2.4 MB',
                status: 'published',
                parentId: 'cat-1-1',
                path: '/PERE 1/Comités consultatifs/2024-04-22 - Comité consultatif',
                uploadedBy: 'J. Miller',
                uploadedAt: '2024-04-22',
                updatedAt: '2024-04-22',
                version: 1,
                target: { 
                  type: 'segment',
                  segments: ['Investisseurs Qualifiés']
                },
                access: { level: 'download', watermark: true, downloadable: true, printable: false },
                isNew: true,
                notifyOnUpload: true,
                reporting: true,
                views: 45,
                downloads: 12,
                tags: ['Comité', 'Q2 2024'],
                description: 'Document de présentation pour le comité consultatif du 22 avril 2024',
                activities: [
                  {
                    id: 'a1',
                    type: 'upload',
                    user: 'J. Miller',
                    timestamp: '2024-04-22T09:30:00',
                    details: 'Document initial uploadé'
                  },
                  {
                    id: 'a2',
                    type: 'view',
                    user: 'sarah.connor@investhub.cloud',
                    timestamp: '2024-04-22T10:15:00'
                  },
                  {
                    id: 'a3',
                    type: 'download',
                    user: 'john.smith@investhub.cloud',
                    timestamp: '2024-04-22T14:30:00'
                  }
                ]
              },
              {
                id: 'doc-2',
                name: '2024-04-22_PERE_Comité Stratégique - Document de présentation.pdf',
                type: 'pdf',
                format: 'PDF',
                size: '1.8 MB',
                status: 'draft',
                parentId: 'cat-1-1',
                path: '/PERE 1/Comités consultatifs/2024-04-22_PERE',
                uploadedBy: 'K. Patel',
                uploadedAt: '2024-04-22',
                updatedAt: '2024-04-22',
                version: 1,
                target: { 
                  type: 'segment',
                  segments: ['Comité Stratégique']
                },
                access: { level: 'download', watermark: true, downloadable: true, printable: true },
                isNew: false,
                notifyOnUpload: true,
                reporting: true,
                views: 28,
                downloads: 8,
                tags: ['Stratégie', 'Q2 2024']
              }
            ]
          },
          {
            id: 'cat-1-2',
            name: '2024-11-27 - Comité consultatif',
            type: 'folder',
            status: 'published',
            parentId: 'cat-1',
            path: '/PERE 1/2024-11-27 - Comité consultatif',
            uploadedBy: 'J. Miller',
            uploadedAt: '2024-11-27',
            updatedAt: '2024-11-27',
            version: 1,
            target: { type: 'segment', segments: ['Investisseurs'] },
            access: { level: 'view', watermark: true, downloadable: true, printable: false },
            isNew: false,
            notifyOnUpload: false,
            reporting: true,
            views: 180,
            downloads: 45,
            children: []
          }
        ]
      },
      {
        id: 'cat-pere2',
        name: 'PERE 2',
        type: 'folder',
        status: 'published',
        parentId: 'root',
        path: '/PERE 2',
        uploadedBy: 'System',
        uploadedAt: '2024-01-01',
        updatedAt: '2024-03-10',
        version: 1,
        target: { type: 'all' },
        access: { level: 'view', watermark: false, downloadable: true, printable: true },
        isNew: false,
        notifyOnUpload: false,
        reporting: true,
        views: 890,
        downloads: 210,
        metadata: {
          fund: 'pere2'
        },
        children: [
          {
            id: 'cat-pere2-hnwi',
            name: 'HNWI',
            type: 'folder',
            status: 'published',
            parentId: 'cat-pere2',
            path: '/PERE 2/HNWI',
            uploadedBy: 'S. Anderson',
            uploadedAt: '2024-02-10',
            updatedAt: '2024-03-05',
            version: 2,
            target: { 
              type: 'segment',
              segments: ['HNWI (High Net Worth)']
            },
            access: { level: 'view', watermark: true, downloadable: true, printable: false },
            isNew: false,
            notifyOnUpload: true,
            reporting: true,
            views: 320,
            downloads: 95,
            tags: ['HNWI', 'Confidentiel'],
            children: [
              {
                id: 'doc-pere2-hnwi-1',
                name: '2024-Q1 - Stratégie HNWI.pdf',
                type: 'pdf',
                format: 'PDF',
                size: '1.8 MB',
                status: 'published',
                parentId: 'cat-pere2-hnwi',
                path: '/PERE 2/HNWI/2024-Q1 - Stratégie HNWI.pdf',
                uploadedBy: 'S. Anderson',
                uploadedAt: '2024-03-05',
                updatedAt: '2024-03-05',
                version: 1,
                target: { 
                  type: 'segment',
                  segments: ['HNWI (High Net Worth)']
                },
                access: { level: 'download', watermark: true, downloadable: true, printable: true },
                isNew: false,
                notifyOnUpload: true,
                reporting: true,
                views: 42,
                downloads: 15,
                tags: ['Stratégie', 'Q1 2024', 'HNWI']
              },
              {
                id: 'doc-pere2-hnwi-2',
                name: 'Rapport Confidentiel - Alpha Investment.pdf',
                type: 'pdf',
                format: 'PDF',
                size: '3.2 MB',
                status: 'draft',
                parentId: 'cat-pere2-hnwi',
                path: '/PERE 2/HNWI/Rapport Confidentiel - Alpha Investment.pdf',
                uploadedBy: 'S. Anderson',
                uploadedAt: '2024-03-15',
                updatedAt: '2024-03-15',
                version: 1,
                target: { 
                  type: 'investor',
                  investors: ['Alpha Investment Partners']
                },
                access: { level: 'download', watermark: true, downloadable: true, printable: false },
                isNew: false,
                notifyOnUpload: true,
                reporting: true,
                views: 12,
                downloads: 3,
                tags: ['Confidentiel', 'Alpha', 'Q1 2024']
              },
              {
                id: 'doc-pere2-hnwi-3',
                name: 'Documents de Souscription - Q1 2024.pdf',
                type: 'pdf',
                format: 'PDF',
                size: '2.1 MB',
                status: 'draft',
                parentId: 'cat-pere2-hnwi',
                path: '/PERE 2/HNWI/Documents de Souscription - Q1 2024.pdf',
                uploadedBy: 'S. Anderson',
                uploadedAt: '2024-03-20',
                updatedAt: '2024-03-20',
                version: 1,
                target: { 
                  type: 'subscription',
                  subscriptions: ['SUB-2024-001', 'SUB-2024-002', 'SUB-2024-003']
                },
                access: { level: 'download', watermark: true, downloadable: true, printable: true },
                isNew: false,
                notifyOnUpload: true,
                reporting: true,
                views: 28,
                downloads: 9,
                tags: ['Souscription', 'Q1 2024', 'HNWI']
              }
            ]
          }
        ]
      },
      {
        id: 'cat-institutional',
        name: 'Institutionnel',
        type: 'folder',
        status: 'published',
        parentId: 'root',
        path: '/Institutionnel',
        uploadedBy: 'System',
        uploadedAt: '2024-01-01',
        updatedAt: '2024-03-15',
        version: 1,
        target: { type: 'segment', segments: ['Institutional'] },
        metadata: { segments: ['Institutional'] },
        access: { level: 'view', watermark: false, downloadable: true, printable: true },
        isNew: false,
        notifyOnUpload: false,
        reporting: true,
        views: 450,
        downloads: 120,
        children: [
          {
            id: 'cat-institutional-conflict',
            name: 'Offre Retail (Conflit)',
            type: 'folder',
            status: 'published',
            parentId: 'cat-institutional',
            path: '/Institutionnel/Offre Retail (Conflit)',
            uploadedBy: 'J. Miller',
            uploadedAt: '2024-02-10',
            updatedAt: '2024-02-10',
            version: 1,
            target: { type: 'segment', segments: ['Retail'] },
            metadata: { segments: ['Retail'] },
            access: { level: 'view', watermark: true, downloadable: true, printable: false },
            isNew: false,
            notifyOnUpload: false,
            reporting: true,
            views: 0,
            downloads: 0,
            tags: ['Conflit'],
            description: 'Ce dossier crée un conflit : parent cible Institutional, enfant cible Retail → 0 LPs',
            children: [
              {
                id: 'doc-conflict-1',
                name: 'Présentation Produit.pdf',
                type: 'pdf',
                format: 'PDF',
                size: '1.8 MB',
                status: 'published',
                parentId: 'cat-institutional-conflict',
                path: '/Institutionnel/Offre Retail (Conflit)/Présentation Produit.pdf',
                uploadedBy: 'J. Miller',
                uploadedAt: '2024-02-10',
                updatedAt: '2024-02-10',
                version: 1,
                target: { type: 'all' },
                access: { level: 'view', watermark: true, downloadable: true, printable: false },
                isNew: false,
                notifyOnUpload: false,
                reporting: false,
                views: 0,
                downloads: 0,
                tags: ['Conflit', 'Retail']
              }
            ]
          }
        ]
      },
      {
        id: 'cat-appels',
        name: 'Appels de fonds',
        type: 'folder',
        status: 'published',
        parentId: 'root',
        path: '/Appels de fonds',
        uploadedBy: 'System',
        uploadedAt: '2024-01-01',
        updatedAt: '2024-04-15',
        version: 1,
        target: { type: 'all' },
        access: { level: 'view', watermark: false, downloadable: true, printable: true },
        isNew: false,
        notifyOnUpload: false,
        reporting: true,
        views: 1200,
        downloads: 340,
        children: [
          {
            id: 'cat-appels-2024',
            name: '2024',
            type: 'folder',
            status: 'published',
            parentId: 'cat-appels',
            path: '/Appels de fonds/2024',
            uploadedBy: 'System',
            uploadedAt: '2024-01-01',
            updatedAt: '2024-04-15',
            version: 1,
            target: { type: 'all' },
            access: { level: 'view', watermark: false, downloadable: true, printable: true },
            isNew: false,
            notifyOnUpload: false,
            reporting: true,
            views: 850,
            downloads: 220,
            children: []
          }
        ]
      },
      {
        id: 'cat-2',
        name: 'Rapports de gestion',
        type: 'folder',
        status: 'published',
        parentId: 'root',
        path: '/Rapports de gestion',
        uploadedBy: 'System',
        uploadedAt: '2024-01-01',
        updatedAt: '2024-03-15',
        version: 1,
        target: { type: 'all' },
        access: { level: 'view', watermark: false, downloadable: true, printable: true },
        isNew: false,
        notifyOnUpload: false,
        reporting: true,
        views: 2100,
        downloads: 580,
        children: [
          {
            id: 'cat-2-1',
            name: '2025',
            type: 'folder',
            status: 'published',
            parentId: 'cat-2',
            path: '/Rapports de gestion/2025',
            uploadedBy: 'System',
            uploadedAt: '2025-01-01',
            updatedAt: '2025-03-10',
            version: 1,
            target: { type: 'investor' },
            access: { level: 'download', watermark: true, downloadable: true, printable: true },
            isNew: false,
            notifyOnUpload: true,
            reporting: true,
            views: 850,
            downloads: 220,
            children: [
              {
                id: 'doc-3',
                name: 'PERE1 - RAPPORT DE GESTION 2025.pdf',
                type: 'pdf',
                format: 'PDF',
                size: '5.2 MB',
                status: 'published',
                parentId: 'cat-2-1',
                path: '/Rapports de gestion/2025/PERE1 - RAPPORT',
                uploadedBy: 'K. Patel',
                uploadedAt: '2025-03-10',
                updatedAt: '2025-03-10',
                version: 2,
                target: { 
                  type: 'investor',
                  investors: ['Tous les investisseurs']
                },
                access: { level: 'download', watermark: true, downloadable: true, printable: true },
                isNew: true,
                notifyOnUpload: true,
                reporting: true,
                views: 320,
                downloads: 85,
                tags: ['Rapport Annuel', '2025', 'PERE1'],
                description: 'Rapport de gestion annuel 2025'
              }
            ]
          },
          {
            id: 'cat-2-2',
            name: '2024',
            type: 'folder',
            status: 'published',
            parentId: 'cat-2',
            path: '/Rapports de gestion/2024',
            uploadedBy: 'System',
            uploadedAt: '2024-01-01',
            updatedAt: '2024-12-15',
            version: 1,
            target: { type: 'all' },
            access: { level: 'download', watermark: true, downloadable: true, printable: true },
            isNew: false,
            notifyOnUpload: false,
            reporting: true,
            views: 1250,
            downloads: 360,
            children: []
          }
        ]
      },
      {
        id: 'cat-3',
        name: 'Documents financiers',
        type: 'folder',
        status: 'published',
        parentId: 'root',
        path: '/Documents financiers',
        uploadedBy: 'System',
        uploadedAt: '2024-01-01',
        updatedAt: '2024-03-15',
        version: 1,
        target: { type: 'segment', segments: ['Investisseurs Qualifiés'] },
        access: { level: 'view', watermark: true, downloadable: true, printable: false },
        isNew: false,
        notifyOnUpload: true,
        reporting: true,
        views: 3200,
        downloads: 890,
        children: [
          {
            id: 'cat-3-1',
            name: '2023',
            type: 'folder',
            status: 'published',
            parentId: 'cat-3',
            path: '/Documents financiers/2023',
            uploadedBy: 'J. Miller',
            uploadedAt: '2023-01-01',
            updatedAt: '2024-01-15',
            version: 1,
            target: { type: 'segment', segments: ['Investisseurs Qualifiés'] },
            access: { level: 'download', watermark: true, downloadable: true, printable: false },
            isNew: false,
            notifyOnUpload: false,
            reporting: true,
            views: 1600,
            downloads: 445,
            children: []
          }
        ]
      },
      {
        id: 'cat-4',
        name: 'Appels de fonds',
        type: 'folder',
        status: 'published',
        parentId: 'root',
        path: '/Appels de fonds',
        uploadedBy: 'System',
        uploadedAt: '2024-01-01',
        updatedAt: '2024-03-12',
        version: 1,
        target: { type: 'subscription' },
        access: { level: 'download', watermark: true, downloadable: true, printable: true },
        isNew: false,
        notifyOnUpload: true,
        reporting: true,
        views: 980,
        downloads: 320,
        children: [
          {
            id: 'cat-4-1',
            name: '2024',
            type: 'folder',
            status: 'published',
            parentId: 'cat-4',
            path: '/Appels de fonds/2024',
            uploadedBy: 'K. Patel',
            uploadedAt: '2024-01-01',
            updatedAt: '2024-03-12',
            version: 1,
            target: { type: 'subscription' },
            access: { level: 'download', watermark: true, downloadable: true, printable: true },
            isNew: false,
            notifyOnUpload: true,
            reporting: true,
            views: 520,
            downloads: 180,
            children: []
          }
        ]
      },
      {
        id: 'cat-5',
        name: 'HNWI',
        type: 'folder',
        status: 'published',
        parentId: 'root',
        path: '/HNWI',
        uploadedBy: 'System',
        uploadedAt: '2024-01-01',
        updatedAt: '2024-03-15',
        version: 1,
        target: { 
          type: 'segment',
          segments: ['HNWI (High Net Worth)']
        },
        access: { level: 'view', watermark: false, downloadable: true, printable: true },
        isNew: false,
        notifyOnUpload: true,
        reporting: true,
        views: 580,
        downloads: 145,
        metadata: {
          segments: ['HNWI (High Net Worth)']
        },
        tags: ['HNWI', 'Premium'],
        description: 'Documents et ressources dédiés aux investisseurs HNWI',
        children: [
          {
            id: 'cat-5-1',
            name: 'Prospectus',
            type: 'folder',
            status: 'published',
            parentId: 'cat-5',
            path: '/HNWI/Prospectus',
            uploadedBy: 'J. Miller',
            uploadedAt: '2024-02-01',
            updatedAt: '2024-03-10',
            version: 1,
            target: { 
              type: 'segment',
              segments: ['HNWI (High Net Worth)']
            },
            access: { level: 'download', watermark: true, downloadable: true, printable: true },
            isNew: false,
            notifyOnUpload: true,
            reporting: true,
            views: 320,
            downloads: 85,
            tags: ['Prospectus', 'HNWI'],
            children: []
          },
          {
            id: 'cat-5-2',
            name: 'Aides fiscales',
            type: 'folder',
            status: 'published',
            parentId: 'cat-5',
            path: '/HNWI/Aides fiscales',
            uploadedBy: 'K. Patel',
            uploadedAt: '2024-02-15',
            updatedAt: '2024-03-12',
            version: 1,
            target: { 
              type: 'segment',
              segments: ['HNWI (High Net Worth)']
            },
            access: { level: 'download', watermark: false, downloadable: true, printable: true },
            isNew: false,
            notifyOnUpload: true,
            reporting: true,
            views: 180,
            downloads: 42,
            tags: ['Fiscal', 'HNWI', 'Optimisation'],
            children: []
          },
          {
            id: 'cat-5-3',
            name: 'Guides d\'investissement',
            type: 'folder',
            status: 'published',
            parentId: 'cat-5',
            path: '/HNWI/Guides d\'investissement',
            uploadedBy: 'J. Miller',
            uploadedAt: '2024-03-01',
            updatedAt: '2024-03-15',
            version: 1,
            target: { 
              type: 'segment',
              segments: ['HNWI (High Net Worth)']
            },
            access: { level: 'view', watermark: false, downloadable: true, printable: true },
            isNew: true,
            notifyOnUpload: true,
            reporting: true,
            views: 80,
            downloads: 18,
            tags: ['Guide', 'HNWI', 'Formation'],
            children: []
          }
        ]
      }
    ]
  }
];

export const mockSegments = [
  'Tous les investisseurs',
  'Investisseurs Qualifiés',
  'Comité Stratégique',
  'LP Premium',
  'Family Offices',
  'Institutionnels',
  'HNWI (High Net Worth)',
  'Corporate Investors'
];

export const mockInvestors = [
  'John Smith Capital',
  'GlobalTrade Investment Fund',
  'Connor Family Trust',
  'FutureInvest Partners LP',
  'TechNova Ventures'
];

export const mockSubscriptions = [
  'Fonds I - A / 234 400,00 € / #10149',
  'Fonds II - B / 500 000,00 € / #10250',
  'Fonds III - C / 1 200 000,00 € / #10351'
];
