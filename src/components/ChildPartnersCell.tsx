import { motion } from 'motion/react';
import { Building2, ChevronDown, FileText, Users, TrendingUp, ShieldCheck, AlertTriangle, UserCircle, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Partner } from '../utils/partnerGenerator';
import { HighlightText } from './HighlightText';

interface ChildPartnersCellProps {
  childPartners: Partner[];
  searchTerm?: string;
}

export function ChildPartnersCell({ childPartners, searchTerm = '' }: ChildPartnersCellProps) {
  if (childPartners.length === 0) {
    return (
      <span className="text-xs text-gray-400 italic">Aucun enfant</span>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'Actif': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'En cours d\'agrément': 'bg-blue-50 text-blue-700 border-blue-200',
      'Inactif': 'bg-gray-50 text-gray-700 border-gray-200',
      'Suspendu': 'bg-amber-50 text-amber-700 border-amber-200',
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  // Afficher seulement le premier enfant avec un compteur
  const firstChild = childPartners[0];
  const remainingCount = childPartners.length - 1;

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
              {firstChild.name}
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
          className="p-5 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scrollbar-track-transparent"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4 sticky top-0 bg-white z-10 pb-2">
            <div className="flex items-start gap-3 flex-1">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="p-2.5 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 text-purple-600"
              >
                <Building2 className="w-5 h-5" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Partenaires enfants
                </h3>
                <div className="text-xs text-gray-500">
                  {childPartners.length} partenaire{childPartners.length > 1 ? 's' : ''} enfant{childPartners.length > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Liste des enfants */}
          <div className="space-y-3 pr-2">
            {childPartners.map((child, idx) => (
              <motion.div
                key={child.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <div className="flex items-start gap-2.5">
                  <div className="text-gray-400 mt-0.5 flex-shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="font-medium text-gray-900 text-sm truncate">
                        <HighlightText 
                          text={child.name} 
                          searchTerm={searchTerm}
                        />
                      </div>
                      <Badge className={`text-xs px-2 py-0.5 flex-shrink-0 ${getStatusColor(child.status)}`}>
                        {child.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {/* Responsable principal */}
                      {child.analyst && (
                        <div className="flex items-center gap-1.5 col-span-2">
                          <UserCircle className="w-3.5 h-3.5 text-purple-600" />
                          <span className="text-xs font-medium text-gray-900">
                            {child.analyst}
                          </span>
                        </div>
                      )}

                      {/* Investisseurs */}
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-600">
                          {child.activeInvestors || 0} investisseur{(child.activeInvestors || 0) > 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Souscriptions */}
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-600">
                          {child.subscriptionsCount || 0} souscription{(child.subscriptionsCount || 0) > 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Montant total levé */}
                      <div className="flex items-center gap-1.5 col-span-2">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-xs font-semibold text-gray-900">
                          {child.totalVolumeGenerated ? `${(child.totalVolumeGenerated / 1000000).toFixed(2)} M€` : '0 €'}
                        </span>
                      </div>

                      {/* Statut KYC */}
                      {child.contractStatus && (
                        <div className="flex items-center gap-1.5 col-span-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs px-2 py-0.5 ${
                              child.contractStatus === 'Signé' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              child.contractStatus === 'En attente' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              child.contractStatus === 'À relancer' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              child.contractStatus === 'Expiré' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-gray-50 text-gray-700 border-gray-200'
                            }`}
                          >
                            KYC: {child.contractStatus}
                          </Badge>
                        </div>
                      )}

                      {/* Statut de distribution */}
                      <div className="flex items-center gap-1.5 col-span-2">
                        {child.status === 'Actif' ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-xs font-medium text-emerald-600">
                              Distribution active
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs font-medium text-gray-500">
                              Distribution inactive
                            </span>
                          </>
                        )}
                      </div>

                      {/* Risk Score */}
                      {child.commissionRate !== undefined && (
                        <div className="flex items-center gap-1.5 col-span-2">
                          {child.commissionRate < 1 ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          ) : child.commissionRate < 2.5 ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                          )}
                          <span className={`text-xs font-medium ${
                            child.commissionRate < 1 ? 'text-emerald-600' :
                            child.commissionRate < 2.5 ? 'text-amber-600' :
                            'text-red-600'
                          }`}>
                            Score de risque : {Math.round(child.commissionRate * 30)}/100
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}