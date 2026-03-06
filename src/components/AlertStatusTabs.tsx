import { useState } from 'react';
import { motion } from 'motion/react';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle2, List, XCircle } from 'lucide-react';
import { AlertItem } from '../utils/alertsGenerator';

type AlertStatus = 'pending' | 'confirmed' | 'rejected' | 'all';

interface AlertStatusTabsProps {
  data: AlertItem[];
  activeStatus: AlertStatus;
  onStatusChange: (status: AlertStatus) => void;
}

interface StatusKPIs {
  total: number;
  highMatch: number;
  newChanges: number;
  averageMatch: number;
  highMatchPercent: number;
}

export function AlertStatusTabs({ data, activeStatus, onStatusChange }: AlertStatusTabsProps) {
  
  const calculateKPIs = (filteredData: AlertItem[]): StatusKPIs => {
    const total = filteredData.length;
    const highMatch = filteredData.filter(a => a.match >= 80).length;
    const newChanges = filteredData.filter(a => a.changes === 'New').length;
    const averageMatch = total > 0 ? Math.round(filteredData.reduce((sum, a) => sum + a.match, 0) / total) : 0;
    
    return {
      total,
      highMatch,
      newChanges,
      averageMatch,
      highMatchPercent: total > 0 ? Math.round((highMatch / total) * 100) : 0,
    };
  };

  const getFilteredData = (status: AlertStatus): AlertItem[] => {
    switch (status) {
      case 'pending':
        return data.filter(a => a.status === 'Pending');
      case 'confirmed':
        return data.filter(a => a.status === 'Confirmed');
      case 'rejected':
        return data.filter(a => a.status === 'Rejected');
      case 'all':
      default:
        return data;
    }
  };

  const pendingKPIs = calculateKPIs(getFilteredData('pending'));
  const confirmedKPIs = calculateKPIs(getFilteredData('confirmed'));
  const rejectedKPIs = calculateKPIs(getFilteredData('rejected'));
  const allKPIs = calculateKPIs(getFilteredData('all'));

  const StatusCard = ({ 
    status, 
    label, 
    icon: Icon, 
    kpis, 
    gradient,
    textColor,
    borderColor,
    hoverBg 
  }: { 
    status: AlertStatus; 
    label: string; 
    icon: any; 
    kpis: StatusKPIs;
    gradient: string;
    textColor: string;
    borderColor: string;
    hoverBg: string;
  }) => {
    const isActive = activeStatus === status;
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();
      
      setRipples([...ripples, { x, y, id }]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, 600);
      
      onStatusChange(status);
    };
    
    return (
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`relative flex-1 p-5 rounded-xl border-2 transition-all duration-300 text-left group overflow-hidden ${
          isActive
            ? `${borderColor} bg-white shadow-lg`
            : `border-gray-200 bg-white/60 hover:bg-white hover:border-gray-300 hover:shadow-md`
        }`}
      >
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            className={`absolute rounded-full ${gradient} opacity-30`}
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 0,
              height: 0,
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ width: 0, height: 0, opacity: 0.3 }}
            animate={{ 
              width: 400, 
              height: 400, 
              opacity: 0 
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
        
        {!isActive && (
          <motion.div
            className={`absolute top-0 left-0 right-0 h-0.5 ${gradient} opacity-0 group-hover:opacity-100 rounded-t-xl`}
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        )}
        
        {isActive && (
          <motion.div
            layoutId="activeStatusIndicator"
            className="absolute top-0 left-0 right-0 h-1.5 rounded-t-xl overflow-hidden"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ 
              type: 'spring', 
              stiffness: 400, 
              damping: 25,
              mass: 0.8
            }}
          >
            <motion.div 
              className={`absolute inset-0 ${gradient}`}
              animate={{ opacity: [1, 0.9, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'linear', repeatDelay: 1.5 }}
            />
          </motion.div>
        )}

        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${isActive ? hoverBg : 'bg-gray-100 group-hover:bg-gray-200'} transition-colors`}>
              <Icon className={`w-4 h-4 ${isActive ? textColor : 'text-gray-600'}`} />
            </div>
            <span className={`font-semibold ${isActive ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
              {label}
            </span>
          </div>
          <div
            className={`px-2.5 py-1 rounded-lg ${isActive ? gradient : 'bg-gray-100'} ${isActive ? 'text-white' : 'text-gray-700'} font-semibold transition-all duration-300`}
          >
            {kpis.total}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="text-xs text-gray-500">High Match</div>
            <div className={`flex items-baseline gap-1 ${isActive ? textColor : 'text-gray-900'}`}>
              <span className="text-lg font-bold">{kpis.highMatchPercent}%</span>
              <span className="text-xs text-gray-400">({kpis.highMatch})</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-gray-500">Avg Match</div>
            <div className={`flex items-baseline gap-1 ${isActive ? textColor : 'text-gray-900'}`}>
              <span className="text-lg font-bold">{kpis.averageMatch}%</span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${kpis.newChanges > 0 ? 'bg-red-500' : 'bg-gray-300'}`} />
            <span>{kpis.newChanges} new</span>
          </div>
        </div>
      </motion.button>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="px-6 pt-6 pb-4 bg-gradient-to-br from-gray-50 to-white border-b border-gray-200"
    >
      <div className="flex items-start gap-4 mb-4">
        <StatusCard
          status="pending"
          label="Pending"
          icon={AlertCircle}
          kpis={pendingKPIs}
          gradient="bg-gradient-to-r from-amber-500 to-orange-500"
          textColor="text-amber-600"
          borderColor="border-amber-300"
          hoverBg="bg-amber-50"
        />
        
        <StatusCard
          status="confirmed"
          label="Confirmed"
          icon={CheckCircle2}
          kpis={confirmedKPIs}
          gradient="bg-gradient-to-r from-red-500 to-rose-500"
          textColor="text-red-600"
          borderColor="border-red-300"
          hoverBg="bg-red-50"
        />
        
        <StatusCard
          status="rejected"
          label="Rejected"
          icon={XCircle}
          kpis={rejectedKPIs}
          gradient="bg-gradient-to-r from-emerald-500 to-green-500"
          textColor="text-emerald-600"
          borderColor="border-emerald-300"
          hoverBg="bg-emerald-50"
        />
        
        <StatusCard
          status="all"
          label="All Alerts"
          icon={List}
          kpis={allKPIs}
          gradient="bg-gradient-to-r from-[#0066FF] to-[#00C2FF]"
          textColor="text-blue-600"
          borderColor="border-blue-300"
          hoverBg="bg-blue-50"
        />
      </div>

      {activeStatus !== 'all' && (
        <div className="flex items-center justify-end">
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={() => onStatusChange('all')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-100 transition-all text-sm"
          >
            <span>Clear Filter</span>
            <XCircle className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
