import React, { useState } from 'react';
import { Search, Plus, Mail, Shield, MoreVertical } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  team: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
}

const mockUsers: User[] = [
  { id: '1', name: 'Sophie Dubois', email: 'sophie.dubois@investhub.com', role: 'Admin', team: 'Compliance', status: 'active', lastLogin: '2025-10-28' },
  { id: '2', name: 'Marc Lefebvre', email: 'marc.lefebvre@investhub.com', role: 'Analyste', team: 'KYC', status: 'active', lastLogin: '2025-10-27' },
  { id: '3', name: 'Julie Martin', email: 'julie.martin@investhub.com', role: 'Gestionnaire', team: 'Souscriptions', status: 'active', lastLogin: '2025-10-28' },
  { id: '4', name: 'Thomas Bernard', email: 'thomas.bernard@investhub.com', role: 'Analyste', team: 'Compliance', status: 'inactive', lastLogin: '2025-10-15' }
];

export function UsersSettings() {
  const [users] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl mb-2">Utilisateurs</h1>
          <p className="text-gray-600">Gérez les utilisateurs de la plateforme</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un utilisateur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="bg-gradient-to-r from-black to-[#0F323D]">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un utilisateur
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left p-3 text-sm text-gray-600">Utilisateur</th>
                <th className="text-left p-3 text-sm text-gray-600">Rôle</th>
                <th className="text-left p-3 text-sm text-gray-600">Équipe</th>
                <th className="text-left p-3 text-sm text-gray-600">Statut</th>
                <th className="text-left p-3 text-sm text-gray-600">Dernière connexion</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-gradient-to-r from-black to-[#0F323D] text-white">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {user.role}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm text-gray-600">{user.team}</td>
                  <td className="p-3">
                    <Badge variant="outline" className={user.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}>
                      {user.status === 'active' ? 'Actif' : 'Inactif'}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td className="p-3">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
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
