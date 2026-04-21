import { useState } from 'react';
import { motion } from 'motion/react';
import { Badge } from './ui/badge';
import { XCircle, Ban, Clock, Archive } from 'lucide-react';
import { useTranslation } from '../utils/languageContext';

type InactiveStatus = 'rejected' | 'cancelled' | 'expired' | 'archived' | 'all';

interface InactiveSubscriptionTabsProps {
  data: any[];
  activeStatus: string;
  onStatusChange: (status: InactiveStatus) => void;
}

interface StatusKPIs {
  total: number;
  totalAmount: number;
  avgAmount: number;
}

export function InactiveSubscriptionTabs({ data, activeStatus, onStatusChange }: InactiveSubscriptionTabsProps) {
  const { t } = useTranslation();

  const calculateKPIs = (filteredData: any[]): StatusKPIs => {
    const total = filteredData.length;
    const totalAmount = filteredData.reduce((sum, s) => sum + (s.amount || 0), 0);
    const avgAmount = total > 0 ? totalAmount / total : 0;
    
    return {
      total,
      totalAmount,
      avgAmount,
    };
  };

  const formatAmount = (amount: number): string => {
    if (amount >= 1000000) {
      return `€${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `€${(amount / 1000).toFixed(0)}K`;
    }
    return `€${amount}`;
  };

  // Filtrer les données selon le statut
  const getFilteredData = (status: InactiveStatus) => {
    if (status === 'all') return data;
    
    const statusMap: { [key: string]: string } = {
      'rejected': 'Rejected',
      'cancelled': 'Cancelled',
      'expired': 'Expired',
      'archived': 'Archived'
    };
    
    return data.filter(s => s.status === statusMap[status]);
  };

  const rejectedKPIs = calculateKPIs(getFilteredData('rejected'));
  const cancelledKPIs = calculateKPIs(getFilteredData('cancelled'));
  const expiredKPIs = calculateKPIs(getFilteredData('expired'));
  const archivedKPIs = calculateKPIs(getFilteredData('archived'));
  const allKPIs = calculateKPIs(getFilteredData('all'));

  const StatusCard = ({ 
    status, 
    label, 
    description,
    icon: Icon, 
    kpis, 
    gradient,
    bgColor,
    borderColor,
    textColor
  }: { 
    status: InactiveStatus; 
    label: string; 
    description: string;
    icon: any; 
    kpis: StatusKPIs;
    gradient: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
  }) => {
    const isActive = activeStatus === status;
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();
      
      setRipples(prev => [...prev, { x, y, id }]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, 600);
      
      onStatusChange(status);
    };

    return (
      <motion.button
        onClick={handleClick}
        whileHover={{ y: -2, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className={`relative p-4 rounded-2xl border-2 transition-all duration-300 overflow-hidden group ${
          isActive 
            ? `${borderColor} ${bgColor} shadow-lg` 
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
        }`}
      >
        {/* Ripple effects */}
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            className={`absolute rounded-full ${gradient} opacity-30`}
            style={{
              left: ripple.x,
              top: ripple.y,
            }}
            initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
            animate={{ width: 300, height: 300, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        ))}
        
        {/* Top border indicator when active */}
        {isActive && (
          <motion.div
            layoutId="activeInactiveStatusIndicator"
            className={`absolute top-0 left-0 right-0 h-1.5 ${gradient} rounded-t-xl`}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ 
              type: 'spring', 
              stiffness: 400, 
              damping: 25,
            }}
          />
        )}

        {/* Header with icon and count */}
        <div className="flex items-center justify-between mb-2">
          <div className={`p-1.5 rounded-lg ${isActive ? bgColor : 'bg-gray-100 group-hover:bg-gray-200'} transition-colors`}>
            <Icon className={`w-4 h-4 ${isActive ? textColor : 'text-gray-600'}`} />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`px-2 py-0.5 rounded-lg text-xs ${isActive ? gradient + ' text-white' : 'bg-gray-100 text-gray-700'} font-semibold`}
          >
            {kpis.total}
          </motion.div>
        </div>

        {/* Label */}
        <div className="mb-2">
          <span className={`text-xs font-semibold ${isActive ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'} block leading-tight`}>
            {label}
          </span>
          <span className="text-[10px] text-gray-500 block mt-0.5 leading-tight">
            {description}
          </span>
        </div>

        {/* KPIs */}
        <div className="space-y-1 text-left">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[10px] text-gray-500 uppercase tracking-wide">{t('subscriptions.inactiveTabs.total')}</span>
            <span className={`text-xs font-semibold ${isActive ? textColor : 'text-gray-700'}`}>
              {formatAmount(kpis.totalAmount)}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[10px] text-gray-500 uppercase tracking-wide">{t('subscriptions.inactiveTabs.average')}</span>
            <span className={`text-xs font-medium ${isActive ? 'text-gray-700' : 'text-gray-600'}`}>
              {formatAmount(kpis.avgAmount)}
            </span>
          </div>
        </div>

        {/* Active indicator pulse */}
        {isActive && (
          <motion.div
            className={`absolute top-3 right-3 w-2 h-2 rounded-full ${gradient}`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.6, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.button>
    );
  };

  return (
    <div className="grid grid-cols-5 gap-4 mb-6">
      <StatusCard
        status="rejected"
        label={t('subscriptions.inactiveTabs.rejected')}
        description={t('subscriptions.inactiveTabs.rejectedDesc')}
        icon={XCircle}
        kpis={rejectedKPIs}
        gradient="bg-gradient-to-r from-red-500 to-rose-500"
        bgColor="bg-red-50"
        borderColor="border-red-300"
        textColor="text-red-600"
      />

      <StatusCard
        status="cancelled"
        label={t('subscriptions.inactiveTabs.cancelled')}
        description={t('subscriptions.inactiveTabs.cancelledDesc')}
        icon={Ban}
        kpis={cancelledKPIs}
        gradient="bg-gradient-to-r from-orange-500 to-amber-500"
        bgColor="bg-orange-50"
        borderColor="border-orange-300"
        textColor="text-orange-600"
      />

      <StatusCard
        status="expired"
        label={t('subscriptions.inactiveTabs.expired')}
        description={t('subscriptions.inactiveTabs.expiredDesc')}
        icon={Clock}
        kpis={expiredKPIs}
        gradient="bg-gradient-to-r from-rose-500 to-pink-500"
        bgColor="bg-rose-50"
        borderColor="border-rose-300"
        textColor="text-rose-600"
      />

      <StatusCard
        status="archived"
        label={t('subscriptions.inactiveTabs.archived')}
        description={t('subscriptions.inactiveTabs.archivedDesc')}
        icon={Archive}
        kpis={archivedKPIs}
        gradient="bg-gradient-to-r from-slate-500 to-gray-500"
        bgColor="bg-slate-50"
        borderColor="border-slate-300"
        textColor="text-slate-600"
      />

      <StatusCard
        status="all"
        label={t('subscriptions.inactiveTabs.all')}
        description={t('subscriptions.inactiveTabs.allDesc')}
        icon={Archive}
        kpis={allKPIs}
        gradient="bg-gradient-to-r from-red-600 to-rose-600"
        bgColor="bg-red-50"
        borderColor="border-red-400"
        textColor="text-red-700"
      />
    </div>
  );
}
