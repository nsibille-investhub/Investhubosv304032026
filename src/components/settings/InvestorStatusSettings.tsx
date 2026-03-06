import React, { useState } from 'react';
import { Search, Plus, Users, User } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BaseStatus } from '../../utils/statusSettings';
import { DraggableStatusRow, StatusPanel, DeleteStatusDialog } from './StatusSettingsComponents';

interface InvestorStatus extends BaseStatus {
  investorCount: number;
}

const mockStatuses: InvestorStatus[] = [
  { 
    id: '1', 
    name: 'Prospect',
    translations: { fr: 'Prospect', en: 'Prospect', es: 'Prospecto' },
    color: 'bg-blue-100 text-blue-700 border-blue-200', 
    icon: 'Eye', 
    investorCount: 127, 
    rank: 0,
    count: 127
  },
  { 
    id: '2', 
    name: 'En discussion',
    translations: { fr: 'En discussion', en: 'In Discussion', es: 'En discusión' },
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200', 
    icon: 'Clock', 
    investorCount: 43, 
    rank: 1,
    count: 43
  },
  { 
    id: '3', 
    name: 'En relation',
    translations: { fr: 'En relation', en: 'In Relation', es: 'En relación' },
    color: 'bg-green-100 text-green-700 border-green-200', 
    icon: 'CheckCircle', 
    investorCount: 89, 
    rank: 2,
    count: 89
  },
  { 
    id: '4', 
    name: 'Archivé',
    translations: { fr: 'Archivé', en: 'Archived', es: 'Archivado' },
    color: 'bg-gray-100 text-gray-700 border-gray-200', 
    icon: 'Archive', 
    investorCount: 15, 
    rank: 3,
    count: 15
  }
];

function InvestorStatusSettingsContent() {
  const [statuses, setStatuses] = useState(mockStatuses);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<InvestorStatus | undefined>();
  const [deletingStatus, setDeletingStatus] = useState<InvestorStatus | undefined>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [replacementStatusId, setReplacementStatusId] = useState<string>('');

  const moveStatus = (dragIndex: number, hoverIndex: number) => {
    const newStatuses = [...statuses];
    const draggedStatus = newStatuses[dragIndex];
    newStatuses.splice(dragIndex, 1);
    newStatuses.splice(hoverIndex, 0, draggedStatus);
    
    // Update ranks
    const updatedStatuses = newStatuses.map((status, index) => ({
      ...status,
      rank: index
    }));
    
    setStatuses(updatedStatuses);
  };

  const handleEdit = (status: BaseStatus) => {
    setEditingStatus(status as InvestorStatus);
    setIsPanelOpen(true);
  };

  const handleAdd = () => {
    setEditingStatus(undefined);
    setIsPanelOpen(true);
  };

  const handleSave = (statusData: Omit<BaseStatus, 'id' | 'rank'>) => {
    if (editingStatus) {
      // Edit existing
      setStatuses(statuses.map(s => 
        s.id === editingStatus.id 
          ? { 
              ...s, 
              ...statusData, 
              investorCount: s.investorCount,
              count: s.investorCount 
            }
          : s
      ));
    } else {
      // Add new
      const newStatus: InvestorStatus = {
        id: Date.now().toString(),
        ...statusData,
        investorCount: 0,
        count: 0,
        rank: statuses.length
      };
      setStatuses([...statuses, newStatus]);
    }
    setIsPanelOpen(false);
  };

  const handleDelete = (id: string) => {
    const status = statuses.find(s => s.id === id);
    if (status) {
      setDeletingStatus(status);
      setReplacementStatusId('');
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (deletingStatus && replacementStatusId) {
      // In a real app, we would migrate investors from deletingStatus to replacementStatus
      setStatuses(statuses.filter(s => s.id !== deletingStatus.id).map((s, index) => ({
        ...s,
        rank: index
      })));
      setIsDeleteDialogOpen(false);
      setDeletingStatus(undefined);
      setReplacementStatusId('');
    }
  };

  const filteredStatuses = statuses.filter(status =>
    status.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    status.translations.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    status.translations.es.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalInvestors = statuses.reduce((sum, s) => sum + s.investorCount, 0);

  const availableReplacementStatuses = statuses.filter(s => s.id !== deletingStatus?.id);

  return (
    <div className="flex h-full bg-gray-50">
      {/* Delete Confirmation Dialog */}
      <DeleteStatusDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeletingStatus(undefined);
          setReplacementStatusId('');
        }}
        onConfirm={confirmDelete}
        deletingStatus={deletingStatus}
        replacementStatusId={replacementStatusId}
        setReplacementStatusId={setReplacementStatusId}
        availableStatuses={availableReplacementStatuses}
        itemType="investisseur"
        itemTypePlural="investisseurs"
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="max-w-5xl">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h1 className="text-2xl text-gray-900">Statuts investisseurs</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Gérez les statuts du cycle de vie de vos investisseurs
                  </p>
                </div>
                <Button
                  onClick={handleAdd}
                  style={{
                    background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
                    color: 'white'
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nouveau statut
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total des statuts</p>
                    <p className="text-2xl text-gray-900">{statuses.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total des investisseurs</p>
                    <p className="text-2xl text-gray-900">{totalInvestors}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher un statut..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-sm text-gray-900">
                  {filteredStatuses.length} statut{filteredStatuses.length > 1 ? 's' : ''}
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left p-3 text-xs text-gray-500 w-12"></th>
                      <th className="text-left p-3 text-xs text-gray-500">Statut</th>
                      <th className="text-left p-3 text-xs text-gray-500">Investisseurs</th>
                      <th className="text-right p-3 text-xs text-gray-500 w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStatuses.length > 0 ? (
                      filteredStatuses.map((status, index) => (
                        <DraggableStatusRow
                          key={status.id}
                          status={status}
                          index={index}
                          moveStatus={moveStatus}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          countIcon={Users}
                          countLabel="investisseurs"
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-sm text-gray-500">
                          Aucun statut trouvé
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <StatusPanel
        status={editingStatus}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onSave={handleSave}
        title={editingStatus ? 'Éditer le statut' : 'Nouveau statut'}
        subtitle="Configuration du statut investisseur"
      />
    </div>
  );
}

export function InvestorStatusSettings() {
  return (
    <DndProvider backend={HTML5Backend}>
      <InvestorStatusSettingsContent />
    </DndProvider>
  );
}
