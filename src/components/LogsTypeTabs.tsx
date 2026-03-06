import { motion } from 'motion/react';
import { LogEntry } from '../utils/logsGenerator';

type LogType = 'user' | 'technical';

interface LogsTypeTabsProps {
  data: LogEntry[];
  activeType: LogType;
  onTypeChange: (type: LogType) => void;
}

export function LogsTypeTabs({ data, activeType, onTypeChange }: LogsTypeTabsProps) {
  
  // Contrôleurs techniques/système
  const technicalControllers = [
    'Requêtes techniques (AJAX)',
    'Système',
    'Reporting (technique)',
  ];

  // Actions automatiques/système
  const technicalActions = [
    'Requête AJAX',
    'Action système',
    'Reporting technique',
    'Chargement composants',
    'Asset',
    'Collecte logs',
  ];

  // Fonction pour déterminer si un log est technique
  const isTechnicalLog = (log: LogEntry): boolean => {
    return (
      technicalControllers.includes(log.controllerLabel) ||
      technicalActions.includes(log.actionLabel)
    );
  };

  const userLogs = data.filter(log => !isTechnicalLog(log));
  const technicalLogs = data.filter(log => isTechnicalLog(log));

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="px-6">
        <div className="flex items-center gap-8">
          <button
            onClick={() => onTypeChange('user')}
            className="relative py-4 group"
          >
            <span className={`font-medium transition-colors ${
              activeType === 'user' 
                ? 'text-gray-900 dark:text-gray-100' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}>
              Actions utilisateurs
            </span>
            {activeType === 'user' && (
              <motion.div
                layoutId="activeLogTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>

          <button
            onClick={() => onTypeChange('technical')}
            className="relative py-4 group"
          >
            <span className={`font-medium transition-colors ${
              activeType === 'technical' 
                ? 'text-gray-900 dark:text-gray-100' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}>
              Logs Techniques
            </span>
            {activeType === 'technical' && (
              <motion.div
                layoutId="activeLogTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-500"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export type { LogType };