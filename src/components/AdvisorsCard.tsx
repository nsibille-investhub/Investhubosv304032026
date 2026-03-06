import { motion } from 'motion/react';
import { Users, ChevronDown, Mail, Phone, Copy, Check, Briefcase, Star, ExternalLink, UserCheck } from 'lucide-react';
import { Badge } from './ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { PartnerContact } from '../utils/partnerGenerator';
import { useState } from 'react';
import { toast } from 'sonner';
import { copyToClipboard } from '../utils/clipboard';
import { LanguageFlag } from './LanguageFlag';

interface AdvisorsCardProps {
  advisors: PartnerContact[];
  partnerName: string;
  partnerId: number;
  searchTerm?: string;
}

export function AdvisorsCard({ 
  advisors, 
  partnerName,
  partnerId,
  searchTerm = ''
}: AdvisorsCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (advisors.length === 0) {
    return (
      <span className="text-xs text-gray-400 italic">Aucun conseiller</span>
    );
  }

  const handleCopy = async (text: string, field: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(field);
      toast.success('Copié !', { description: text });
      setTimeout(() => setCopiedField(null), 2000);
    } else {
      toast.error('Erreur de copie', { description: 'Impossible de copier dans le presse-papier' });
    }
  };

  // Afficher seulement le premier conseiller avec un compteur
  const firstAdvisor = advisors[0];
  const remainingCount = advisors.length - 1;

  // Le premier conseiller est considéré comme principal
  const primaryAdvisor = advisors[0];

  // Vérifier si le conseiller a accès au portail (pour la démo, on donne accès au conseiller principal)
  const hasPortalAccess = (advisor: PartnerContact) => advisor.id === primaryAdvisor.id;

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={(e) => handleCopy(text, field, e)}
      className="p-1 hover:bg-gray-100 rounded transition-colors"
    >
      {copiedField === field ? (
        <Check className="w-3 h-3 text-emerald-600" />
      ) : (
        <Copy className="w-3 h-3 text-gray-400" />
      )}
    </motion.button>
  );

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
              <Users className="w-3 h-3" />
            </span>
            <span className="truncate max-w-[120px] group-hover:underline">
              {firstAdvisor.firstName} {firstAdvisor.lastName}
            </span>
            {firstAdvisor.language && (
              <LanguageFlag language={firstAdvisor.language} size="sm" showTooltip />
            )}
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
        className="w-[480px] p-0" 
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
                className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600"
              >
                <Users className="w-5 h-5" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Conseillers
                </h3>
                <div className="text-xs text-gray-500">
                  {advisors.length} conseiller{advisors.length > 1 ? 's' : ''} • {partnerName}
                </div>
              </div>
            </div>
          </div>

          {/* Liste de tous les conseillers */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
            {advisors.map((advisor, idx) => {
              const isPrimary = idx === 0;
              const hasAccess = hasPortalAccess(advisor);
              
              return (
                <motion.div
                  key={advisor.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-3 rounded-lg transition-colors border ${
                    isPrimary 
                      ? 'bg-indigo-50/50 border-indigo-200' 
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Header avec nom et fonction */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-gray-900 text-sm">
                            {advisor.firstName} {advisor.lastName}
                          </div>
                          {advisor.language && (
                            <LanguageFlag language={advisor.language} size="sm" showTooltip />
                          )}
                          {isPrimary && (
                            <Badge className="bg-indigo-100 text-indigo-700 border-indigo-300 text-xs px-1.5 py-0">
                              <Star className="w-2.5 h-2.5 mr-0.5 fill-indigo-700" />
                              Principal
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Briefcase className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600">{advisor.function}</span>
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-700 truncate">{advisor.email}</span>
                      </div>
                      <CopyButton text={advisor.email} field={`${advisor.id}-email`} />
                    </div>

                    {/* Phone */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-700">{advisor.phone}</span>
                      </div>
                      <CopyButton text={advisor.phone} field={`${advisor.id}-phone`} />
                    </div>

                    {/* Mobile (optionnel) */}
                    {advisor.mobile && (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="text-xs text-gray-700">{advisor.mobile}</span>
                          <Badge variant="outline" className="text-[10px] px-1 py-0">Mobile</Badge>
                        </div>
                        <CopyButton text={advisor.mobile} field={`${advisor.id}-mobile`} />
                      </div>
                    )}

                    {/* Lien vers le portail partenaire */}
                    <div className="pt-1 border-t border-gray-200/50">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (hasAccess) {
                            toast.success(`Ouverture du portail partenaire en tant que ${advisor.firstName} ${advisor.lastName}`);
                            window.open(`/partner-portal?partner=${partnerId}&advisor=${advisor.id}`, '_blank');
                          } else {
                            toast.info(`${advisor.firstName} ${advisor.lastName} n'a pas encore d'accès au portail partenaire`);
                          }
                        }}
                        className={`flex items-center gap-1.5 text-xs transition-colors w-full justify-center py-1.5 px-2 rounded-md ${
                          hasAccess 
                            ? 'text-purple-600 hover:text-purple-700 hover:bg-purple-50' 
                            : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span className="truncate">
                          {hasAccess 
                            ? `Ouvrir le portail en tant que ${advisor.firstName}`
                            : 'Portail partenaire (accès non activé)'
                          }
                        </span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer info */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-500 text-center">
              Cliquez sur <Copy className="w-3 h-3 inline mx-0.5" /> pour copier les coordonnées
            </div>
          </div>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}
