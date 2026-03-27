import { useState } from 'react';
import { motion } from 'motion/react';
import { Badge } from './ui/badge';
import { Users, UserPlus, MessageCircle, UserCheck, List } from 'lucide-react';

interface InvestorStatusTabsProps {
  data: any[];
  activeStatus: string;
  onStatusChange: (status: string) => void;
}

export function InvestorStatusTabs({ data, activeStatus, onStatusChange }: InvestorStatusTabsProps) {
  
  const calculateKPIs = (filteredData: any[]) => {
    const total = filteredData.length;
    const totalInvested = filteredData.reduce((sum, inv) => sum + (inv.totalInvested || 0), 0);
    const avgInvested = total > 0 ? totalInvested / total : 0;
    
    return {
      total,
      totalInvested,
      avgInvested,
    };
  };

  const formatAmount = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toString();
  };

  // Filtrer les données selon le statut
  const getFilteredData = (status: string) => {
    if (status === 'all') return data;
    
    switch (status) {
      case 'prospect':
        return data.filter(inv => inv.status === 'Prospect');
      case 'en_discussion':
        return data.filter(inv => inv.status === 'En discussion');
      case 'en_relation':
        return data.filter(inv => inv.status === 'En relation');
      default:
        return data;
    }
  };

  const prospectKPIs = calculateKPIs(getFilteredData('prospect'));
  const discussionKPIs = calculateKPIs(getFilteredData('en_discussion'));
  const relationKPIs = calculateKPIs(getFilteredData('en_relation'));
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
    status: string; 
    label: string; 
    icon: any; 
    kpis: any;
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
        whileHover={{ scale: 1.01, y: -1 }}
        whileTap={{ scale: 0.98 }}
        className={`relative w-full p-2.5 rounded-lg border transition-all duration-200 text-left group overflow-hidden ${
          isActive
            ? `border-primary/40 bg-white shadow-sm`
            : `border-border/70 bg-white/90 hover:bg-white hover:border-primary/20`
        }`}
      >
        {/* Ripple effect on click */}
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
        
        {/* Hover indicator - subtle top border preview */}
        {!isActive && (
          <motion.div
            className="absolute top-0 left-0 right-0 h-0.5 bg-primary opacity-0 group-hover:opacity-100 rounded-t-xl"
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        )}
        
        {/* Gradient bar at top when active */}
        {isActive && (
          <motion.div
            layoutId="activeInvestorStatusIndicator"
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
            {/* Main gradient bar with pulse */}
            <motion.div 
              className="absolute inset-0 bg-primary"
              animate={{ 
                opacity: [1, 0.9, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Glow effect underneath */}
            <motion.div 
              className="absolute inset-0 bg-primary blur-sm opacity-35"
              animate={{ 
                opacity: [0.6, 0.4, 0.6]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{
                repeat: Infinity,
                duration: 2.5,
                ease: 'linear',
                repeatDelay: 1.5
              }}
            />
            
            {/* Bottom glow with pulse */}
            <motion.div 
              className="absolute -bottom-1 left-0 right-0 h-3 bg-primary blur-lg opacity-25"
              animate={{ 
                opacity: [0.4, 0.2, 0.4],
                height: ['12px', '16px', '12px']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        )}

        {/* Header with icon and count */}
        <div className="flex items-center justify-between mb-1.5">
          <div className={`p-1 rounded-md ${isActive ? 'bg-primary/10' : 'bg-muted group-hover:bg-muted/80'} transition-colors`}>
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`px-1.5 py-0.5 rounded-md text-[11px] ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} font-semibold`}
          >
            {kpis.total}
          </motion.div>
        </div>

        {/* Label */}
        <div className="mb-1.5">
          <span className={`text-xs font-semibold ${isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'} block leading-tight`}>
            {label}
          </span>
        </div>

        {/* KPIs */}
        <div className="space-y-0.5">
          <div className="flex items-baseline justify-between">
            <span className="text-[9px] text-gray-500 uppercase tracking-wide">Total investi</span>
            <span className={`text-[13px] font-bold ${isActive ? 'text-primary' : 'text-foreground'}`}>
              €{formatAmount(kpis.totalInvested)}
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1 border-t border-gray-200">
            <span className="text-[9px] text-gray-400">Moy</span>
            <span className="text-[10px] text-gray-500 font-medium">
              €{formatAmount(kpis.avgInvested)}
            </span>
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
      className="bg-primary/5 pb-2 rounded-lg border border-primary/10"
    >
      {/* Workflow Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-primary rounded-full" />
          <h3 className="font-semibold text-gray-900">Pipeline Investisseurs</h3>
          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/25">
            4 statuts
          </Badge>
        </div>
        <div className="text-xs text-gray-500">
          Cliquez sur un statut pour filtrer
        </div>
      </div>

      {/* Workflow Timeline - Responsive Grid */}
      <div className="grid grid-cols-4 gap-1.5 items-center">
        {/* Step 1: Prospect */}
        <div>
          <StatusCard
            status="prospect"
            label="Prospect"
            icon={UserPlus}
            kpis={prospectKPIs}
            gradient="bg-gradient-to-r from-blue-500 to-blue-600"
            textColor="text-blue-600"
            borderColor="border-blue-300"
            hoverBg="bg-blue-50"
          />
        </div>
        
        {/* Step 2: En discussion */}
        <div>
          <StatusCard
            status="en_discussion"
            label="En discussion"
            icon={MessageCircle}
            kpis={discussionKPIs}
            gradient="bg-gradient-to-r from-purple-500 to-purple-600"
            textColor="text-purple-600"
            borderColor="border-purple-300"
            hoverBg="bg-purple-50"
          />
        </div>
        
        {/* Step 3: En relation */}
        <StatusCard
          status="en_relation"
          label="En relation"
          icon={UserCheck}
          kpis={relationKPIs}
          gradient="bg-gradient-to-r from-emerald-500 to-emerald-600"
          textColor="text-emerald-600"
          borderColor="border-emerald-300"
          hoverBg="bg-emerald-50"
        />
        
        {/* Step 4: All */}
        <StatusCard
          status="all"
          label="Tous"
          icon={List}
          kpis={allKPIs}
          gradient="bg-gradient-to-r from-[#0066FF] to-[#00C2FF]"
          textColor="text-blue-600"
          borderColor="border-blue-300"
          hoverBg="bg-blue-50"
        />
      </div>
    </motion.div>
  );
}
