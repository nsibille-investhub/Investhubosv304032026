import { useState } from 'react';
import { motion } from 'motion/react';
import { Badge } from './ui/badge';
import { Bell, Euro, FileText, CheckCircle2, List } from 'lucide-react';

export type RetrocessionStatusView = 'Tous' | 'En attente' | 'À facturer' | 'Facturé - A payer' | 'Facturé - Payé';

interface RetrocessionSummary {
  statut: RetrocessionStatusView;
  montantTotal: string;
}

interface RetrocessionsStatusTabsProps {
  data: RetrocessionSummary[];
  activeStatus: RetrocessionStatusView;
  onStatusChange: (status: RetrocessionStatusView) => void;
}

interface StatusKPIs {
  total: number;
  totalAmount: number;
  avgAmount: number;
}

const parseEuroAmount = (amount: string): number => {
  const normalized = amount.replace(/\s/g, '').replace('€', '').replace(',', '.');
  return Number.parseFloat(normalized) || 0;
};

export function RetrocessionsStatusTabs({ data, activeStatus, onStatusChange }: RetrocessionsStatusTabsProps) {
  const calculateKPIs = (filteredData: RetrocessionSummary[]): StatusKPIs => {
    const total = filteredData.length;
    const totalAmount = filteredData.reduce((sum, item) => sum + parseEuroAmount(item.montantTotal), 0);
    const avgAmount = total > 0 ? totalAmount / total : 0;

    return { total, totalAmount, avgAmount };
  };

  const formatAmount = (amount: number): string => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
    return `${Math.round(amount)}`;
  };

  const getFilteredData = (status: RetrocessionStatusView) => {
    if (status === 'Tous') return data;
    return data.filter(item => item.statut === status);
  };

  const allKPIs = calculateKPIs(getFilteredData('Tous'));
  const pendingKPIs = calculateKPIs(getFilteredData('En attente'));
  const toInvoiceKPIs = calculateKPIs(getFilteredData('À facturer'));
  const toPayKPIs = calculateKPIs(getFilteredData('Facturé - A payer'));
  const paidKPIs = calculateKPIs(getFilteredData('Facturé - Payé'));

  const StatusCard = ({
    status,
    label,
    icon: Icon,
    kpis,
    gradient,
    textColor,
    borderColor,
    hoverBg,
  }: {
    status: RetrocessionStatusView;
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
        className={`relative w-full p-3 rounded-xl border-2 transition-all duration-300 text-left group overflow-hidden ${
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
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ width: 0, height: 0, opacity: 0.3 }}
            animate={{ width: 400, height: 400, opacity: 0 }}
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
            layoutId="activeRetrocessionStatusIndicator"
            className="absolute top-0 left-0 right-0 h-1.5 rounded-t-xl overflow-hidden"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25, mass: 0.8 }}
          >
            <motion.div
              className={`absolute inset-0 ${gradient}`}
              animate={{ opacity: [1, 0.9, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        )}

        <div className="flex items-center justify-between mb-2">
          <div className={`p-1.5 rounded-lg ${isActive ? hoverBg : 'bg-gray-100 group-hover:bg-gray-200'} transition-colors`}>
            <Icon className={`w-4 h-4 ${isActive ? textColor : 'text-gray-600'}`} />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`px-2 py-0.5 rounded-lg text-xs ${isActive ? gradient : 'bg-gray-100'} ${isActive ? 'text-white' : 'text-gray-700'} font-semibold`}
          >
            {kpis.total}
          </motion.div>
        </div>

        <div className="mb-2">
          <span className={`text-xs font-semibold ${isActive ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'} block leading-tight`}>
            {label}
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline justify-between">
            <span className="text-[9px] text-gray-500 uppercase tracking-wide">Total</span>
            <span className={`text-sm font-bold ${isActive ? textColor : 'text-gray-900'}`}>
              €{formatAmount(kpis.totalAmount)}
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1 border-t border-gray-200">
            <span className="text-[9px] text-gray-400">Moy</span>
            <span className="text-[10px] text-gray-500 font-medium">€{formatAmount(kpis.avgAmount)}</span>
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
      className="bg-gradient-to-br from-gray-50 to-white border-b border-gray-200 pb-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-[#0066FF] to-[#00C2FF] rounded-full" />
          <h3 className="font-semibold text-gray-900">Workflow des rétrocessions</h3>
          <Badge variant="outline" className="text-xs">5 étapes</Badge>
        </div>
        <div className="text-xs text-gray-500">Cliquez sur une étape pour filtrer</div>
      </div>

      <div className="grid grid-cols-5 gap-2 items-center">
        <StatusCard status="En attente" label="En attente" icon={Bell} kpis={pendingKPIs} gradient="bg-gradient-to-r from-gray-500 to-gray-600" textColor="text-gray-600" borderColor="border-gray-300" hoverBg="bg-gray-50" />
        <StatusCard status="À facturer" label="À facturer" icon={FileText} kpis={toInvoiceKPIs} gradient="bg-gradient-to-r from-blue-500 to-blue-600" textColor="text-blue-600" borderColor="border-blue-300" hoverBg="bg-blue-50" />
        <StatusCard status="Facturé - A payer" label="Facturé - A payer" icon={Euro} kpis={toPayKPIs} gradient="bg-gradient-to-r from-purple-500 to-purple-600" textColor="text-purple-600" borderColor="border-purple-300" hoverBg="bg-purple-50" />
        <StatusCard status="Facturé - Payé" label="Facturé - Payé" icon={CheckCircle2} kpis={paidKPIs} gradient="bg-gradient-to-r from-emerald-500 to-green-500" textColor="text-emerald-600" borderColor="border-emerald-300" hoverBg="bg-emerald-50" />
        <StatusCard status="Tous" label="Toutes" icon={List} kpis={allKPIs} gradient="bg-gradient-to-r from-[#0066FF] to-[#00C2FF]" textColor="text-blue-600" borderColor="border-blue-300" hoverBg="bg-blue-50" />
      </div>
    </motion.div>
  );
}
