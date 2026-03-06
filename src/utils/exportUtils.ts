import { AuditEvent } from './auditMockData';

export function exportAuditTrailToCSV(events: AuditEvent[], entityName: string) {
  const headers = ['Timestamp', 'User', 'Email', 'Event Type', 'Action', 'Alert Name', 'Field', 'Before', 'After', 'Comment'];
  
  const rows = events.map(event => [
    event.timestamp,
    event.user.name,
    event.user.email,
    event.type,
    event.action,
    event.alertName || '',
    event.details?.field || '',
    typeof event.details?.before === 'string' ? event.details.before : JSON.stringify(event.details?.before || ''),
    typeof event.details?.after === 'string' ? event.details.after : JSON.stringify(event.details?.after || ''),
    event.comment || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  downloadFile(csvContent, `audit_trail_${sanitizeFilename(entityName)}_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
}

export function exportAllAuditTrailsToCSV(entitiesData: any[]) {
  const headers = ['Entity Name', 'Entity Type', 'Timestamp', 'User', 'Email', 'Event Type', 'Action', 'Alert Name', 'Field', 'Before', 'After', 'Comment'];
  
  const rows: string[][] = [];
  
  entitiesData.forEach(entity => {
    entity.details.auditTrail?.forEach((event: AuditEvent) => {
      rows.push([
        entity.name,
        entity.type,
        event.timestamp,
        event.user.name,
        event.user.email,
        event.type,
        event.action,
        event.alertName || '',
        event.details?.field || '',
        typeof event.details?.before === 'string' ? event.details.before : JSON.stringify(event.details?.before || ''),
        typeof event.details?.after === 'string' ? event.details.after : JSON.stringify(event.details?.after || ''),
        event.comment || ''
      ]);
    });
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  downloadFile(csvContent, `all_audit_trails_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
}

export function exportTableToCSV(data: any[]) {
  const headers = ['Name', 'Type', 'Status', 'Risk Level', 'Exposure', 'Monitoring', '# Hits', '# Decisions', 'Analyst', 'Links'];
  
  const rows = data.map(row => [
    row.name,
    row.type,
    row.status,
    row.riskLevel,
    row.exposure || '',
    row.monitoring ? 'Yes' : 'No',
    row.hits,
    row.decisions,
    row.analyst,
    row.links?.map((l: any) => `${l.type}: ${l.reference}`).join('; ') || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  downloadFile(csvContent, `entities_export_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
}

export async function exportEntityToPDF(entity: any) {
  // Créer le contenu HTML pour le PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Entity Report - ${entity.name}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          color: #0F172A;
        }
        .header {
          border-bottom: 3px solid #0066FF;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          color: #0066FF;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .title {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .subtitle {
          color: #64748B;
          font-size: 14px;
        }
        .section {
          margin: 30px 0;
        }
        .section-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #0066FF;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }
        .info-label {
          font-weight: 600;
          color: #64748B;
        }
        .info-value {
          color: #0F172A;
        }
        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }
        .badge-pending { background: #FEF3C7; color: #92400E; }
        .badge-clear { background: #D1FAE5; color: #065F46; }
        .badge-true-hit { background: #FEE2E2; color: #991B1B; }
        .badge-false-hit { background: #DBEAFE; color: #1E40AF; }
        .badge-high { background: #FEE2E2; color: #991B1B; }
        .badge-low { background: #D1FAE5; color: #065F46; }
        .links-list {
          list-style: none;
          padding: 0;
        }
        .link-item {
          padding: 10px;
          margin: 5px 0;
          background: #F8FAFC;
          border-radius: 6px;
          border-left: 3px solid #0066FF;
        }
        .alerts-list {
          border-left: 2px solid #E2E8F0;
          padding-left: 20px;
        }
        .alert-item {
          margin: 15px 0;
          padding: 15px;
          background: #F8FAFC;
          border-radius: 8px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #E2E8F0;
          text-align: center;
          color: #64748B;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">InvestHub</div>
        <h1 class="title">${entity.name}</h1>
        <div class="subtitle">Entity Compliance Report - Generated on ${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      <div class="section">
        <h2 class="section-title">Entity Information</h2>
        <div class="info-grid">
          <div class="info-label">Name:</div>
          <div class="info-value">${entity.name}</div>
          
          <div class="info-label">Type:</div>
          <div class="info-value">${entity.type}</div>
          
          <div class="info-label">Status:</div>
          <div class="info-value"><span class="badge badge-${entity.status.toLowerCase().replace(' ', '-')}">${entity.status}</span></div>
          
          <div class="info-label">Risk Level:</div>
          <div class="info-value"><span class="badge badge-${entity.riskLevel.toLowerCase()}">${entity.riskLevel}</span></div>
          
          ${entity.exposure ? `
          <div class="info-label">Exposure:</div>
          <div class="info-value">${entity.exposure}</div>
          ` : ''}
          
          <div class="info-label">Monitoring:</div>
          <div class="info-value">${entity.monitoring ? 'Active' : 'Inactive'}</div>
          
          <div class="info-label">Analyst:</div>
          <div class="info-value">${entity.analyst}</div>
          
          <div class="info-label">Hits:</div>
          <div class="info-value">${entity.hits}</div>
          
          <div class="info-label">Decisions:</div>
          <div class="info-value">${entity.decisions}</div>
        </div>
      </div>

      ${entity.links && entity.links.length > 0 ? `
      <div class="section">
        <h2 class="section-title">Related Links</h2>
        <ul class="links-list">
          ${entity.links.map((link: any) => `
            <li class="link-item">
              <strong>${link.reference}</strong> - ${link.type.charAt(0).toUpperCase() + link.type.slice(1)}<br>
              <span style="color: #64748B; font-size: 14px;">${link.name}</span>
              ${link.amount ? `<br><span style="color: #64748B; font-size: 14px;">Amount: ${link.amount}</span>` : ''}
              ${link.percentage ? `<br><span style="color: #64748B; font-size: 14px;">Ownership: ${link.percentage}</span>` : ''}
            </li>
          `).join('')}
        </ul>
      </div>
      ` : ''}

      ${entity.details.alerts && entity.details.alerts.length > 0 ? `
      <div class="section">
        <h2 class="section-title">Alerts (${entity.details.alerts.length})</h2>
        <div class="alerts-list">
          ${entity.details.alerts.map((alert: any) => `
            <div class="alert-item">
              <strong>${alert.name}</strong> - ${alert.similarity}% similarity<br>
              <span style="color: #64748B;">Date: ${alert.date}</span><br>
              ${alert.decision ? `<span class="badge badge-${alert.decision.replace('_', '-')}">${alert.decision.replace('_', ' ').toUpperCase()}</span>` : '<span class="badge badge-pending">PENDING</span>'}
              ${alert.comment ? `<br><br><em>"${alert.comment}"</em>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <div class="footer">
        This report was generated by InvestHub Compliance System<br>
        Confidential - For authorized personnel only
      </div>
    </body>
    </html>
  `;

  // Créer un blob et télécharger
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `entity_report_${sanitizeFilename(entity.name)}_${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

export function exportContactsToCSV(investors: any[]) {
  const headers = [
    'Investor Name',
    'Investor Type', 
    'Contact First Name',
    'Contact Last Name',
    'Function',
    'Email',
    'Phone',
    'Is Primary',
    'Has Portal Access',
    'Access Level',
    'Investor Status',
    'Investor Segment'
  ];
  
  const rows: string[][] = [];
  
  // Parcourir tous les investisseurs et leurs contacts
  investors.forEach(investor => {
    if (investor.contacts && investor.contacts.length > 0) {
      investor.contacts.forEach((contact: any) => {
        rows.push([
          investor.name,
          investor.type,
          contact.firstName,
          contact.lastName,
          contact.function || '',
          contact.email,
          contact.phone,
          contact.isPrimary ? 'Oui' : 'Non',
          contact.hasPortalAccess ? 'Oui' : 'Non',
          contact.accessLevel || 'N/A',
          investor.status,
          investor.crmSegment || ''
        ]);
      });
    }
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  downloadFile(csvContent, `contacts_export_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
}

export function exportPartnerContactsToCSV(partners: any[]) {
  const headers = [
    'Partner Name',
    'Partner Status', 
    'Advisor First Name',
    'Advisor Last Name',
    'Function',
    'Email',
    'Phone',
    'Is Primary',
    'Partner Segment'
  ];
  
  const rows: string[][] = [];
  
  // Parcourir tous les partenaires et leurs conseillers
  partners.forEach(partner => {
    if (partner.contacts && partner.contacts.length > 0) {
      partner.contacts.forEach((contact: any) => {
        rows.push([
          partner.name,
          partner.status,
          contact.firstName || contact.name?.split(' ')[0] || '',
          contact.lastName || contact.name?.split(' ')[1] || '',
          contact.function || contact.role || '',
          contact.email,
          contact.phone,
          contact.isPrimary ? 'Oui' : 'Non',
          partner.segments?.join('; ') || ''
        ]);
      });
    }
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  downloadFile(csvContent, `partner_advisors_export_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
}