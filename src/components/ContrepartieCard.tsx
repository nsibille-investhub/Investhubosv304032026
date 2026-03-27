import { motion } from 'motion/react';
import { Building2, User, MapPin, Shield, ChevronRight, ExternalLink, FileCheck, Users } from 'lucide-react';
import { Badge } from './ui/badge';
import { HighlightText } from './HighlightText';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

interface ContrepartieProps {
  contrepartie: {
    name: string;
    id: string;
    type: 'individual' | 'corporate';
    // Pour Corporate
    structure?: string;
    investor?: string;
    investorType?: 'corporate' | 'individual';
    mainContact?: string;
    // Commun
    country?: string;
    riskLevel?: string;
    kycStatus: 'in progress' | 'in review' | 'to review' | 'validated';
    crmSegments: string[];
  };
  searchTerm?: string;
}

export function ContrepartieCard({ contrepartie, searchTerm = '' }: ContrepartieProps) {
  const getIcon = () => {
    return contrepartie.type === 'individual' ? (
      <User className="w-3 h-3" />
    ) : (
      <Building2 className="w-3 h-3" />
    );
  };

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'High':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'validated':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'in review':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'to review':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'in progress':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getSegmentColor = (segment: string) => {
    const colors: { [key: string]: string } = {
      'HNWI': 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border-yellow-200',
      'UHNWI': 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-200',
      'Institutional': 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200',
      'Family Office': 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200',
      'Corporate': 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-gray-200',
      'Retail': 'bg-gradient-to-r from-cyan-50 to-sky-50 text-cyan-700 border-cyan-200',
      'Professional': 'bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 border-indigo-200',
      'VIP': 'bg-gradient-to-r from-rose-50 to-red-50 text-rose-700 border-rose-200',
      'Strategic': 'bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 border-violet-200'
    };
    return colors[segment] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  // Nom à afficher : pour Corporate c'est la structure, pour Individual c'est le nom
  const displayName = contrepartie.type === 'corporate' ? contrepartie.structure : contrepartie.name;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-primary transition-colors group"
        >
          <span className="text-gray-400 group-hover:text-primary transition-colors">
            {getIcon()}
          </span>
          <span className="max-w-[150px] truncate group-hover:underline">
            <HighlightText text={displayName || ''} searchTerm={searchTerm} />
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
                className={`p-2.5 rounded-xl ${
                  contrepartie.type === 'individual' 
                    ? 'bg-gradient-to-br from-purple-50 to-indigo-50 text-purple-600' 
                    : 'bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600'
                }`}
              >
                {contrepartie.type === 'individual' ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Building2 className="w-5 h-5" />
                )}
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1 truncate">
                  {displayName}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`text-xs px-2 py-0.5 ${
                    contrepartie.type === 'individual' 
                      ? 'bg-purple-50 text-purple-700 border-purple-200' 
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {contrepartie.type === 'individual' ? 'Individual' : 'Corporate'}
                  </Badge>
                  {contrepartie.riskLevel && (
                    <Badge className={`text-xs px-2 py-0.5 ${getRiskColor(contrepartie.riskLevel)}`}>
                      <Shield className="w-3 h-3 mr-1" />
                      {contrepartie.riskLevel} Risk
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  ID: {contrepartie.id}
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            {contrepartie.type === 'corporate' ? (
              // Affichage pour Corporate
              <>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500">Structure souscriptrice</div>
                      <div className="font-medium text-gray-900 truncate">{contrepartie.structure}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    {contrepartie.investorType === 'corporate' ? (
                      <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500">Investisseur</div>
                      <div className="font-medium text-gray-900 truncate">{contrepartie.investor}</div>
                      <Badge className="mt-1 text-xs px-1.5 py-0 bg-gray-100 text-gray-600 border-gray-200">
                        {contrepartie.investorType === 'corporate' ? 'Entreprise' : 'Personne physique'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500">Contact principal</div>
                      <div className="font-medium text-gray-900 truncate">{contrepartie.mainContact}</div>
                      <Badge className="mt-1 text-xs px-1.5 py-0 bg-gray-100 text-gray-600 border-gray-200">
                        Personne physique
                      </Badge>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Affichage pour Individual
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500">Investisseur</div>
                  <div className="font-medium text-gray-900 truncate">{contrepartie.name}</div>
                </div>
              </div>
            )}

            {/* Country */}
            {contrepartie.country && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div className="text-sm text-gray-700">{contrepartie.country}</div>
              </div>
            )}
          </div>

          {/* KYC Status & Risk Level */}
          <div className="space-y-2 pt-3 border-t border-gray-100">
            <div className="flex items-start gap-2">
              <FileCheck className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 mb-1.5">KYC Status</div>
                <Badge className={`text-xs px-2.5 py-1 capitalize ${getKycStatusColor(contrepartie.kycStatus)}`}>
                  {contrepartie.kycStatus}
                </Badge>
              </div>
            </div>

            {contrepartie.riskLevel && (
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-1.5">Risk Level</div>
                  <Badge className={`text-xs px-2.5 py-1 ${getRiskColor(contrepartie.riskLevel)}`}>
                    {contrepartie.riskLevel}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* CRM Segments */}
          {contrepartie.crmSegments.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">CRM Segments</div>
                  <div className="flex flex-wrap gap-1.5">
                    {contrepartie.crmSegments.map((segment, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Badge className={`text-xs px-2.5 py-1 ${getSegmentColor(segment)}`}>
                          {segment}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

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
              <span>View full profile</span>
              <ExternalLink className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}
