import { motion } from 'motion/react';
import { Info, TrendingUp } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";

interface EntityCardProps {
  title: string;
  value: string;
  delay: number;
}

export function EntityCard({ title, value, delay }: EntityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      whileHover={{ 
        y: -4, 
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        transition: { duration: 0.2 }
      }}
      className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-gray-300 transition-all duration-300 group cursor-pointer overflow-hidden relative"
    >
      {/* Gradient Background Effect */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-[#EFF6FF]/0 to-[#E0F2FE]/0 group-hover:from-[#EFF6FF]/60 group-hover:to-[#E0F2FE]/40 transition-all duration-500"
        initial={false}
      />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors duration-300">
            {title}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.2, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 group/info"
              >
                <Info className="w-4 h-4 text-gray-400 group-hover/info:text-gray-600 transition-colors" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total number of {title.toLowerCase()}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        <div className="flex items-end justify-between">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: delay + 0.1, type: 'spring', stiffness: 200 }}
          >
            <motion.h2 
              className="text-4xl font-semibold text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#0066FF] group-hover:to-[#00C2FF] transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              {value}
            </motion.h2>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.2 }}
            className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg group-hover:bg-emerald-100 transition-colors duration-300"
          >
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <TrendingUp className="w-3 h-3" />
            </motion.div>
            <span className="text-xs font-medium">+12%</span>
          </motion.div>
        </div>
        
        {/* Progress indicator */}
        <motion.div 
          className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.3 }}
        >
          <motion.div 
            className="h-full bg-gradient-to-r from-[#0066FF] to-[#00C2FF] rounded-full shadow-sm"
            initial={{ width: 0 }}
            animate={{ width: '68%' }}
            transition={{ delay: delay + 0.4, duration: 1, ease: 'easeOut' }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
