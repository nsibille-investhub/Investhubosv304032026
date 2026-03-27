import { motion } from 'motion/react';
import { User, ChevronDown, Mail, Phone, Copy, Check, Briefcase, Star, ExternalLink, UserCheck } from 'lucide-react';
import { Badge } from './ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Contact } from '../utils/investorGenerator';
import { useState } from 'react';
import { toast } from 'sonner';
import { copyToClipboard } from '../utils/clipboard';

interface ContactsCardProps {
  contacts: Contact[];
  investorName?: string;
  investorEmail?: string;
  investorPhone?: string;
  searchTerm?: string;
  // Props alternatives pour les partenaires
  entityName?: string;
  entityEmail?: string;
  entityPhone?: string;
}

export function ContactsCard({ 
  contacts, 
  investorName, 
  investorEmail, 
  investorPhone, 
  searchTerm = '',
  entityName,
  entityEmail,
  entityPhone
}: ContactsCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (contacts.length === 0) {
    return (
      <span className="text-xs text-gray-400 italic">Aucun contact</span>
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

  // Afficher seulement le premier contact avec un compteur
  const firstContact = contacts[0];
  const remainingCount = contacts.length - 1;

  // Trouver le contact principal
  const primaryContact = contacts.find(c => c.isPrimary) || contacts[0];

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
          <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-primary transition-colors w-full">
            <span className="text-gray-400 group-hover:text-primary transition-colors flex-shrink-0">
              <User className="w-3 h-3" />
            </span>
            <span className="truncate max-w-[120px] group-hover:underline">
              {firstContact.firstName} {firstContact.lastName}
            </span>
          </div>
          {remainingCount > 0 && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1 text-primary transition-colors ml-[18px]"
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
                className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600"
              >
                <User className="w-5 h-5" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Contacts
                </h3>
                <div className="text-xs text-gray-500">
                  {contacts.length} contact{contacts.length > 1 ? 's' : ''} disponible{contacts.length > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Liste de tous les contacts */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
            {contacts.map((contact, idx) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-3 rounded-lg transition-colors border ${
                  contact.isPrimary 
                    ? 'bg-blue-50/50 border-blue-200' 
                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                }`}
              >
                <div className="space-y-2.5">
                  {/* Header avec nom et fonction */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-gray-900 text-sm">
                          {contact.firstName} {contact.lastName}
                        </div>
                        {(contact.isPrimary || idx === 0) && (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs px-1.5 py-0">
                            <Star className="w-2.5 h-2.5 mr-0.5 fill-blue-700" />
                            Principal
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Briefcase className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-600">{contact.function}</span>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-700 truncate">{contact.email}</span>
                    </div>
                    <CopyButton text={contact.email} field={`${contact.id}-email`} />
                  </div>

                  {/* Phone */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-700">{contact.phone}</span>
                    </div>
                    <CopyButton text={contact.phone} field={`${contact.id}-phone`} />
                  </div>

                  {/* Lien vers le portail investisseur */}
                  <div className="pt-1 border-t border-gray-200/50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (contact.hasPortalAccess) {
                          toast.success(`Ouverture du portail en tant que ${contact.firstName} ${contact.lastName}`);
                          window.open(`/portal?impersonate=${contact.id}`, '_blank');
                        } else {
                          toast.info(`${contact.firstName} ${contact.lastName} n'a pas encore d'accès au portail`);
                        }
                      }}
                      className={`flex items-center gap-1.5 text-xs transition-colors w-full justify-center py-1.5 px-2 rounded-md ${
                        contact.hasPortalAccess 
                          ? 'text-purple-600 hover:text-purple-700 hover:bg-purple-50' 
                          : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span className="truncate">
                        {contact.hasPortalAccess 
                          ? `Ouvrir le portail en tant que ${contact.firstName}`
                          : 'Portail investisseur (accès non activé)'
                        }
                      </span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
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
