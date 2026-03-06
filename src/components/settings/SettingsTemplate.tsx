import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface SettingsTemplateProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function SettingsTemplate({ title, description, children }: SettingsTemplateProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl mb-2">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="bg-gradient-to-r from-black to-[#0F323D]">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>

        {children || (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">Configuration disponible prochainement</p>
          </div>
        )}
      </div>
    </div>
  );
}
