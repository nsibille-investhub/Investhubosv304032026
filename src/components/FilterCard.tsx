import { useState } from 'react';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';

interface FilterCardProps {
  status: string;
  activeStatus: string;
  onStatusChange: (status: string) => void;
  label: string;
  icon: LucideIcon;
  total: number;
  metricLabel: string;
  metricValue: string;
  averageValue: string;
  iconActiveClassName?: string;
}

export function FilterCard({
  status,
  activeStatus,
  onStatusChange,
  label,
  icon: Icon,
  total,
  metricLabel,
  metricValue,
  averageValue,
  iconActiveClassName = 'text-primary',
}: FilterCardProps) {
  const isActive = activeStatus === status;
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);

    onStatusChange(status);
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`relative w-full p-2.5 rounded-xl border transition-all duration-200 text-left group overflow-hidden ${
        isActive
          ? 'border-primary/40 bg-white shadow-sm'
          : 'border-border/70 bg-white hover:bg-white hover:border-primary/20'
      }`}
    >
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-primary opacity-30"
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
          className="absolute top-0 left-0 right-0 h-0.5 bg-primary opacity-0 group-hover:opacity-100 rounded-t-xl"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      )}

      {isActive && (
        <motion.div
          layoutId="activeFilterCardIndicator"
          className="absolute top-0 left-0 right-0 h-1.5 rounded-t-xl overflow-hidden"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25, mass: 0.8 }}
        >
          <motion.div
            className="absolute inset-0 bg-primary"
            animate={{ opacity: [1, 0.9, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-0 bg-primary blur-sm opacity-35"
            animate={{ opacity: [0.6, 0.4, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'linear', repeatDelay: 1.5 }}
          />
          <motion.div
            className="absolute -bottom-1 left-0 right-0 h-3 bg-primary blur-lg opacity-25"
            animate={{ opacity: [0.4, 0.2, 0.4], height: ['12px', '16px', '12px'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      )}

      <div className="flex items-center justify-between mb-1.5">
        <div className={`p-1 rounded-md ${isActive ? 'bg-primary/10' : 'bg-muted group-hover:bg-muted/80'} transition-colors`}>
          <Icon className={`w-3.5 h-3.5 ${isActive ? iconActiveClassName : 'text-muted-foreground'}`} />
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`px-1.5 py-0.5 rounded-md text-[11px] ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} font-semibold`}
        >
          {total}
        </motion.div>
      </div>

      <div className="mb-1.5">
        <span className={`text-xs font-semibold ${isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'} block leading-tight`}>
          {label}
        </span>
      </div>

      <div className="space-y-0.5">
        <div className="flex items-baseline justify-between">
          <span className="text-[9px] text-gray-500 uppercase tracking-wide">{metricLabel}</span>
          <span className={`text-[13px] font-bold ${isActive ? 'text-primary' : 'text-foreground'}`}>{metricValue}</span>
        </div>
        <div className="flex items-baseline justify-between pt-1 border-t border-gray-200">
          <span className="text-[9px] text-gray-400">Moy</span>
          <span className="text-[10px] text-gray-500 font-medium">{averageValue}</span>
        </div>
      </div>
    </motion.button>
  );
}
