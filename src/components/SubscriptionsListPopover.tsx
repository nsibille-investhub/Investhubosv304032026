import { motion } from 'motion/react';
import { FileText, ChevronRight, ExternalLink, TrendingUp, Calendar, Building2, Briefcase } from 'lucide-react';
import { Badge } from './ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Subscription } from '../utils/subscriptionGenerator';
import { ScrollArea } from './ui/scroll-area';
import { useTranslation } from '../utils/languageContext';

interface SubscriptionsListPopoverProps {
  count: number;
  subscriptions: Subscription[];
  onSubscriptionClick?: (subscription: Subscription) => void;
}

export function SubscriptionsListPopover({ count, subscriptions, onSubscriptionClick }: SubscriptionsListPopoverProps) {
  const { t } = useTranslation();
  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'Draft': 'bg-gray-100 text-gray-700 border-gray-300',
      'Onboarding': 'bg-blue-100 text-blue-700 border-blue-300',
      'À signer': 'bg-purple-100 text-purple-700 border-purple-300',
      'Investisseur signé': 'bg-indigo-100 text-indigo-700 border-indigo-300',
      'Exécuté': 'bg-emerald-100 text-emerald-700 border-emerald-300',
      'En attente de fonds': 'bg-amber-100 text-amber-700 border-amber-300',
      'Active': 'bg-green-100 text-green-700 border-green-300',
      'Rejected': 'bg-red-100 text-red-700 border-red-300',
      'Cancelled': 'bg-orange-100 text-orange-700 border-orange-300',
      'Expired': 'bg-gray-100 text-gray-600 border-gray-300',
      'Archived': 'bg-slate-100 text-slate-700 border-slate-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300';
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
    const day = date.getDate();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 transition-all duration-200 group cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-blue-600 group-hover:text-blue-700 transition-colors" />
          <span className="text-sm font-semibold text-blue-700 group-hover:text-blue-800 transition-colors">
            {count}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-blue-500 group-hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100" />
        </motion.button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[680px] p-0 overflow-hidden" 
        align="start" 
        side="right"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col"
        >
          {/* Header */}
          <div className="px-4 py-2.5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="p-1.5 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600"
                >
                  <FileText className="w-4 h-4" />
                </motion.div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{t('subscriptions.listPopover.title')}</h3>
                  <div className="text-[10px] text-gray-500">
                    {t(count > 1 ? 'subscriptions.listPopover.totalCountMany' : 'subscriptions.listPopover.totalCountOne', { count })}
                  </div>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs px-1.5 py-0">
                {count}
              </Badge>
            </div>
          </div>

          {/* Tableau des souscriptions */}
          {subscriptions.length === 0 ? (
            <div className="p-6 text-center">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">{t('subscriptions.listPopover.noSubscriptions')}</p>
            </div>
          ) : (
            <ScrollArea className="h-[320px]">
              <div className="min-w-full">
                <table className="w-full">
                  <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
                    <tr>
                      <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
                        {t('subscriptions.listPopover.columns.date')}
                      </th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
                        {t('subscriptions.listPopover.columns.capital')}
                      </th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
                        {t('subscriptions.listPopover.columns.fund')}
                      </th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
                        {t('subscriptions.listPopover.columns.share')}
                      </th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
                        {t('subscriptions.listPopover.columns.structure')}
                      </th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
                        {t('subscriptions.listPopover.columns.status')}
                      </th>
                      <th className="px-2 py-1.5 text-center text-[10px] font-semibold text-gray-600 uppercase tracking-wide w-8">
                        
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {subscriptions.map((subscription, idx) => (
                      <motion.tr
                        key={subscription.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.01 }}
                        onClick={() => {
                          if (onSubscriptionClick) {
                            onSubscriptionClick(subscription);
                          }
                        }}
                        className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                      >
                        {/* Date */}
                        <td className="px-2 py-1.5 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-700">
                              {formatDate(subscription.createdDate)}
                            </span>
                          </div>
                        </td>

                        {/* Capital */}
                        <td className="px-2 py-1.5 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                            <span className="text-xs font-semibold text-gray-900">
                              {formatCurrency(subscription.amount)}
                            </span>
                          </div>
                        </td>

                        {/* Fonds */}
                        <td className="px-2 py-1.5">
                          <div className="max-w-[140px]">
                            <div className="text-xs font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                              {subscription.product || 'N/A'}
                            </div>
                            <div className="text-[10px] text-gray-500 truncate">
                              #{subscription.id}
                            </div>
                          </div>
                        </td>

                        {/* Part (Share Class) */}
                        <td className="px-2 py-1.5">
                          <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] px-1.5 py-0">
                            <Briefcase className="w-2.5 h-2.5 mr-0.5" />
                            {subscription.shareClass || 'A'}
                          </Badge>
                        </td>

                        {/* Structure */}
                        <td className="px-2 py-1.5">
                          {subscription.structure ? (
                            <div className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-indigo-600 flex-shrink-0" />
                              <span className="text-xs text-gray-700 truncate max-w-[90px]">
                                {subscription.structure}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">{t('subscriptions.listPopover.direct')}</span>
                          )}
                        </td>

                        {/* Statut */}
                        <td className="px-2 py-1.5">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getStatusColor(subscription.status)}`}>
                            {subscription.status}
                          </Badge>
                        </td>

                        {/* Action */}
                        <td className="px-2 py-1.5 text-center">
                          <motion.div
                            whileHover={{ scale: 1.1, x: 1 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex p-1 rounded-md bg-white group-hover:bg-blue-100 border border-transparent group-hover:border-blue-300 transition-all"
                          >
                            <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
                          </motion.div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          )}

          {/* Footer */}
          {subscriptions.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] text-gray-500">
                  <span>{t(count > 1 ? 'subscriptions.listPopover.countMany' : 'subscriptions.listPopover.countOne', { count })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-500">{t('subscriptions.listPopover.totalInvested')}</span>
                  <span className="text-xs font-bold text-gray-900">
                    {formatCurrency(subscriptions.reduce((sum, s) => sum + s.amount, 0))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}
