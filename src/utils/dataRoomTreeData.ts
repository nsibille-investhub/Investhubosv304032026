export interface TreeNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: TreeNode[];
  size?: string;
  date?: string;
  owner?: string;
}

// VENTECH I - LP Documents
export const ventechITree: TreeNode[] = [
  {
    id: 'v1-1',
    name: 'Constitutifs du Fonds',
    type: 'folder',
    children: [
      {
        id: 'v1-1-1',
        name: 'Règlement du Fonds VENTECH I.pdf',
        type: 'file',
        size: '2.3 MB',
        date: '15/01/2024',
        owner: 'Direction Juridique'
      },
      {
        id: 'v1-1-2',
        name: 'Statuts VENTECH I.pdf',
        type: 'file',
        size: '1.8 MB',
        date: '15/01/2024',
        owner: 'Direction Juridique'
      },
      {
        id: 'v1-1-3',
        name: 'Prospectus Commercial.pdf',
        type: 'file',
        size: '3.5 MB',
        date: '20/01/2024',
        owner: 'Marketing'
      }
    ]
  },
  {
    id: 'v1-2',
    name: 'Souscriptions',
    type: 'folder',
    children: [
      {
        id: 'v1-2-1',
        name: 'Bulletin de Souscription.pdf',
        type: 'file',
        size: '450 KB',
        date: '10/02/2024',
        owner: 'Operations'
      },
      {
        id: 'v1-2-2',
        name: 'Guide de Souscription.pdf',
        type: 'file',
        size: '1.2 MB',
        date: '10/02/2024',
        owner: 'Operations'
      },
      {
        id: 'v1-2-3',
        name: 'KYC Requirements.pdf',
        type: 'file',
        size: '680 KB',
        date: '12/02/2024',
        owner: 'Compliance'
      }
    ]
  },
  {
    id: 'v1-3',
    name: 'Rapports',
    type: 'folder',
    children: [
      {
        id: 'v1-3-1',
        name: 'Q4 2023',
        type: 'folder',
        children: [
          {
            id: 'v1-3-1-1',
            name: 'Quarterly Report Q4 2023.pdf',
            type: 'file',
            size: '4.2 MB',
            date: '15/01/2024',
            owner: 'Fund Manager'
          },
          {
            id: 'v1-3-1-2',
            name: 'Portfolio Valuation Q4 2023.xlsx',
            type: 'file',
            size: '890 KB',
            date: '15/01/2024',
            owner: 'Fund Manager'
          }
        ]
      },
      {
        id: 'v1-3-2',
        name: 'Q1 2024',
        type: 'folder',
        children: [
          {
            id: 'v1-3-2-1',
            name: 'Quarterly Report Q1 2024.pdf',
            type: 'file',
            size: '4.5 MB',
            date: '15/04/2024',
            owner: 'Fund Manager'
          }
        ]
      }
    ]
  },
  {
    id: 'v1-4',
    name: 'Distributions',
    type: 'folder',
    children: [
      {
        id: 'v1-4-1',
        name: 'Distribution Notice 2023.pdf',
        type: 'file',
        size: '320 KB',
        date: '28/12/2023',
        owner: 'Finance'
      },
      {
        id: 'v1-4-2',
        name: 'Tax Documents 2023.pdf',
        type: 'file',
        size: '1.1 MB',
        date: '31/01/2024',
        owner: 'Finance'
      }
    ]
  }
];

// VENTECH II - Rapports Trimestriels
export const ventechIITree: TreeNode[] = [
  {
    id: 'v2-1',
    name: '2023',
    type: 'folder',
    children: [
      {
        id: 'v2-1-1',
        name: 'Q1 2023',
        type: 'folder',
        children: [
          {
            id: 'v2-1-1-1',
            name: 'Rapport Trimestriel Q1.pdf',
            type: 'file',
            size: '5.2 MB',
            date: '15/04/2023',
            owner: 'Fund Manager'
          },
          {
            id: 'v2-1-1-2',
            name: 'Performance Dashboard Q1.pdf',
            type: 'file',
            size: '2.1 MB',
            date: '15/04/2023',
            owner: 'Analytics'
          },
          {
            id: 'v2-1-1-3',
            name: 'Portfolio Overview Q1.xlsx',
            type: 'file',
            size: '780 KB',
            date: '15/04/2023',
            owner: 'Fund Manager'
          }
        ]
      },
      {
        id: 'v2-1-2',
        name: 'Q2 2023',
        type: 'folder',
        children: [
          {
            id: 'v2-1-2-1',
            name: 'Rapport Trimestriel Q2.pdf',
            type: 'file',
            size: '5.5 MB',
            date: '15/07/2023',
            owner: 'Fund Manager'
          },
          {
            id: 'v2-1-2-2',
            name: 'Performance Dashboard Q2.pdf',
            type: 'file',
            size: '2.3 MB',
            date: '15/07/2023',
            owner: 'Analytics'
          }
        ]
      },
      {
        id: 'v2-1-3',
        name: 'Q3 2023',
        type: 'folder',
        children: [
          {
            id: 'v2-1-3-1',
            name: 'Rapport Trimestriel Q3.pdf',
            type: 'file',
            size: '5.8 MB',
            date: '15/10/2023',
            owner: 'Fund Manager'
          }
        ]
      },
      {
        id: 'v2-1-4',
        name: 'Q4 2023',
        type: 'folder',
        children: [
          {
            id: 'v2-1-4-1',
            name: 'Rapport Trimestriel Q4.pdf',
            type: 'file',
            size: '6.1 MB',
            date: '15/01/2024',
            owner: 'Fund Manager'
          },
          {
            id: 'v2-1-4-2',
            name: 'Annual Review 2023.pdf',
            type: 'file',
            size: '8.5 MB',
            date: '15/01/2024',
            owner: 'Fund Manager'
          }
        ]
      }
    ]
  },
  {
    id: 'v2-2',
    name: '2024',
    type: 'folder',
    children: [
      {
        id: 'v2-2-1',
        name: 'Q1 2024',
        type: 'folder',
        children: [
          {
            id: 'v2-2-1-1',
            name: 'Rapport Trimestriel Q1.pdf',
            type: 'file',
            size: '6.2 MB',
            date: '15/04/2024',
            owner: 'Fund Manager'
          },
          {
            id: 'v2-2-1-2',
            name: 'Performance Dashboard Q1.pdf',
            type: 'file',
            size: '2.4 MB',
            date: '15/04/2024',
            owner: 'Analytics'
          }
        ]
      }
    ]
  },
  {
    id: 'v2-3',
    name: 'Présentations Investisseurs',
    type: 'folder',
    children: [
      {
        id: 'v2-3-1',
        name: 'Investor Deck 2024.pdf',
        type: 'file',
        size: '12.5 MB',
        date: '05/01/2024',
        owner: 'IR Team'
      },
      {
        id: 'v2-3-2',
        name: 'AGM Presentation 2024.pdf',
        type: 'file',
        size: '8.9 MB',
        date: '20/03/2024',
        owner: 'IR Team'
      }
    ]
  }
];

// KORELYA I - Due Diligence
export const korelyaITree: TreeNode[] = [
  {
    id: 'k1-1',
    name: 'Legal Due Diligence',
    type: 'folder',
    children: [
      {
        id: 'k1-1-1',
        name: 'Corporate Documents',
        type: 'folder',
        children: [
          {
            id: 'k1-1-1-1',
            name: 'Articles of Association.pdf',
            type: 'file',
            size: '1.2 MB',
            date: '10/01/2024',
            owner: 'Legal Team'
          },
          {
            id: 'k1-1-1-2',
            name: 'Shareholder Agreements.pdf',
            type: 'file',
            size: '2.8 MB',
            date: '10/01/2024',
            owner: 'Legal Team'
          },
          {
            id: 'k1-1-1-3',
            name: 'Board Minutes 2020-2024.pdf',
            type: 'file',
            size: '4.5 MB',
            date: '12/01/2024',
            owner: 'Legal Team'
          }
        ]
      },
      {
        id: 'k1-1-2',
        name: 'Contracts & Agreements',
        type: 'folder',
        children: [
          {
            id: 'k1-1-2-1',
            name: 'Material Contracts Summary.xlsx',
            type: 'file',
            size: '650 KB',
            date: '15/01/2024',
            owner: 'Legal Team'
          },
          {
            id: 'k1-1-2-2',
            name: 'Customer Contracts.pdf',
            type: 'file',
            size: '8.2 MB',
            date: '15/01/2024',
            owner: 'Legal Team'
          }
        ]
      },
      {
        id: 'k1-1-3',
        name: 'IP & Patents',
        type: 'folder',
        children: [
          {
            id: 'k1-1-3-1',
            name: 'Patent Portfolio.pdf',
            type: 'file',
            size: '3.2 MB',
            date: '18/01/2024',
            owner: 'Legal Team'
          },
          {
            id: 'k1-1-3-2',
            name: 'Trademark Registrations.pdf',
            type: 'file',
            size: '1.8 MB',
            date: '18/01/2024',
            owner: 'Legal Team'
          }
        ]
      }
    ]
  },
  {
    id: 'k1-2',
    name: 'Financial Due Diligence',
    type: 'folder',
    children: [
      {
        id: 'k1-2-1',
        name: 'Audited Financials',
        type: 'folder',
        children: [
          {
            id: 'k1-2-1-1',
            name: 'Financial Statements 2023.pdf',
            type: 'file',
            size: '5.4 MB',
            date: '20/01/2024',
            owner: 'CFO'
          },
          {
            id: 'k1-2-1-2',
            name: 'Financial Statements 2022.pdf',
            type: 'file',
            size: '4.9 MB',
            date: '20/01/2024',
            owner: 'CFO'
          },
          {
            id: 'k1-2-1-3',
            name: 'Audit Reports 2020-2023.pdf',
            type: 'file',
            size: '6.8 MB',
            date: '20/01/2024',
            owner: 'CFO'
          }
        ]
      },
      {
        id: 'k1-2-2',
        name: 'Management Accounts',
        type: 'folder',
        children: [
          {
            id: 'k1-2-2-1',
            name: 'Monthly P&L 2024.xlsx',
            type: 'file',
            size: '890 KB',
            date: '01/02/2024',
            owner: 'Finance'
          },
          {
            id: 'k1-2-2-2',
            name: 'Cash Flow Forecast.xlsx',
            type: 'file',
            size: '720 KB',
            date: '01/02/2024',
            owner: 'Finance'
          }
        ]
      },
      {
        id: 'k1-2-3',
        name: 'Quality of Earnings Report.pdf',
        type: 'file',
        size: '7.2 MB',
        date: '25/01/2024',
        owner: 'External Advisor'
      }
    ]
  },
  {
    id: 'k1-3',
    name: 'Commercial Due Diligence',
    type: 'folder',
    children: [
      {
        id: 'k1-3-1',
        name: 'Market Analysis.pdf',
        type: 'file',
        size: '9.5 MB',
        date: '28/01/2024',
        owner: 'Strategy Team'
      },
      {
        id: 'k1-3-2',
        name: 'Customer Analysis.xlsx',
        type: 'file',
        size: '1.2 MB',
        date: '28/01/2024',
        owner: 'Sales'
      },
      {
        id: 'k1-3-3',
        name: 'Competitive Landscape.pdf',
        type: 'file',
        size: '6.8 MB',
        date: '30/01/2024',
        owner: 'Strategy Team'
      }
    ]
  },
  {
    id: 'k1-4',
    name: 'Management Presentations',
    type: 'folder',
    children: [
      {
        id: 'k1-4-1',
        name: 'Management Presentation.pdf',
        type: 'file',
        size: '15.2 MB',
        date: '05/02/2024',
        owner: 'CEO'
      },
      {
        id: 'k1-4-2',
        name: 'Strategic Plan 2024-2027.pdf',
        type: 'file',
        size: '8.9 MB',
        date: '05/02/2024',
        owner: 'CEO'
      }
    ]
  }
];

// ARDIAN GROWTH - Investisseurs
export const ardianGrowthTree: TreeNode[] = [
  {
    id: 'ag-1',
    name: 'Fund Documentation',
    type: 'folder',
    children: [
      {
        id: 'ag-1-1',
        name: 'Private Placement Memorandum.pdf',
        type: 'file',
        size: '12.5 MB',
        date: '01/12/2023',
        owner: 'Legal'
      },
      {
        id: 'ag-1-2',
        name: 'Limited Partnership Agreement.pdf',
        type: 'file',
        size: '8.9 MB',
        date: '01/12/2023',
        owner: 'Legal'
      },
      {
        id: 'ag-1-3',
        name: 'Subscription Documents.pdf',
        type: 'file',
        size: '2.4 MB',
        date: '05/12/2023',
        owner: 'Operations'
      },
      {
        id: 'ag-1-4',
        name: 'Side Letters Templates.pdf',
        type: 'file',
        size: '1.8 MB',
        date: '05/12/2023',
        owner: 'Legal'
      }
    ]
  },
  {
    id: 'ag-2',
    name: 'Capital Calls & Distributions',
    type: 'folder',
    children: [
      {
        id: 'ag-2-1',
        name: '2024',
        type: 'folder',
        children: [
          {
            id: 'ag-2-1-1',
            name: 'Capital Call Notice - Jan 2024.pdf',
            type: 'file',
            size: '450 KB',
            date: '15/01/2024',
            owner: 'Finance'
          },
          {
            id: 'ag-2-1-2',
            name: 'Capital Call Notice - Mar 2024.pdf',
            type: 'file',
            size: '480 KB',
            date: '15/03/2024',
            owner: 'Finance'
          }
        ]
      },
      {
        id: 'ag-2-2',
        name: '2023',
        type: 'folder',
        children: [
          {
            id: 'ag-2-2-1',
            name: 'Distribution Notice - Dec 2023.pdf',
            type: 'file',
            size: '520 KB',
            date: '20/12/2023',
            owner: 'Finance'
          }
        ]
      }
    ]
  },
  {
    id: 'ag-3',
    name: 'Portfolio Updates',
    type: 'folder',
    children: [
      {
        id: 'ag-3-1',
        name: 'Portfolio Summary Q1 2024.pdf',
        type: 'file',
        size: '6.8 MB',
        date: '20/04/2024',
        owner: 'Portfolio Management'
      },
      {
        id: 'ag-3-2',
        name: 'New Investments 2024.pdf',
        type: 'file',
        size: '4.2 MB',
        date: '15/02/2024',
        owner: 'Investment Team'
      },
      {
        id: 'ag-3-3',
        name: 'Exits & Realizations.pdf',
        type: 'file',
        size: '3.5 MB',
        date: '10/03/2024',
        owner: 'Investment Team'
      }
    ]
  },
  {
    id: 'ag-4',
    name: 'Annual Reports',
    type: 'folder',
    children: [
      {
        id: 'ag-4-1',
        name: 'Annual Report 2023.pdf',
        type: 'file',
        size: '18.5 MB',
        date: '31/01/2024',
        owner: 'Fund Manager'
      },
      {
        id: 'ag-4-2',
        name: 'Annual Report 2022.pdf',
        type: 'file',
        size: '16.8 MB',
        date: '31/01/2023',
        owner: 'Fund Manager'
      }
    ]
  },
  {
    id: 'ag-5',
    name: 'ESG & Impact',
    type: 'folder',
    children: [
      {
        id: 'ag-5-1',
        name: 'ESG Policy Statement.pdf',
        type: 'file',
        size: '2.1 MB',
        date: '15/01/2024',
        owner: 'ESG Team'
      },
      {
        id: 'ag-5-2',
        name: 'Impact Report 2023.pdf',
        type: 'file',
        size: '5.8 MB',
        date: '20/02/2024',
        owner: 'ESG Team'
      },
      {
        id: 'ag-5-3',
        name: 'Portfolio ESG Metrics.xlsx',
        type: 'file',
        size: '980 KB',
        date: '01/03/2024',
        owner: 'ESG Team'
      }
    ]
  }
];

// Participations Portfolio
export const participationsTree: TreeNode[] = [
  {
    id: 'pp-1',
    name: 'Portfolio Companies',
    type: 'folder',
    children: [
      {
        id: 'pp-1-1',
        name: 'TechCo SAS',
        type: 'folder',
        children: [
          {
            id: 'pp-1-1-1',
            name: 'Board Deck Q1 2024.pdf',
            type: 'file',
            size: '8.5 MB',
            date: '15/04/2024',
            owner: 'TechCo'
          },
          {
            id: 'pp-1-1-2',
            name: 'Financial Report Q1.xlsx',
            type: 'file',
            size: '1.2 MB',
            date: '20/04/2024',
            owner: 'TechCo CFO'
          },
          {
            id: 'pp-1-1-3',
            name: 'KPIs Dashboard.pdf',
            type: 'file',
            size: '2.8 MB',
            date: '25/04/2024',
            owner: 'TechCo'
          }
        ]
      },
      {
        id: 'pp-1-2',
        name: 'BioHealth Inc',
        type: 'folder',
        children: [
          {
            id: 'pp-1-2-1',
            name: 'Clinical Trials Update.pdf',
            type: 'file',
            size: '5.2 MB',
            date: '10/04/2024',
            owner: 'BioHealth'
          },
          {
            id: 'pp-1-2-2',
            name: 'Regulatory Approvals.pdf',
            type: 'file',
            size: '3.8 MB',
            date: '15/04/2024',
            owner: 'BioHealth'
          }
        ]
      },
      {
        id: 'pp-1-3',
        name: 'GreenEnergy Ltd',
        type: 'folder',
        children: [
          {
            id: 'pp-1-3-1',
            name: 'Production Metrics Q1.xlsx',
            type: 'file',
            size: '890 KB',
            date: '05/04/2024',
            owner: 'GreenEnergy'
          },
          {
            id: 'pp-1-3-2',
            name: 'Sustainability Report.pdf',
            type: 'file',
            size: '6.5 MB',
            date: '12/04/2024',
            owner: 'GreenEnergy'
          }
        ]
      }
    ]
  },
  {
    id: 'pp-2',
    name: 'Board Materials',
    type: 'folder',
    children: [
      {
        id: 'pp-2-1',
        name: 'Board Calendar 2024.pdf',
        type: 'file',
        size: '320 KB',
        date: '05/01/2024',
        owner: 'Portfolio Team'
      },
      {
        id: 'pp-2-2',
        name: 'Observer Rights Template.pdf',
        type: 'file',
        size: '580 KB',
        date: '10/01/2024',
        owner: 'Legal'
      }
    ]
  },
  {
    id: 'pp-3',
    name: 'Valuations',
    type: 'folder',
    children: [
      {
        id: 'pp-3-1',
        name: 'Q4 2023 Valuations',
        type: 'folder',
        children: [
          {
            id: 'pp-3-1-1',
            name: 'Portfolio Valuation Summary.xlsx',
            type: 'file',
            size: '1.5 MB',
            date: '31/12/2023',
            owner: 'Valuation Team'
          },
          {
            id: 'pp-3-1-2',
            name: 'Valuation Methodology.pdf',
            type: 'file',
            size: '2.8 MB',
            date: '31/12/2023',
            owner: 'Valuation Team'
          }
        ]
      },
      {
        id: 'pp-3-2',
        name: 'Q1 2024 Valuations',
        type: 'folder',
        children: [
          {
            id: 'pp-3-2-1',
            name: 'Portfolio Valuation Summary.xlsx',
            type: 'file',
            size: '1.6 MB',
            date: '31/03/2024',
            owner: 'Valuation Team'
          }
        ]
      }
    ]
  },
  {
    id: 'pp-4',
    name: 'Exit Pipeline',
    type: 'folder',
    children: [
      {
        id: 'pp-4-1',
        name: 'Exit Strategy Overview.pdf',
        type: 'file',
        size: '4.2 MB',
        date: '15/02/2024',
        owner: 'Investment Team'
      },
      {
        id: 'pp-4-2',
        name: 'IPO Preparation - TechCo.pdf',
        type: 'file',
        size: '6.8 MB',
        date: '20/03/2024',
        owner: 'Investment Team'
      }
    ]
  }
];

// Investisseurs LP (général)
export const investisseursLPTree: TreeNode[] = [
  {
    id: 'ilp-1',
    name: 'Onboarding',
    type: 'folder',
    children: [
      {
        id: 'ilp-1-1',
        name: 'Welcome Guide.pdf',
        type: 'file',
        size: '3.2 MB',
        date: '01/01/2024',
        owner: 'IR Team'
      },
      {
        id: 'ilp-1-2',
        name: 'Investor Portal Guide.pdf',
        type: 'file',
        size: '1.8 MB',
        date: '01/01/2024',
        owner: 'IR Team'
      },
      {
        id: 'ilp-1-3',
        name: 'Contact Directory.pdf',
        type: 'file',
        size: '450 KB',
        date: '15/01/2024',
        owner: 'IR Team'
      }
    ]
  },
  {
    id: 'ilp-2',
    name: 'Fund Overview',
    type: 'folder',
    children: [
      {
        id: 'ilp-2-1',
        name: 'Investment Strategy.pdf',
        type: 'file',
        size: '5.8 MB',
        date: '10/01/2024',
        owner: 'Investment Team'
      },
      {
        id: 'ilp-2-2',
        name: 'Team Biographies.pdf',
        type: 'file',
        size: '2.4 MB',
        date: '10/01/2024',
        owner: 'HR'
      },
      {
        id: 'ilp-2-3',
        name: 'Track Record.pdf',
        type: 'file',
        size: '4.5 MB',
        date: '15/01/2024',
        owner: 'IR Team'
      }
    ]
  },
  {
    id: 'ilp-3',
    name: 'News & Updates',
    type: 'folder',
    children: [
      {
        id: 'ilp-3-1',
        name: 'Newsletter Q1 2024.pdf',
        type: 'file',
        size: '2.8 MB',
        date: '15/04/2024',
        owner: 'IR Team'
      },
      {
        id: 'ilp-3-2',
        name: 'Press Releases 2024.pdf',
        type: 'file',
        size: '1.5 MB',
        date: '20/03/2024',
        owner: 'Marketing'
      }
    ]
  },
  {
    id: 'ilp-4',
    name: 'Events',
    type: 'folder',
    children: [
      {
        id: 'ilp-4-1',
        name: 'Annual Investor Meeting 2024',
        type: 'folder',
        children: [
          {
            id: 'ilp-4-1-1',
            name: 'Agenda.pdf',
            type: 'file',
            size: '280 KB',
            date: '01/03/2024',
            owner: 'IR Team'
          },
          {
            id: 'ilp-4-1-2',
            name: 'Presentation.pdf',
            type: 'file',
            size: '18.5 MB',
            date: '15/03/2024',
            owner: 'CEO'
          },
          {
            id: 'ilp-4-1-3',
            name: 'Recording.mp4',
            type: 'file',
            size: '850 MB',
            date: '20/03/2024',
            owner: 'IR Team'
          }
        ]
      }
    ]
  }
];

// Partenaires Services
export const partenairesTree: TreeNode[] = [
  {
    id: 'ps-1',
    name: 'Service Agreements',
    type: 'folder',
    children: [
      {
        id: 'ps-1-1',
        name: 'Master Service Agreement.pdf',
        type: 'file',
        size: '2.8 MB',
        date: '01/01/2024',
        owner: 'Legal'
      },
      {
        id: 'ps-1-2',
        name: 'NDA Template.pdf',
        type: 'file',
        size: '580 KB',
        date: '01/01/2024',
        owner: 'Legal'
      },
      {
        id: 'ps-1-3',
        name: 'SLA Standards.pdf',
        type: 'file',
        size: '1.2 MB',
        date: '05/01/2024',
        owner: 'Operations'
      }
    ]
  },
  {
    id: 'ps-2',
    name: 'Technical Documentation',
    type: 'folder',
    children: [
      {
        id: 'ps-2-1',
        name: 'API Documentation.pdf',
        type: 'file',
        size: '4.5 MB',
        date: '10/02/2024',
        owner: 'Tech Team'
      },
      {
        id: 'ps-2-2',
        name: 'Integration Guide.pdf',
        type: 'file',
        size: '3.2 MB',
        date: '10/02/2024',
        owner: 'Tech Team'
      },
      {
        id: 'ps-2-3',
        name: 'Security Requirements.pdf',
        type: 'file',
        size: '1.8 MB',
        date: '15/02/2024',
        owner: 'Security'
      }
    ]
  },
  {
    id: 'ps-3',
    name: 'Reporting Templates',
    type: 'folder',
    children: [
      {
        id: 'ps-3-1',
        name: 'Monthly Report Template.xlsx',
        type: 'file',
        size: '450 KB',
        date: '01/03/2024',
        owner: 'Operations'
      },
      {
        id: 'ps-3-2',
        name: 'KPI Dashboard Template.xlsx',
        type: 'file',
        size: '680 KB',
        date: '01/03/2024',
        owner: 'Operations'
      }
    ]
  },
  {
    id: 'ps-4',
    name: 'Compliance',
    type: 'folder',
    children: [
      {
        id: 'ps-4-1',
        name: 'GDPR Guidelines.pdf',
        type: 'file',
        size: '2.2 MB',
        date: '15/01/2024',
        owner: 'Compliance'
      },
      {
        id: 'ps-4-2',
        name: 'Data Processing Agreement.pdf',
        type: 'file',
        size: '1.5 MB',
        date: '15/01/2024',
        owner: 'Legal'
      },
      {
        id: 'ps-4-3',
        name: 'Security Certifications.pdf',
        type: 'file',
        size: '3.8 MB',
        date: '20/01/2024',
        owner: 'Security'
      }
    ]
  }
];

// Multi-Fonds HNWI
export const multiFondsTree: TreeNode[] = [
  {
    id: 'mf-1',
    name: 'Cross-Fund Analytics',
    type: 'folder',
    children: [
      {
        id: 'mf-1-1',
        name: 'Consolidated Performance Q1 2024.pdf',
        type: 'file',
        size: '8.5 MB',
        date: '20/04/2024',
        owner: 'Analytics Team'
      },
      {
        id: 'mf-1-2',
        name: 'Portfolio Allocation Overview.xlsx',
        type: 'file',
        size: '1.8 MB',
        date: '20/04/2024',
        owner: 'Analytics Team'
      },
      {
        id: 'mf-1-3',
        name: 'Risk Analysis Multi-Fund.pdf',
        type: 'file',
        size: '5.2 MB',
        date: '25/04/2024',
        owner: 'Risk Team'
      }
    ]
  },
  {
    id: 'mf-2',
    name: 'VENTECH Funds',
    type: 'folder',
    children: [
      {
        id: 'mf-2-1',
        name: 'VENTECH I Performance.pdf',
        type: 'file',
        size: '3.8 MB',
        date: '15/04/2024',
        owner: 'Fund Manager'
      },
      {
        id: 'mf-2-2',
        name: 'VENTECH II Performance.pdf',
        type: 'file',
        size: '4.2 MB',
        date: '15/04/2024',
        owner: 'Fund Manager'
      },
      {
        id: 'mf-2-3',
        name: 'VENTECH Comparison Analysis.xlsx',
        type: 'file',
        size: '980 KB',
        date: '18/04/2024',
        owner: 'Analytics Team'
      }
    ]
  },
  {
    id: 'mf-3',
    name: 'KORELYA I',
    type: 'folder',
    children: [
      {
        id: 'mf-3-1',
        name: 'KORELYA Performance Report.pdf',
        type: 'file',
        size: '4.8 MB',
        date: '15/04/2024',
        owner: 'Fund Manager'
      },
      {
        id: 'mf-3-2',
        name: 'KORELYA Portfolio Companies.pdf',
        type: 'file',
        size: '6.5 MB',
        date: '18/04/2024',
        owner: 'Investment Team'
      }
    ]
  },
  {
    id: 'mf-4',
    name: 'ARDIAN GROWTH',
    type: 'folder',
    children: [
      {
        id: 'mf-4-1',
        name: 'ARDIAN Performance Report.pdf',
        type: 'file',
        size: '5.2 MB',
        date: '15/04/2024',
        owner: 'Fund Manager'
      },
      {
        id: 'mf-4-2',
        name: 'ARDIAN Impact Metrics.pdf',
        type: 'file',
        size: '3.8 MB',
        date: '20/04/2024',
        owner: 'ESG Team'
      }
    ]
  },
  {
    id: 'mf-5',
    name: 'Tax & Reporting',
    type: 'folder',
    children: [
      {
        id: 'mf-5-1',
        name: 'Consolidated Tax Statement 2023.pdf',
        type: 'file',
        size: '2.8 MB',
        date: '31/01/2024',
        owner: 'Tax Team'
      },
      {
        id: 'mf-5-2',
        name: 'K-1 Forms 2023.pdf',
        type: 'file',
        size: '1.5 MB',
        date: '15/03/2024',
        owner: 'Tax Team'
      }
    ]
  },
  {
    id: 'mf-6',
    name: 'Wealth Planning',
    type: 'folder',
    children: [
      {
        id: 'mf-6-1',
        name: 'Portfolio Diversification Analysis.pdf',
        type: 'file',
        size: '4.5 MB',
        date: '10/04/2024',
        owner: 'Wealth Advisor'
      },
      {
        id: 'mf-6-2',
        name: 'Estate Planning Guide.pdf',
        type: 'file',
        size: '3.2 MB',
        date: '15/03/2024',
        owner: 'Legal'
      }
    ]
  }
];

// Fonction pour obtenir l'arborescence en fonction de l'espace
export function getTreeForSpace(spaceId: string): TreeNode[] {
  const treeMap: Record<string, TreeNode[]> = {
    'space-1': investisseursLPTree,
    'space-2': ventechITree,
    'space-3': ventechIITree,
    'space-4': korelyaITree,
    'space-5': participationsTree,
    'space-6': ardianGrowthTree,
    'space-7': partenairesTree,
    'space-8': multiFondsTree
  };

  return treeMap[spaceId] || [];
}
