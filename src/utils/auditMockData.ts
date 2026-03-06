export interface AuditEvent {
  id: string;
  type: 'decision_change' | 'comment_added' | 'comment_edited' | 'status_change' | 'assignment_change' | 'alert_created' | 'field_updated';
  timestamp: string;
  user: {
    name: string;
    avatar: string;
    email: string;
  };
  action: string;
  details?: {
    before?: any;
    after?: any;
    field?: string;
  };
  comment?: string;
  alertName?: string;
}

export function generateAuditTrail(entityStatus: string): AuditEvent[] {
  const baseEvents: AuditEvent[] = [];
  
  // Common users
  const users = [
    { name: 'J. Miller', avatar: 'JM', email: 'j.miller@investhub.com' },
    { name: 'K. Patel', avatar: 'KP', email: 'k.patel@investhub.com' },
    { name: 'S. Chen', avatar: 'SC', email: 's.chen@investhub.com' },
  ];

  switch (entityStatus) {
    case 'Pending':
      return [
        {
          id: 'evt-1',
          type: 'alert_created',
          timestamp: '2025-02-13T09:30:00Z',
          user: users[0],
          action: 'New alert detected',
          alertName: 'John R. Smith',
          details: {
            after: '92% similarity match'
          }
        },
        {
          id: 'evt-2',
          type: 'alert_created',
          timestamp: '2025-02-13T09:31:00Z',
          user: users[0],
          action: 'New alert detected',
          alertName: 'Jonathan Smith',
          details: {
            after: '87% similarity match'
          }
        },
        {
          id: 'evt-3',
          type: 'alert_created',
          timestamp: '2025-02-13T09:32:00Z',
          user: users[0],
          action: 'New alert detected',
          alertName: 'John Smith Jr.',
          details: {
            after: '85% similarity match'
          }
        },
        {
          id: 'evt-4',
          type: 'assignment_change',
          timestamp: '2025-02-13T09:35:00Z',
          user: users[0],
          action: 'Entity assigned for review',
          details: {
            field: 'Analyst',
            after: 'J. Miller'
          }
        },
        {
          id: 'evt-5',
          type: 'status_change',
          timestamp: '2025-02-13T09:36:00Z',
          user: users[0],
          action: 'Status updated',
          details: {
            field: 'Status',
            before: 'New',
            after: 'Pending Review'
          }
        }
      ];

    case 'Clear':
      return [
        {
          id: 'evt-1',
          type: 'alert_created',
          timestamp: '2025-01-15T14:20:00Z',
          user: users[0],
          action: 'Screening initiated',
          details: {
            after: 'Entity screened against watchlists'
          }
        },
        {
          id: 'evt-2',
          type: 'status_change',
          timestamp: '2025-01-15T14:25:00Z',
          user: users[0],
          action: 'Screening completed',
          details: {
            field: 'Status',
            before: 'Screening',
            after: 'Clear'
          },
          comment: 'No matches found in any sanctions lists or watchlists. Entity cleared for operations.'
        },
        {
          id: 'evt-3',
          type: 'field_updated',
          timestamp: '2025-01-15T14:26:00Z',
          user: users[0],
          action: 'Risk level assessed',
          details: {
            field: 'Risk Level',
            after: 'Low'
          }
        }
      ];

    case 'True Hit':
      return [
        {
          id: 'evt-1',
          type: 'alert_created',
          timestamp: '2025-01-20T10:15:00Z',
          user: users[0],
          action: 'Critical alert detected',
          alertName: 'Sarah M. Connor',
          details: {
            after: '95% similarity match - High risk'
          }
        },
        {
          id: 'evt-2',
          type: 'assignment_change',
          timestamp: '2025-01-20T10:18:00Z',
          user: users[0],
          action: 'Urgent review assigned',
          details: {
            field: 'Analyst',
            after: 'J. Miller'
          }
        },
        {
          id: 'evt-3',
          type: 'comment_added',
          timestamp: '2025-01-20T11:30:00Z',
          user: users[0],
          action: 'Investigation note added',
          alertName: 'Sarah M. Connor',
          comment: 'Initial review shows multiple matching data points: DOB, passport number, and address all align with OFAC SDN list entry.'
        },
        {
          id: 'evt-4',
          type: 'field_updated',
          timestamp: '2025-01-20T11:35:00Z',
          user: users[0],
          action: 'Additional verification completed',
          details: {
            field: 'Verification Status',
            before: 'In Progress',
            after: 'Verified'
          }
        },
        {
          id: 'evt-5',
          type: 'decision_change',
          timestamp: '2025-01-20T14:20:00Z',
          user: users[0],
          action: 'Decision recorded',
          alertName: 'Sarah M. Connor',
          details: {
            field: 'Decision',
            before: null,
            after: 'true_hit'
          },
          comment: 'Confirmed match with sanctioned individual. Multiple data points align including DOB, address, and passport number. Risk assessment indicates high exposure to PPE sanctions.'
        },
        {
          id: 'evt-6',
          type: 'status_change',
          timestamp: '2025-01-20T14:21:00Z',
          user: users[0],
          action: 'Entity status escalated',
          details: {
            field: 'Status',
            before: 'Pending',
            after: 'True Hit'
          }
        },
        {
          id: 'evt-7',
          type: 'field_updated',
          timestamp: '2025-01-20T14:22:00Z',
          user: users[0],
          action: 'Risk level elevated',
          details: {
            field: 'Risk Level',
            before: 'Pending',
            after: 'High'
          }
        }
      ];

    case 'Clear':
      return [
        {
          id: 'evt-1',
          type: 'alert_created',
          timestamp: '2025-01-15T08:45:00Z',
          user: users[1],
          action: 'Alert detected',
          alertName: 'Future Investment Fund Ltd',
          details: {
            after: '82% similarity match'
          }
        },
        {
          id: 'evt-2',
          type: 'alert_created',
          timestamp: '2025-01-15T08:46:00Z',
          user: users[1],
          action: 'Additional alert detected',
          alertName: 'FutureInvest Holdings',
          details: {
            after: '76% similarity match'
          }
        },
        {
          id: 'evt-3',
          type: 'assignment_change',
          timestamp: '2025-01-15T09:00:00Z',
          user: users[1],
          action: 'Entity assigned',
          details: {
            field: 'Analyst',
            after: 'K. Patel'
          }
        },
        {
          id: 'evt-4',
          type: 'comment_added',
          timestamp: '2025-01-15T10:30:00Z',
          user: users[1],
          action: 'Initial assessment',
          alertName: 'Future Investment Fund Ltd',
          comment: 'Name similarity only. Checking company registry to verify entity details.'
        },
        {
          id: 'evt-5',
          type: 'decision_change',
          timestamp: '2025-01-15T13:15:00Z',
          user: users[1],
          action: 'First alert resolved',
          alertName: 'Future Investment Fund Ltd',
          details: {
            field: 'Decision',
            before: null,
            after: 'false_hit'
          },
          comment: 'Name similarity only. Verified through independent sources that this is a legitimate UK-based investment fund with no connection to sanctioned entities. Different registration numbers and ownership structure.'
        },
        {
          id: 'evt-6',
          type: 'comment_added',
          timestamp: '2025-01-18T09:00:00Z',
          user: users[1],
          action: 'Secondary review note',
          alertName: 'FutureInvest Holdings',
          comment: 'Reviewing second match. Conducting company registry search for verification.'
        },
        {
          id: 'evt-7',
          type: 'decision_change',
          timestamp: '2025-01-18T11:30:00Z',
          user: users[1],
          action: 'Second alert resolved',
          alertName: 'FutureInvest Holdings',
          details: {
            field: 'Decision',
            before: null,
            after: 'false_hit'
          },
          comment: 'Different entity, confirmed through company registry search. No connection to any sanctioned parties.'
        },
        {
          id: 'evt-8',
          type: 'status_change',
          timestamp: '2025-01-18T11:31:00Z',
          user: users[1],
          action: 'All alerts cleared',
          details: {
            field: 'Status',
            before: 'Pending',
            after: 'Clear'
          }
        },
        {
          id: 'evt-9',
          type: 'field_updated',
          timestamp: '2025-01-18T11:32:00Z',
          user: users[1],
          action: 'Risk assessment finalized',
          details: {
            field: 'Risk Level',
            before: 'Pending',
            after: 'Low'
          }
        }
      ];

    case 'New Hit':
      return [
        {
          id: 'evt-1',
          type: 'alert_created',
          timestamp: '2025-01-10T07:30:00Z',
          user: users[1],
          action: 'Initial alert',
          alertName: 'TechNova Solutions Inc.',
          details: {
            after: '88% similarity match'
          }
        },
        {
          id: 'evt-2',
          type: 'decision_change',
          timestamp: '2025-01-10T15:20:00Z',
          user: users[1],
          action: 'First decision',
          alertName: 'TechNova Solutions Inc.',
          details: {
            field: 'Decision',
            before: null,
            after: 'false_hit'
          },
          comment: 'Initial review showed name similarity only. Confirmed different entity based in Delaware, USA.'
        },
        {
          id: 'evt-3',
          type: 'alert_created',
          timestamp: '2025-01-25T11:15:00Z',
          user: users[1],
          action: 'New alert detected',
          alertName: 'Nova Technology Group',
          details: {
            after: '85% similarity match'
          }
        },
        {
          id: 'evt-4',
          type: 'comment_added',
          timestamp: '2025-01-25T14:30:00Z',
          user: users[1],
          action: 'Investigation note',
          alertName: 'Nova Technology Group',
          comment: 'Investigating potential corporate structure overlaps. Ownership chain requires further analysis.'
        },
        {
          id: 'evt-5',
          type: 'decision_change',
          timestamp: '2025-01-25T16:45:00Z',
          user: users[1],
          action: 'Interim decision',
          alertName: 'Nova Technology Group',
          details: {
            field: 'Decision',
            before: null,
            after: 'unsure'
          },
          comment: 'Requires additional investigation. Some corporate structure overlaps detected but ownership chain unclear.'
        },
        {
          id: 'evt-6',
          type: 'alert_created',
          timestamp: '2025-02-05T08:00:00Z',
          user: users[1],
          action: 'Critical alert',
          alertName: 'TechNova International',
          details: {
            after: '91% similarity match - Subsidiary link detected'
          }
        },
        {
          id: 'evt-7',
          type: 'comment_added',
          timestamp: '2025-02-05T10:30:00Z',
          user: users[1],
          action: 'Critical finding',
          alertName: 'TechNova International',
          comment: 'Corporate records analysis reveals majority ownership by RSSFE-listed company. Escalating for immediate review.'
        },
        {
          id: 'evt-8',
          type: 'decision_change',
          timestamp: '2025-02-05T13:00:00Z',
          user: users[1],
          action: 'Confirmed match',
          alertName: 'TechNova International',
          details: {
            field: 'Decision',
            before: null,
            after: 'true_hit'
          },
          comment: 'Confirmed subsidiary of sanctioned entity. Corporate records show majority ownership by RSSFE-listed company.'
        },
        {
          id: 'evt-9',
          type: 'status_change',
          timestamp: '2025-02-05T13:01:00Z',
          user: users[1],
          action: 'Status updated - New hits detected',
          details: {
            field: 'Status',
            before: 'Clear',
            after: 'New Hit'
          }
        },
        {
          id: 'evt-10',
          type: 'field_updated',
          timestamp: '2025-02-05T13:02:00Z',
          user: users[1],
          action: 'Risk escalated',
          details: {
            field: 'Risk Level',
            before: 'Low',
            after: 'High'
          }
        },
        {
          id: 'evt-11',
          type: 'alert_created',
          timestamp: '2025-02-13T09:00:00Z',
          user: users[1],
          action: 'Latest alert',
          alertName: 'TechNova Ventures',
          details: {
            after: '79% similarity match'
          }
        }
      ];

    default:
      return [];
  }
}
