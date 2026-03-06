import { motion } from 'motion/react';
import { Bell, AlertCircle, TrendingDown, Clock } from 'lucide-react';

export function SmartNudgesIllustration() {
  const nudges = [
    {
      icon: AlertCircle,
      title: '3 LP n\'ont pas ouvert la section Fees',
      type: 'warning',
      color: 'orange',
      delay: 0.2
    },
    {
      icon: Clock,
      title: '5 investisseurs inactifs depuis 7 jours',
      type: 'info',
      color: 'blue',
      delay: 0.4
    },
    {
      icon: TrendingDown,
      title: 'Baisse d\'engagement sur ESG (-15%)',
      type: 'alert',
      color: 'red',
      delay: 0.6
    },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center p-6">
      {/* Background glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-blue-500/5 to-red-500/5 rounded-3xl"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative w-full max-w-md space-y-3">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-6"
        >
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg relative"
            style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
          >
            <Bell className="w-5 h-5 text-white" />
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center"
              style={{ backgroundColor: '#EF4444' }}
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <span className="text-[9px] font-bold text-white">3</span>
            </motion.div>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Alertes intelligentes</div>
            <div className="text-xs text-gray-500">Relances recommandées</div>
          </div>
        </motion.div>

        {/* Nudge Cards */}
        <div className="space-y-3">
          {nudges.map((nudge, index) => {
            const Icon = nudge.icon;
            const colorMap: any = {
              orange: { bg: '#FEF3C7', bgLight: '#FFFBEB', icon: '#F59E0B', border: '#F59E0B' },
              blue: { bg: '#DBEAFE', bgLight: '#EFF6FF', icon: '#0066FF', border: '#0066FF' },
              red: { bg: '#FEE2E2', bgLight: '#FEF2F2', icon: '#EF4444', border: '#EF4444' },
            };
            const colors = colorMap[nudge.color];

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: nudge.delay, type: 'spring' }}
                whileHover={{ scale: 1.02, x: 4 }}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                style={{ borderLeft: `4px solid ${colors.border}` }}
              >
                <div className="flex items-start gap-3">
                  <motion.div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: colors.bgLight }}
                    animate={{
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: nudge.delay,
                      ease: "easeInOut"
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: colors.icon }} />
                  </motion.div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 mb-2">
                      {nudge.title}
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-white shadow-sm"
                      >
                        Relancer
                      </motion.button>
                      <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                        Ignorer
                      </button>
                    </div>
                  </div>

                  {/* Pulse indicator */}
                  <motion.div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: colors.bg }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.5, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: nudge.delay,
                      ease: "easeInOut"
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Action Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-gray-300 text-sm font-medium text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-all"
        >
          Voir toutes les alertes (12)
        </motion.button>
      </div>
    </div>
  );
}
