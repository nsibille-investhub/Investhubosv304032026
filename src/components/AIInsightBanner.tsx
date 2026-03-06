import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, ChevronRight, AlertCircle, TrendingUp, CheckCircle2, Info } from 'lucide-react';
import { AIAnalysis } from '../utils/aiAnalyzer';

interface AIInsightBannerProps {
  analysis: AIAnalysis | null;
  onClose: () => void;
  onInsightClick?: (index: number) => void;
}

export function AIInsightBanner({ analysis, onClose, onInsightClick }: AIInsightBannerProps) {
  if (!analysis) return null;

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <TrendingUp className="w-4 h-4 text-orange-600" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getBannerColor = () => {
    // Utiliser le bandeau jaune pour tous les résultats AI
    return 'bg-yellow-50 border-yellow-200';
  };

  const getTextColor = () => {
    return 'text-yellow-900';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`px-6 py-4 border-b ${getBannerColor()}`}
      >
        <div className="flex items-start gap-4">
          {/* AI Icon */}
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatDelay: 3
            }}
            className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </motion.div>

          {/* Content */}
          <div className="flex-1 space-y-3">
            {/* Summary */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-semibold ${getTextColor()}`}>
                  AI Analysis
                </h3>
                <span className="text-xs text-gray-500">
                  • {new Date(analysis.timestamp).toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <p className={`text-sm ${getTextColor()}`}>
                {analysis.summary}
              </p>
            </div>

            {/* Insights Chips */}
            {analysis.insights.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {analysis.insights.map((insight, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onInsightClick?.(idx)}
                    className="group inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:border-purple-400 hover:shadow-md transition-all text-sm"
                  >
                    {getInsightIcon(insight.type)}
                    <span className="font-medium text-gray-900">{insight.title}</span>
                    <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-semibold text-gray-700">
                      {insight.count}
                    </span>
                    <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Close Button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
