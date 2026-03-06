import { motion } from 'motion/react';
import { Building2, ChevronDown, FileCheck, Building, Users, FileText, ShieldCheck, AlertTriangle, UserCircle, TrendingUp } from 'lucide-react';
import { Badge } from './ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { LegalStructure } from '../utils/investorGenerator';

interface StructuresCardProps {
  structures: LegalStructure[];
  searchTerm?: string;
}

export function StructuresCard({ structures, searchTerm = '' }: StructuresCardProps) {
  if (structures.length === 0) {
    return (
      <span className="text-xs text-gray-400 italic">Aucune structure</span>
    );
  }

  const getStructureTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'SCI': 'bg-blue-50 text-blue-700 border-blue-200',
      'SARL': 'bg-purple-50 text-purple-700 border-purple-200',
      'SAS': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'SA': 'bg-violet-50 text-violet-700 border-violet-200',
      'Trust': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Foundation': 'bg-amber-50 text-amber-700 border-amber-200',
      'Holding': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    };
    return colors[type] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getStructureIcon = (type: string) => {
    switch (type) {
      case 'Trust':
      case 'Foundation':
        return <FileCheck className="w-4 h-4" />;
      case 'Holding':
        return <Building className="w-4 h-4" />;
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  const getKycStatusColor = (status?: string) => {
    const colors: { [key: string]: string } = {
      'Validé': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'En cours': 'bg-blue-50 text-blue-700 border-blue-200',
      'À revoir': 'bg-amber-50 text-amber-700 border-amber-200',
      'Non commencé': 'bg-gray-50 text-gray-700 border-gray-200',
    };
    return colors[status || 'Non commencé'] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getRiskScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score < 30) return 'text-emerald-600';
    if (score < 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const getRiskScoreIcon = (score?: number) => {
    if (!score) return null;
    if (score < 30) return <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />;
    if (score < 70) return <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
    return <AlertTriangle className="w-3.5 h-3.5 text-red-600" />;
  };

  // Afficher seulement la première structure avec un compteur
  const firstStructure = structures[0];
  const remainingCount = structures.length - 1;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex flex-col items-start gap-1 text-xs group w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors w-full">
            <span className="text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0">
              <Building2 className="w-3 h-3" />
            </span>
            <span className="truncate max-w-[120px] group-hover:underline">
              {firstStructure.name}
            </span>
          </div>
          {remainingCount > 0 && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors ml-[18px]"
            >
              <span className="font-medium">+{remainingCount} more</span>
              <ChevronDown className="w-3 h-3" />
            </motion.div>
          )}
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
                className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600"
              >
                <Building2 className="w-5 h-5" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Structures
                </h3>
                <div className="text-xs text-gray-500">
                  {structures.length} structure{structures.length > 1 ? 's' : ''} légale{structures.length > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Liste des structures */}
          <div className="space-y-3">
            {structures.map((structure, idx) => (
              <motion.div
                key={structure.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-3.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <div className="space-y-2.5">
                  {/* En-tête avec nom et type */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="text-gray-400 flex-shrink-0">
                        {getStructureIcon(structure.type)}
                      </div>
                      <div className="font-medium text-gray-900 text-sm">
                        {structure.name}
                      </div>
                    </div>
                    <Badge className={`text-xs px-2 py-0.5 flex-shrink-0 ${getStructureTypeColor(structure.type)}`}>
                      {structure.type}
                    </Badge>
                  </div>

                  {/* Informations détaillées */}
                  <div className="grid grid-cols-2 gap-2 pl-6">
                    {/* Représentant légal */}
                    {structure.legalRepresentative && (
                      <div className="flex items-center gap-1.5 col-span-2">
                        <UserCircle className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs font-medium text-gray-900">
                          {structure.legalRepresentative}
                        </span>
                      </div>
                    )}

                    {/* Contacts */}
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-600">
                        {structure.contactsCount || 0} contact{(structure.contactsCount || 0) > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Souscriptions */}
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-600">
                        {structure.subscriptionsCount || 0} souscription{(structure.subscriptionsCount || 0) > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Montant total investi */}
                    <div className="flex items-center gap-1.5 col-span-2">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-xs font-semibold text-gray-900">
                        {structure.totalInvested ? `${(structure.totalInvested / 1000000).toFixed(2)} M€` : '0 €'}
                      </span>
                    </div>

                    {/* Statut KYC */}
                    <div className="flex items-center gap-1.5 col-span-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs px-2 py-0.5 ${getKycStatusColor(structure.kycStatus)}`}
                      >
                        KYC: {structure.kycStatus || 'Non commencé'}
                      </Badge>
                    </div>

                    {/* Risk Score */}
                    {structure.riskScore !== undefined && (
                      <div className="flex items-center gap-1.5 col-span-2">
                        {getRiskScoreIcon(structure.riskScore)}
                        <span className={`text-xs font-medium ${getRiskScoreColor(structure.riskScore)}`}>
                          Risk Score: {structure.riskScore}/100
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer info */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-500 text-center">
              Ces structures sont rattachées à cet investisseur
            </div>
          </div>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}