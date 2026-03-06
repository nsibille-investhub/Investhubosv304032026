import { motion } from 'motion/react';
import { TrendingUp, Eye, Clock, MousePointer, Download, FileText } from 'lucide-react';

export function EngagementScoreIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Background glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-purple-500/5 rounded-3xl"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Main Score Circle */}
        <div className="relative mx-auto w-48 h-48 flex items-center justify-center">
          {/* Animated rings */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-blue-500/20"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeOut"
              }}
            />
          ))}
          
          {/* Score circle */}
          <motion.div
            className="relative w-40 h-40 rounded-full flex flex-col items-center justify-center"
            style={{
              background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
              boxShadow: '0 10px 40px rgba(0, 102, 255, 0.3)'
            }}
            animate={{
              boxShadow: [
                '0 10px 40px rgba(0, 102, 255, 0.3)',
                '0 10px 60px rgba(0, 102, 255, 0.5)',
                '0 10px 40px rgba(0, 102, 255, 0.3)',
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-5xl font-bold text-white"
            >
              85
            </motion.div>
            <div className="text-xs text-white/70 mt-1">Engagement Score</div>
          </motion.div>

          {/* Progress arc */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <motion.circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="#DCFDBC"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="552"
              initial={{ strokeDashoffset: 552 }}
              animate={{ strokeDashoffset: 552 - (552 * 0.85) }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
            />
          </svg>
        </div>

        {/* Floating metrics */}
        <div className="absolute top-0 -left-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-xl shadow-lg p-3 flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EFF6FF' }}>
              <Eye className="w-4 h-4" style={{ color: '#0066FF' }} />
            </div>
            <div>
              <div className="text-xs text-gray-500">Vues</div>
              <div className="text-sm font-bold">147</div>
            </div>
          </motion.div>
        </div>

        <div className="absolute top-4 -right-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-white rounded-xl shadow-lg p-3 flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#ECFEFF' }}>
              <Clock className="w-4 h-4" style={{ color: '#00C2FF' }} />
            </div>
            <div>
              <div className="text-xs text-gray-500">Temps</div>
              <div className="text-sm font-bold">24m</div>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 -left-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="bg-white rounded-xl shadow-lg p-3 flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FAF5FF' }}>
              <Download className="w-4 h-4" style={{ color: '#7C3AED' }} />
            </div>
            <div>
              <div className="text-xs text-gray-500">Downloads</div>
              <div className="text-sm font-bold">23</div>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-4 -right-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="bg-white rounded-xl shadow-lg p-3 flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F0FDF4' }}>
              <FileText className="w-4 h-4" style={{ color: '#10B981' }} />
            </div>
            <div>
              <div className="text-xs text-gray-500">Docs lus</div>
              <div className="text-sm font-bold">12</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
