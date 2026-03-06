import { motion } from 'motion/react';

export function ComprehensiveReportsIllustration() {
  return (
    <div className="relative w-full h-64 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F323D 0%, #1D3943 50%, #2A4A54 100%)' }}>
      {/* Background pattern */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => {
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          const size = Math.random() * 2 + 1;
          return (
            <motion.div
              key={i}
              className="absolute rounded-sm"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${size}px`,
                height: `${size}px`,
                background: 'rgba(220, 253, 188, 0.2)',
              }}
              animate={{
                opacity: [0.2, 0.5, 0.2],
                rotate: [0, 90, 0],
              }}
              transition={{
                duration: 5 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          );
        })}
      </div>

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 250">
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(220, 253, 188, 0.8)" />
            <stop offset="100%" stopColor="rgba(220, 253, 188, 0.1)" />
          </linearGradient>
          <filter id="reportGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Main document */}
        <motion.g
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <rect x="80" y="30" width="180" height="190" rx="12" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(220, 253, 188, 0.4)" strokeWidth="2" />
          
          {/* Document header */}
          <rect x="90" y="40" width="160" height="30" rx="6" fill="rgba(220, 253, 188, 0.15)" />
          <text x="100" y="56" className="text-xs font-bold" fill="#DCFDBC">Compliance Report</text>
          <text x="100" y="66" className="text-[10px]" fill="rgba(255, 255, 255, 0.5)">Q4 2024</text>
          
          {/* Export icon */}
          <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: "spring" }}
          >
            <rect x="225" y="45" width="20" height="20" rx="4" fill="rgba(59, 130, 246, 0.3)" stroke="#3B82F6" strokeWidth="1.5" />
            <motion.path
              d="M 230 52 L 235 52 L 235 57 M 232.5 52 L 232.5 60 M 229 57 L 232.5 60 L 236 57"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            />
          </motion.g>
        </motion.g>

        {/* Stats cards */}
        {[
          { x: 90, y: 85, label: 'Total', value: '247', color: '#3B82F6', delay: 0.3 },
          { x: 170, y: 85, label: 'Cleared', value: '189', color: '#10B981', delay: 0.4 },
          { x: 90, y: 115, label: 'Pending', value: '43', color: '#F59E0B', delay: 0.5 },
          { x: 170, y: 115, label: 'Flagged', value: '15', color: '#EF4444', delay: 0.6 },
        ].map((stat, i) => (
          <motion.g
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: stat.delay, type: "spring", stiffness: 200 }}
          >
            <rect x={stat.x} y={stat.y} width="70" height="24" rx="6" fill="rgba(255, 255, 255, 0.05)" stroke={stat.color} strokeWidth="1.5" />
            <text x={stat.x + 5} y={stat.y + 10} className="text-[8px]" fill="rgba(255, 255, 255, 0.6)">{stat.label}</text>
            <motion.text 
              x={stat.x + 5} 
              y={stat.y + 20} 
              className="text-sm font-bold" 
              fill={stat.color}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, delay: stat.delay }}
            >
              {stat.value}
            </motion.text>
          </motion.g>
        ))}

        {/* Chart area */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <text x="95" y="155" className="text-[10px] font-bold" fill="rgba(255, 255, 255, 0.7)">Activity Trend</text>
          
          {/* Chart bars */}
          {[
            { x: 95, height: 25, delay: 0.8 },
            { x: 110, height: 35, delay: 0.9 },
            { x: 125, height: 30, delay: 1.0 },
            { x: 140, height: 45, delay: 1.1 },
            { x: 155, height: 38, delay: 1.2 },
            { x: 170, height: 50, delay: 1.3 },
            { x: 185, height: 42, delay: 1.4 },
            { x: 200, height: 55, delay: 1.5 },
            { x: 215, height: 48, delay: 1.6 },
            { x: 230, height: 52, delay: 1.7 },
          ].map((bar, i) => (
            <motion.rect
              key={i}
              x={bar.x}
              y={210 - bar.height}
              width="10"
              height="0"
              rx="2"
              fill="url(#chartGradient)"
              animate={{ height: bar.height }}
              transition={{ delay: bar.delay, duration: 0.6, ease: "easeOut" }}
            />
          ))}
          
          {/* Chart baseline */}
          <line x1="90" y1="210" x2="245" y2="210" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
        </motion.g>

        {/* Secondary documents stack */}
        <motion.g
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.5 }}
        >
          {/* Document 3 (back) */}
          <rect x="290" y="95" width="80" height="100" rx="8" fill="rgba(255, 255, 255, 0.03)" stroke="rgba(165, 197, 198, 0.3)" strokeWidth="1.5" />
          
          {/* Document 2 (middle) */}
          <rect x="285" y="90" width="80" height="100" rx="8" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(165, 197, 198, 0.4)" strokeWidth="1.5" />
          
          {/* Document 1 (front) */}
          <rect x="280" y="85" width="80" height="100" rx="8" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(220, 253, 188, 0.5)" strokeWidth="2" />
          
          {/* PDF icon */}
          <rect x="295" y="95" width="24" height="30" rx="3" fill="rgba(239, 68, 68, 0.3)" stroke="#EF4444" strokeWidth="1.5" />
          <text x="307" y="112" textAnchor="middle" className="text-[10px] font-bold" fill="#FFFFFF">PDF</text>
          
          {/* Excel icon */}
          <rect x="325" y="95" width="24" height="30" rx="3" fill="rgba(16, 185, 129, 0.3)" stroke="#10B981" strokeWidth="1.5" />
          <text x="337" y="110" textAnchor="middle" className="text-[8px] font-bold" fill="#FFFFFF">XLS</text>
          
          {/* File details */}
          <line x1="290" y1="135" x2="345" y2="135" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
          {[142, 148, 154, 160].map((y, i) => (
            <motion.line
              key={i}
              x1="290"
              y1={y}
              x2="290"
              y2={y}
              stroke="rgba(220, 253, 188, 0.4)"
              strokeWidth="1"
              strokeLinecap="round"
              animate={{ x2: 290 + (60 - i * 8) }}
              transition={{ delay: 2 + i * 0.1, duration: 0.5, ease: "easeOut" }}
            />
          ))}
          
          {/* Download count badge */}
          <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 2.2, type: "spring", stiffness: 300 }}
          >
            <circle cx="352" cy="95" r="10" fill="#3B82F6" filter="url(#reportGlow)" />
            <text x="352" y="98" textAnchor="middle" className="text-[10px] font-bold" fill="#FFFFFF">3</text>
          </motion.g>
        </motion.g>

        {/* Audit trail indicator */}
        <motion.g
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2.4 }}
        >
          <rect x="30" y="40" width="35" height="80" rx="8" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="2" />
          
          {/* Timeline dots */}
          {[50, 65, 80, 95, 110].map((y, i) => (
            <motion.g key={i}>
              <motion.circle
                cx="47.5"
                cy={y}
                r="3"
                fill="#8B5CF6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2.5 + i * 0.1, type: "spring" }}
              />
              {i < 4 && (
                <motion.line
                  x1="47.5"
                  y1={y + 3}
                  x2="47.5"
                  y2={y + 3}
                  stroke="rgba(139, 92, 246, 0.4)"
                  strokeWidth="2"
                  animate={{ y2: y + 12 }}
                  transition={{ delay: 2.6 + i * 0.1, duration: 0.3 }}
                />
              )}
            </motion.g>
          ))}
        </motion.g>

        {/* Export success notification */}
        <motion.g
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 2.8, type: "spring" }}
        >
          <rect x="30" y="140" width="120" height="40" rx="10" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" strokeWidth="2" />
          
          {/* Check icon */}
          <motion.circle
            cx="50"
            cy="160"
            r="12"
            fill="#10B981"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 3, type: "spring", stiffness: 300 }}
          />
          <motion.path
            d="M 45 160 L 48 163 L 55 156"
            stroke="#FFFFFF"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 3.2, duration: 0.4 }}
          />
          
          <text x="70" y="157" className="text-[10px]" fill="rgba(255, 255, 255, 0.7)">Export ready</text>
          <text x="70" y="168" className="text-xs font-bold" fill="#10B981">247 records</text>
        </motion.g>

        {/* Verified stamp */}
        <motion.g
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 3.2, type: "spring", stiffness: 150 }}
        >
          <circle cx="240" y="190" r="18" fill="none" stroke="#10B981" strokeWidth="3" opacity="0.6" />
          <motion.path
            d="M 232 190 L 237 195 L 248 184"
            stroke="#10B981"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 3.4, duration: 0.4 }}
          />
          <text x="240" y="208" textAnchor="middle" className="text-[8px] font-bold" fill="#10B981">VERIFIED</text>
        </motion.g>
      </svg>

      {/* Glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5 pointer-events-none" />
    </div>
  );
}
