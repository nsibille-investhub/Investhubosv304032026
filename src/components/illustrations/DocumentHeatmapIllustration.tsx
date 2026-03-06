import { motion } from 'motion/react';
import { FileText, Eye, MousePointer } from 'lucide-react';

export function DocumentHeatmapIllustration() {
  // Simulate document sections with engagement levels
  const sections = [
    { name: 'Executive Summary', engagement: 95, gradient: 'linear-gradient(to right, #10B981, #059669)' },
    { name: 'Financial Overview', engagement: 88, gradient: 'linear-gradient(to right, #0066FF, #00C2FF)' },
    { name: 'ESG Policy', engagement: 45, gradient: 'linear-gradient(to right, #F59E0B, #EF4444)' },
    { name: 'Fee Structure', engagement: 72, gradient: 'linear-gradient(to right, #F59E0B, #F97316)' },
    { name: 'Legal Terms', engagement: 35, gradient: 'linear-gradient(to right, #EF4444, #DC2626)' },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center p-6">
      {/* Background glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl"
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
          >
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Pitch Deck 2024.pdf</div>
            <div className="text-xs text-gray-500">Heatmap d'engagement</div>
          </div>
        </motion.div>

        {/* Document Preview with Heatmap */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 space-y-3"
        >
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="group"
            >
              {/* Section header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{
                      rotate: [0, 10, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.2,
                      ease: "easeInOut"
                    }}
                  >
                    <Eye className="w-4 h-4 text-gray-400" />
                  </motion.div>
                  <span className="text-sm font-medium text-gray-700">
                    {section.name}
                  </span>
                </div>
                <span className="text-xs font-semibold text-gray-500">
                  {section.engagement}%
                </span>
              </div>

              {/* Engagement bar with gradient */}
              <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0"
                  style={{ background: section.gradient }}
                  initial={{ width: 0 }}
                  animate={{ width: `${section.engagement}%` }}
                  transition={{
                    duration: 1,
                    delay: 0.5 + index * 0.1,
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
                      delay: 1 + index * 0.2,
                      ease: "linear",
                      repeatDelay: 1
                    }}
                  />
                </motion.div>

                {/* Hover indicators - simulated mouse movements */}
                {section.engagement > 50 && (
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2"
                    initial={{ left: '10%' }}
                    animate={{
                      left: [`${10 + index * 5}%`, `${section.engagement - 10}%`, `${20 + index * 3}%`],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.3
                    }}
                  >
                    <MousePointer className="w-3 h-3 text-white drop-shadow-lg" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-4 flex items-center justify-center gap-4 text-xs"
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ background: 'linear-gradient(to right, #10B981, #059669)' }}
            />
            <span className="text-gray-600">Forte lecture</span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ background: 'linear-gradient(to right, #F59E0B, #EF4444)' }}
            />
            <span className="text-gray-600">Faible lecture</span>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="mt-4 grid grid-cols-2 gap-3"
        >
          <div className="bg-white rounded-xl p-3 shadow-sm text-center">
            <div className="text-xs text-gray-500 mb-1">Temps moyen</div>
            <motion.div
              className="text-xl font-bold"
              style={{ color: '#0066FF' }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              8m 24s
            </motion.div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm text-center">
            <div className="text-xs text-gray-500 mb-1">Taux de lecture</div>
            <motion.div
              className="text-xl font-bold"
              style={{ color: '#10B981' }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              67%
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
