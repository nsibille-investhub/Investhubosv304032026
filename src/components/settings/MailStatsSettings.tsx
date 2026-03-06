import React from 'react';
import { Mail, Send, Eye, MousePointerClick, TrendingUp } from 'lucide-react';
import { Card } from '../ui/card';

export function MailStatsSettings() {
  const stats = [
    { label: 'Emails envoyés (30j)', value: '12,456', icon: Send, trend: '+12%', color: 'blue' },
    { label: 'Taux de délivrabilité', value: '98.5%', icon: Mail, trend: '+0.5%', color: 'green' },
    { label: 'Taux d\'ouverture', value: '42.3%', icon: Eye, trend: '+3.2%', color: 'purple' },
    { label: 'Taux de clic', value: '15.8%', icon: MousePointerClick, trend: '+1.8%', color: 'orange' }
  ];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl mb-2">Statistiques des mails</h1>
          <p className="text-gray-600">Analysez les performances de vos campagnes email</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    {stat.trend}
                  </div>
                </div>
                <div className="text-2xl mb-1">{stat.value}</div>
                <div className="text-xs text-gray-600">{stat.label}</div>
              </Card>
            );
          })}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-sm mb-4">Performance par template (30 derniers jours)</h2>
          
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left p-3 text-sm text-gray-600">Template</th>
                <th className="text-right p-3 text-sm text-gray-600">Envois</th>
                <th className="text-right p-3 text-sm text-gray-600">Délivrés</th>
                <th className="text-right p-3 text-sm text-gray-600">Ouverts</th>
                <th className="text-right p-3 text-sm text-gray-600">Clics</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="p-3 text-sm">Bienvenue investisseur</td>
                <td className="p-3 text-sm text-right">245</td>
                <td className="p-3 text-sm text-right">242 (98.8%)</td>
                <td className="p-3 text-sm text-right">124 (51.2%)</td>
                <td className="p-3 text-sm text-right">45 (18.6%)</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-3 text-sm">Confirmation souscription</td>
                <td className="p-3 text-sm text-right">189</td>
                <td className="p-3 text-sm text-right">187 (99.0%)</td>
                <td className="p-3 text-sm text-right">98 (52.4%)</td>
                <td className="p-3 text-sm text-right">32 (17.1%)</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-3 text-sm">Relance documents</td>
                <td className="p-3 text-sm text-right">156</td>
                <td className="p-3 text-sm text-right">154 (98.7%)</td>
                <td className="p-3 text-sm text-right">67 (43.5%)</td>
                <td className="p-3 text-sm text-right">28 (18.2%)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
