import { motion } from 'motion/react';
import { Activity, TrendingUp } from 'lucide-react';

export function RealTimeAnalyticsIllustration() {
  const data = [65, 85, 72, 90, 78, 95, 88, 92];
  const maxValue = Math.max(...data);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-8">
      {/* Background pulse */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 rounded-3xl"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
            >
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Activité en temps réel</div>
              <div className="text-xs text-gray-500">Dernières 24h</div>
            </div>
          </div>
          <motion.div
            className="flex items-center gap-1 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: '#F0FDF4' }}
            animate={{
              backgroundColor: ['#F0FDF4', '#DCFDBC', '#F0FDF4'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <TrendingUp className="w-3 h-3" style={{ color: '#10B981' }} />
            <span className="text-xs font-semibold" style={{ color: '#10B981' }}>+24%</span>
          </motion.div>
        </motion.div>

        {/* Chart */}
        <div className="relative h-40 flex items-end gap-3 bg-white/50 rounded-2xl p-4">
          {data.map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                className="w-full rounded-t-lg relative overflow-hidden"
                style={{
                  background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
                }}
                initial={{ height: 0 }}
                animate={{ height: `${(value / maxValue) * 100}%` }}
                transition={{
                  duration: 1,
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{
                    x: ['-100%', '200%']
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.1,
                    ease: "linear",
                    repeatDelay: 1
                  }}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="text-xs text-gray-500"
              >
                {index * 3}h
              </motion.div>
            </div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { label: 'Visiteurs', value: '147', color: '#0066FF' },
            { label: 'Téléchargements', value: '23', color: '#7C3AED' },
            { label: 'Questions', value: '8', color: '#00C2FF' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 + index * 0.1 }}
              className="bg-white rounded-xl p-3 shadow-sm"
            >
              <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
              <motion.div
                className="text-2xl font-bold"
                style={{ color: stat.color }}
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.3,
                  ease: "easeInOut"
                }}
              >
                {stat.value}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Live indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex items-center gap-2 mt-4 justify-center"
        >
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: '#10B981' }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <span className="text-xs text-gray-600">Mise à jour en temps réel</span>
        </motion.div>
      </div>
    </div>
  );
}
