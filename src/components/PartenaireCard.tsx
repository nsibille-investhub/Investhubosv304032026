import { motion } from 'motion/react';
import { Building2, ChevronRight, ExternalLink, Briefcase, Award } from 'lucide-react';
import { Badge } from './ui/badge';
import { HighlightText } from './HighlightText';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

interface PartenaireProps {
  partenaire: {
    name: string;
    id: string;
    type: 'corporate';
  };
  searchTerm?: string;
}

export function PartenaireCard({ partenaire, searchTerm = '' }: PartenaireProps) {
  // Générer des données mock enrichies pour la présentation
  const enrichedData = {
    ...partenaire,
    category: 'Cabinet CGP',
    status: 'Active Partner',
    partnerSince: '2019',
    totalSubscriptions: Math.floor(Math.random() * 150) + 50,
    activeClients: Math.floor(Math.random() * 80) + 20
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-600 transition-colors group"
        >
          <span className="text-gray-400 group-hover:text-blue-500 transition-colors">
            <Building2 className="w-3 h-3" />
          </span>
          <span className="max-w-[150px] truncate group-hover:underline">
            <HighlightText text={partenaire.name} searchTerm={searchTerm} />
          </span>
          <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-96 p-0" 
        align="start" 
        side="right"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600"
              >
                <Briefcase className="w-5 h-5" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1 truncate">
                  {partenaire.name}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 border-emerald-200">
                    {enrichedData.category}
                  </Badge>
                  <Badge className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
                    <Award className="w-3 h-3 mr-1" />
                    {enrichedData.status}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500">
                  ID: {partenaire.id}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100"
            >
              <div className="text-xs text-blue-600 mb-1">Total Souscriptions</div>
              <div className="text-xl font-semibold text-blue-900">{enrichedData.totalSubscriptions}</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-3 border border-emerald-100"
            >
              <div className="text-xs text-emerald-600 mb-1">Clients actifs</div>
              <div className="text-xl font-semibold text-emerald-900">{enrichedData.activeClients}</div>
            </motion.div>
          </div>

          {/* Details */}
          <div className="space-y-2 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Partenaire depuis</span>
              <span className="font-medium text-gray-900">{enrichedData.partnerSince}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Type</span>
              <span className="font-medium text-gray-900">Distributeur</span>
            </div>
          </div>

          {/* Actions */}
          <motion.div 
            className="mt-4 pt-4 border-t border-gray-100"
            whileHover={{ backgroundColor: 'rgba(0,102,255,0.02)' }}
          >
            <motion.button
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors"
            >
              <span>View partner profile</span>
              <ExternalLink className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}