import { motion } from 'motion/react';
import { Building2, ChevronRight, ExternalLink, MapPin, Phone, Mail, Users, TrendingUp, Calendar } from 'lucide-react';
import { Badge } from './ui/badge';
import { HighlightText } from './HighlightText';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

interface PartnerCardProps {
  partnerName: string | null;
  searchTerm?: string;
}

export function PartnerCard({ partnerName, searchTerm = '' }: PartnerCardProps) {
  if (!partnerName) {
    return (
      <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 gap-1.5">
        <Users className="w-3 h-3" />
        Direct
      </Badge>
    );
  }

  // Données mockées pour le partenaire
  const partnerData = {
    name: partnerName,
    id: `DIST${Math.floor(Math.random() * 9000) + 1000}`,
    type: 'Distributeur Agréé',
    status: 'Actif',
    category: ['CGPI', 'Family Office', 'Banque Privée'][Math.floor(Math.random() * 3)],
    country: ['France', 'Luxembourg', 'Suisse', 'Belgique'][Math.floor(Math.random() * 4)],
    city: ['Paris', 'Lyon', 'Luxembourg', 'Genève', 'Bruxelles'][Math.floor(Math.random() * 5)],
    contactName: ['Marie Dubois', 'Pierre Martin', 'Sophie Bernard', 'Luc Petit'][Math.floor(Math.random() * 4)],
    email: `contact@${partnerName.toLowerCase().replace(/\s+/g, '')}.com`,
    phone: `+33 1 ${String(Math.floor(Math.random() * 90000000) + 10000000).match(/.{1,2}/g)?.join(' ')}`,
    clientsCount: Math.floor(Math.random() * 150) + 20,
    totalAUM: Math.floor(Math.random() * 50000000) + 5000000,
    partnerSince: new Date(2018 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 12), 1),
    commission: (Math.random() * 2 + 0.5).toFixed(2),
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${year}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Actif':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Inactif':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'Suspendu':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'CGPI': 'bg-blue-50 text-blue-700 border-blue-200',
      'Family Office': 'bg-purple-50 text-purple-700 border-purple-200',
      'Banque Privée': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };
    return colors[category] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-600 transition-colors group"
        >
          <span className="text-gray-400 group-hover:text-blue-500 transition-colors">
            <Building2 className="w-3 h-3" />
          </span>
          <span className="max-w-[150px] truncate group-hover:underline">
            <HighlightText text={partnerName} searchTerm={searchTerm} />
          </span>
          <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[450px] p-0" 
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
                className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600"
              >
                <Building2 className="w-5 h-5" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1 truncate">
                  {partnerData.name}
                </h3>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge className={`text-xs px-2 py-0.5 ${getStatusColor(partnerData.status)}`}>
                    {partnerData.status}
                  </Badge>
                  <Badge className={`text-xs px-2 py-0.5 ${getCategoryColor(partnerData.category)}`}>
                    {partnerData.category}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500">
                  ID: {partnerData.id}
                </div>
              </div>
            </div>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl border border-gray-100">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs text-gray-500">Clients</span>
              </div>
              <span className="font-semibold text-gray-900">{partnerData.clientsCount}</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs text-gray-500">AUM Total</span>
              </div>
              <span className="font-semibold text-gray-900">{formatCurrency(partnerData.totalAUM)}</span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            {/* Localisation */}
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500">Localisation</div>
                <div className="font-medium text-gray-900">
                  {partnerData.city}, {partnerData.country}
                </div>
              </div>
            </div>

            {/* Contact principal */}
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500">Contact principal</div>
                <div className="font-medium text-gray-900">{partnerData.contactName}</div>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500">Email</div>
                <div className="font-medium text-gray-900 text-sm truncate">{partnerData.email}</div>
              </div>
            </div>

            {/* Téléphone */}
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500">Téléphone</div>
                <div className="font-medium text-gray-900">{partnerData.phone}</div>
              </div>
            </div>
          </div>

          {/* Informations commerciales */}
          <div className="space-y-2 pt-3 border-t border-gray-100">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 mb-1">Partenaire depuis</div>
                <Badge className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 border-blue-200">
                  {formatDate(partnerData.partnerSince)}
                </Badge>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 mb-1">Commission</div>
                <Badge className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 border-emerald-200">
                  {partnerData.commission}%
                </Badge>
              </div>
            </div>
          </div>

          {/* Action button */}
          <motion.div 
            className="mt-4 pt-4 border-t border-gray-100"
            whileHover={{ backgroundColor: 'rgba(0,102,255,0.02)' }}
          >
            <motion.button
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                // Navigation vers la fiche distributeur
                console.log('Navigation vers fiche distributeur:', partnerData.id);
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors"
            >
              <span>Voir la fiche distributeur</span>
              <ExternalLink className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}
