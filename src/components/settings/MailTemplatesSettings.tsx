import React, { useState } from 'react';
import { Search, Plus, Mail, Copy, Edit, Trash2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface Template {
  id: string;
  name: string;
  subject: string;
  category: string;
  usageCount: number;
  lastModified: string;
}

const mockTemplates: Template[] = [
  { id: '1', name: 'Bienvenue investisseur', subject: 'Bienvenue chez InvestHub', category: 'Onboarding', usageCount: 245, lastModified: '2025-10-15' },
  { id: '2', name: 'Confirmation souscription', subject: 'Confirmation de votre souscription', category: 'Souscription', usageCount: 189, lastModified: '2025-10-20' },
  { id: '3', name: 'Relance documents', subject: 'Documents manquants pour votre dossier', category: 'Relance', usageCount: 156, lastModified: '2025-10-10' },
  { id: '4', name: 'Rappel automatique', subject: 'Rappel: Action requise', category: 'Automatique', usageCount: 432, lastModified: '2025-10-25' }
];

export function MailTemplatesSettings() {
  const [templates] = useState(mockTemplates);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl mb-2">Gabarits des mails</h1>
          <p className="text-gray-600">Gérez les templates d'emails</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un template..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="bg-gradient-to-r from-black to-[#0F323D]">
              <Plus className="w-4 h-4 mr-2" />
              Créer un template
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left p-3 text-sm text-gray-600">Nom</th>
                <th className="text-left p-3 text-sm text-gray-600">Sujet</th>
                <th className="text-left p-3 text-sm text-gray-600">Catégorie</th>
                <th className="text-left p-3 text-sm text-gray-600">Utilisations</th>
                <th className="text-left p-3 text-sm text-gray-600">Dernière modif.</th>
                <th className="w-32"></th>
              </tr>
            </thead>
            <tbody>
              {filteredTemplates.map(template => (
                <tr key={template.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 text-sm">{template.name}</td>
                  <td className="p-3 text-sm text-gray-600">{template.subject}</td>
                  <td className="p-3">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {template.category}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm text-gray-600">{template.usageCount}</td>
                  <td className="p-3 text-sm text-gray-600">
                    {new Date(template.lastModified).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button className="text-gray-400 hover:text-gray-600">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-blue-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
