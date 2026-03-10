import { motion } from 'motion/react';
import { Bell, Euro, FileText, CheckCircle2, List } from 'lucide-react';

export type RetrocessionStatusView = 'Tous' | 'En attente' | 'À facturer' | 'Facturé - A payer' | 'Facturé - Payé';

interface RetrocessionsStatusTabsProps {
  activeStatus: RetrocessionStatusView;
  onStatusChange: (status: RetrocessionStatusView) => void;
  counts: Record<RetrocessionStatusView, number>;
}

export function RetrocessionsStatusTabs({ activeStatus, onStatusChange, counts }: RetrocessionsStatusTabsProps) {
  const cards: Array<{ key: RetrocessionStatusView; label: string; icon: any; gradient: string; borderColor: string; textColor: string; bgColor: string }> = [
    { key: 'Tous', label: 'Toutes', icon: List, gradient: 'bg-gradient-to-r from-[#0066FF] to-[#00C2FF]', borderColor: 'border-blue-300', textColor: 'text-blue-600', bgColor: 'bg-blue-50' },
    { key: 'En attente', label: 'En attente', icon: Bell, gradient: 'bg-gradient-to-r from-gray-500 to-gray-600', borderColor: 'border-gray-300', textColor: 'text-gray-700', bgColor: 'bg-gray-100' },
    { key: 'À facturer', label: 'À facturer', icon: FileText, gradient: 'bg-gradient-to-r from-blue-500 to-indigo-600', borderColor: 'border-indigo-300', textColor: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    { key: 'Facturé - A payer', label: 'Facturé - A payer', icon: Euro, gradient: 'bg-gradient-to-r from-purple-500 to-violet-600', borderColor: 'border-purple-300', textColor: 'text-purple-600', bgColor: 'bg-purple-50' },
    { key: 'Facturé - Payé', label: 'Facturé - Payé', icon: CheckCircle2, gradient: 'bg-gradient-to-r from-green-500 to-emerald-600', borderColor: 'border-green-300', textColor: 'text-green-600', bgColor: 'bg-green-50' },
  ];

  return (
    <div className="grid grid-cols-5 gap-3 mb-4">
      {cards.map(({ key, label, icon: Icon, gradient, borderColor, textColor, bgColor }) => {
        const isActive = activeStatus === key;

        return (
          <motion.button
            key={key}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStatusChange(key)}
            className={`relative overflow-hidden rounded-xl border-2 p-3 text-left transition-all ${isActive ? `${borderColor} bg-white shadow-md` : 'border-gray-200 bg-white hover:border-gray-300'}`}
          >
            {isActive && <div className={`absolute top-0 left-0 right-0 h-1 ${gradient}`} />}
            <div className="flex items-center justify-between mb-2">
              <div className={`p-1.5 rounded-md ${isActive ? bgColor : 'bg-gray-100'}`}>
                <Icon className={`w-4 h-4 ${isActive ? textColor : 'text-gray-600'}`} />
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${isActive ? `${gradient} text-white` : 'bg-gray-100 text-gray-700'}`}>
                {counts[key]}
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-700">{label}</p>
          </motion.button>
        );
      })}
    </div>
  );
}
