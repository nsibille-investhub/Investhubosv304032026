import { motion } from 'motion/react';
import { Badge } from './ui/badge';
import { UserX, Archive, Ban, AlertCircle } from 'lucide-react';

interface InactiveInvestorTabsProps {
  data: any[];
  activeStatus: string;
  onStatusChange: (status: string) => void;
}

export function InactiveInvestorTabs({ data, activeStatus, onStatusChange }: InactiveInvestorTabsProps) {
  const stats = {
    all: data.length,
    archived: data.filter((inv) => inv.status === 'Archivé').length,
  };

  const tabs = [
    {
      key: 'all',
      label: 'Tous archivés',
      count: stats.all,
      icon: Archive,
      color: 'from-gray-500 to-gray-600',
      badgeColor: 'bg-gray-100 text-gray-700 border-gray-300',
    },
    {
      key: 'archived',
      label: 'Archivés',
      count: stats.archived,
      icon: Archive,
      color: 'from-gray-500 to-gray-600',
      badgeColor: 'bg-gray-100 text-gray-700 border-gray-300',
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2">
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeStatus === tab.key;
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.key}
              onClick={() => onStatusChange(tab.key)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-300 min-w-fit flex-1
                ${
                  isActive
                    ? 'bg-gradient-to-br shadow-lg shadow-black/10'
                    : 'bg-gray-50/50 hover:bg-gray-100/80'
                }
              `}
              style={
                isActive
                  ? { background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }
                  : undefined
              }
            >
              {/* Icon */}
              <div
                className={`
                flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300
                ${isActive ? 'bg-white/20' : 'bg-white'}
              `}
              >
                <Icon
                  className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-600'}`}
                />
              </div>

              {/* Label & Count */}
              <div className="flex flex-col items-start gap-1">
                <span
                  className={`font-semibold text-sm whitespace-nowrap ${
                    isActive ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {tab.label}
                </span>
                <Badge
                  className={`
                    border transition-all duration-300
                    ${
                      isActive
                        ? 'bg-[#DCFDBC] text-gray-900 border-[#DCFDBC]'
                        : tab.badgeColor
                    }
                  `}
                >
                  {tab.count.toLocaleString()}
                </Badge>
              </div>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeInactiveTab"
                  className="absolute inset-0 rounded-xl border-2 border-white/20"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
