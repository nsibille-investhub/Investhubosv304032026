import React, { useState } from 'react';
import { Search, Plus, Trash2, GripVertical } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface DealType {
  id: string;
  name: string;
  description: string;
  order: number;
}

const mockTypes: DealType[] = [
  { id: '1', name: 'Equity', description: 'Investissement en capital', order: 0 },
  { id: '2', name: 'Debt', description: 'Prêt obligataire', order: 10 },
  { id: '3', name: 'Convertible', description: 'Note convertible', order: 20 },
  { id: '4', name: 'SAFE', description: 'Simple Agreement for Future Equity', order: 30 }
];

export function DealTypesSettings() {
  const [types, setTypes] = useState(mockTypes);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeDescription, setNewTypeDescription] = useState('');
  const [newTypeOrder, setNewTypeOrder] = useState('');

  const handleAddType = () => {
    if (!newTypeName.trim()) return;
    
    const newType: DealType = {
      id: Date.now().toString(),
      name: newTypeName,
      description: newTypeDescription,
      order: parseInt(newTypeOrder) || 0
    };
    
    setTypes([...types, newType].sort((a, b) => a.order - b.order));
    setNewTypeName('');
    setNewTypeDescription('');
    setNewTypeOrder('');
  };

  const handleDeleteType = (id: string) => {
    setTypes(types.filter(type => type.id !== id));
  };

  const filteredTypes = types.filter(type =>
    type.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full bg-gray-50">
      <div className="flex-1 p-6">
        <div className="max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl mb-6">Types de deals</h1>
            
            <div className="relative max-w-xs mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Recherche..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-sm">Types de deals</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left p-3 text-sm text-gray-600">Nom</th>
                    <th className="text-left p-3 text-sm text-gray-600">Description</th>
                    <th className="text-left p-3 text-sm text-gray-600">Ordre</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTypes.map(type => (
                    <tr key={type.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                          <span className="text-sm">{type.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-gray-600">{type.description}</td>
                      <td className="p-3 text-sm text-gray-600">{type.order}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDeleteType(type.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="w-80 bg-white border-l border-gray-200 p-6">
        <h2 className="text-sm mb-4">Ajouter un type</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Nom</label>
            <Input
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              placeholder="Nom du type"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Description</label>
            <Input
              value={newTypeDescription}
              onChange={(e) => setNewTypeDescription(e.target.value)}
              placeholder="Description"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Ordre</label>
            <Input
              type="number"
              value={newTypeOrder}
              onChange={(e) => setNewTypeOrder(e.target.value)}
              placeholder="0"
            />
          </div>

          <Button
            onClick={handleAddType}
            disabled={!newTypeName.trim()}
            className="w-full bg-[#4ADE80] hover:bg-[#3FC972] text-gray-900"
          >
            Valider
          </Button>
        </div>
      </div>
    </div>
  );
}
