import { motion } from 'motion/react';
import { ExternalLink, Building2, User, Store, TrendingUp, Globe, Hash, Phone, Mail } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface InfoPopoverProps {
  type: 'investor' | 'structure' | 'partner' | 'fund';
  data: any;
  children: React.ReactNode;
}

export function SubscriptionInfoPopover({ type, data, children }: InfoPopoverProps) {
  if (!data) return <>{children}</>;

  const renderContent = () => {
    switch (type) {
      case 'investor':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                data.type === 'individual' ? 'bg-blue-100' : 'bg-purple-100'
              }`}>
                {data.type === 'individual' ? (
                  <User className="w-5 h-5 text-blue-600" />
                ) : (
                  <Building2 className="w-5 h-5 text-purple-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900">{data.name}</div>
                <Badge variant="outline" className="text-xs mt-1">
                  {data.type === 'individual' ? 'Personne Physique' : 'Personne Morale'}
                </Badge>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs">
                <Hash className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-600">ID :</span>
                <span className="font-medium text-gray-900">{data.id}</span>
              </div>
              {data.country && (
                <div className="flex items-center gap-2 text-xs">
                  <Globe className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-600">Pays :</span>
                  <span className="font-medium text-gray-900">{data.country}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs">
                <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-600">Risque :</span>
                <Badge className={`text-xs h-5 ${
                  data.riskLevel === 'High' ? 'bg-red-100 text-red-700 border-red-200' :
                  data.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                  'bg-emerald-100 text-emerald-700 border-emerald-200'
                }`}>
                  {data.riskLevel}
                </Badge>
              </div>
              {data.kycStatus && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-600">KYC :</span>
                  <Badge variant="outline" className="text-xs h-5">
                    {data.kycStatus === 'validated' ? '✓ Validé' :
                     data.kycStatus === 'in review' ? '⏳ En révision' :
                     data.kycStatus === 'to review' ? '📋 À réviser' : '🔄 En cours'}
                  </Badge>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              Voir la fiche complète
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>
        );

      case 'structure':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900">{data.name || data.structure}</div>
                <Badge variant="outline" className="text-xs mt-1">Structure</Badge>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs">
                <Hash className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-600">ID :</span>
                <span className="font-medium text-gray-900">{data.id}</span>
              </div>
              {data.country && (
                <div className="flex items-center gap-2 text-xs">
                  <Globe className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-600">Pays :</span>
                  <span className="font-medium text-gray-900">{data.country}</span>
                </div>
              )}
              {data.mainContact && (
                <div className="flex items-center gap-2 text-xs">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-600">Contact :</span>
                  <span className="font-medium text-gray-900">{data.mainContact}</span>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              Voir la fiche complète
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>
        );

      case 'partner':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Store className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900">{data.name}</div>
                <Badge variant="outline" className="text-xs mt-1">Distributeur</Badge>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs">
                <Hash className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-600">ID :</span>
                <span className="font-medium text-gray-900">{data.id}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-600">Type :</span>
                <Badge variant="outline" className="text-xs h-5">
                  {data.type === 'corporate' ? 'Corporate' : 'Individual'}
                </Badge>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              Voir la fiche complète
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>
        );

      case 'fund':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900">{data.name}</div>
                <Badge variant="outline" className="text-xs mt-1">Fonds</Badge>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-600">Classe :</span>
                <Badge className="text-xs h-5 bg-blue-100 text-blue-700 border-blue-200">
                  Part {data.shareClass}
                </Badge>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              Voir la fiche complète
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        {renderContent()}
      </PopoverContent>
    </Popover>
  );
}
