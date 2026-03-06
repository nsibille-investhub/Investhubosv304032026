import { motion } from 'motion/react';

export function DocumentAnalysisIllustration() {
  return (
    <div className="relative w-full h-64 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F323D 0%, #1D3943 50%, #3D5A66 100%)' }}>
      {/* Animated background gradients */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 30% 40%, rgba(165, 197, 198, 0.12) 0%, transparent 50%)'
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 70% 60%, rgba(220, 253, 188, 0.1) 0%, transparent 50%)'
        }}
        animate={{
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5
        }}
      />
      
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 250">
        <defs>
          <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#DCFDBC" stopOpacity="0" />
            <stop offset="50%" stopColor="#DCFDBC" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#DCFDBC" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="docGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.15)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
          </linearGradient>
          <filter id="glass-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Document with glass effect */}
        <motion.g
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Document glow */}
          <motion.rect 
            x="80" 
            y="40" 
            width="140" 
            height="170" 
            rx="8" 
            fill="#A5C5C6" 
            opacity="0.15"
            filter="url(#glass-blur)"
            animate={{ 
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Glass background layer */}
          <rect 
            x="80" 
            y="40" 
            width="140" 
            height="170" 
            rx="8" 
            fill="url(#docGradient)" 
            filter="url(#glass-blur)"
          />
          <rect 
            x="80" 
            y="40" 
            width="140" 
            height="170" 
            rx="8" 
            fill="rgba(255, 255, 255, 0.1)" 
            stroke="rgba(165, 197, 198, 0.5)" 
            strokeWidth="2" 
          />
          
          {/* Document lines with gradient */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const width = 110 - (i % 3) * 15; // More predictable pattern
            return (
              <motion.rect
                key={i}
                x="95"
                y={60 + i * 20}
                width={width}
                height="8"
                rx="4"
                fill="rgba(165, 197, 198, 0.4)"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
              />
            );
          })}
        </motion.g>
        
        {/* AI Scanner beam with enhanced glow */}
        <motion.g>
          {/* Wide glow behind beam */}
          <motion.rect
            x="80"
            y="40"
            width="140"
            height="20"
            fill="url(#scanGlowGradient)"
            filter="url(#glass-blur)"
            initial={{ y: 40 }}
            animate={{ y: 210 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
              ease: "linear"
            }}
          />
          <defs>
            <linearGradient id="scanGlowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#DCFDBC" stopOpacity="0" />
              <stop offset="50%" stopColor="#DCFDBC" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#DCFDBC" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Main beam */}
          <motion.rect
            x="80"
            y="40"
            width="140"
            height="3"
            fill="url(#scanGradient)"
            style={{ filter: 'drop-shadow(0 0 8px rgba(220, 253, 188, 0.8))' }}
            initial={{ y: 40 }}
            animate={{ y: 210 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
              ease: "linear"
            }}
          />
        </motion.g>
        
        {/* Analysis results panel with glass effect */}
        <motion.g
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          {/* Results panel glow */}
          <motion.rect 
            x="240" 
            y="40" 
            width="120" 
            height="170" 
            rx="8" 
            fill="#DCFDBC" 
            opacity="0.15"
            filter="url(#glass-blur)"
            animate={{ 
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
          
          {/* Glass panel */}
          <rect 
            x="240" 
            y="40" 
            width="120" 
            height="170" 
            rx="8" 
            fill="url(#docGradient)" 
            filter="url(#glass-blur)"
          />
          <rect 
            x="240" 
            y="40" 
            width="120" 
            height="170" 
            rx="8" 
            fill="rgba(255, 255, 255, 0.1)" 
            stroke="rgba(165, 197, 198, 0.5)" 
            strokeWidth="2" 
          />
          
          {/* Check marks and alerts with enhanced styling */}
          {[
            { y: 60, color: '#DCFDBC', type: 'check' },
            { y: 90, color: '#A5C5C6', type: 'check' },
            { y: 120, color: '#EF4444', type: 'alert' },
            { y: 150, color: '#DCFDBC', type: 'check' },
            { y: 180, color: '#F59E0B', type: 'warning' },
          ].map((item, i) => (
            <motion.g
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.2 + i * 0.15, type: "spring" }}
            >
              {/* Glow behind icon */}
              <motion.circle 
                cx="260" 
                cy={item.y} 
                r="12" 
                fill={item.color} 
                opacity="0.2"
                filter="url(#glass-blur)"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.35, 0.2]
                }}
                transition={{
                  delay: 1.5 + i * 0.15,
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Icon background */}
              <circle 
                cx="260" 
                cy={item.y} 
                r="8" 
                fill="rgba(255, 255, 255, 0.1)" 
              />
              <circle 
                cx="260" 
                cy={item.y} 
                r="8" 
                fill={item.color} 
                opacity="0.25" 
              />
              
              {/* Icons with glow */}
              {item.type === 'check' && (
                <path
                  d="M 257 60 L 259 62 L 263 58"
                  transform={`translate(0, ${item.y - 60})`}
                  stroke={item.color}
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 3px ${item.color})` }}
                />
              )}
              {item.type === 'alert' && (
                <text 
                  x="260" 
                  y={item.y + 4} 
                  textAnchor="middle" 
                  className="text-xs font-bold" 
                  fill="#FFFFFF"
                  style={{ filter: `drop-shadow(0 0 3px ${item.color})` }}
                >
                  !
                </text>
              )}
              {item.type === 'warning' && (
                <text 
                  x="260" 
                  y={item.y + 4} 
                  textAnchor="middle" 
                  className="text-xs font-bold" 
                  fill="#FFFFFF"
                  style={{ filter: `drop-shadow(0 0 3px ${item.color})` }}
                >
                  ?
                </text>
              )}
              
              {/* Progress bars with gradient */}
              <defs>
                <linearGradient id={`barGradient${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={item.color} stopOpacity="0.6" />
                  <stop offset="100%" stopColor={item.color} stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <rect 
                x="275" 
                y={item.y - 5} 
                width="70" 
                height="4" 
                rx="2" 
                fill={`url(#barGradient${i})`}
                style={{ filter: `drop-shadow(0 0 2px ${item.color})` }}
              />
              <rect 
                x="275" 
                y={item.y + 2} 
                width="50" 
                height="3" 
                rx="1.5" 
                fill="rgba(165, 197, 198, 0.3)" 
              />
            </motion.g>
          ))}
        </motion.g>
        
        {/* AI badge with premium glass effect */}
        <motion.g
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1.5, type: "spring", stiffness: 150 }}
        >
          {/* Badge glow */}
          <motion.circle 
            cx="150" 
            cy="30" 
            r="25" 
            fill="#DCFDBC" 
            opacity="0.3"
            filter="url(#glass-blur)"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              delay: 2,
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Glass circle */}
          <circle 
            cx="150" 
            cy="30" 
            r="18" 
            fill="rgba(255, 255, 255, 0.1)" 
            filter="url(#glass-blur)"
          />
          <circle 
            cx="150" 
            cy="30" 
            r="18" 
            fill="rgba(220, 253, 188, 0.2)" 
          />
          <defs>
            <linearGradient id="badgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DCFDBC" />
              <stop offset="100%" stopColor="#A5C5C6" />
            </linearGradient>
          </defs>
          <circle 
            cx="150" 
            cy="30" 
            r="18" 
            fill="none"
            stroke="url(#badgeGradient)" 
            strokeWidth="2"
          />
          
          {/* Pulsing ring */}
          <motion.circle
            cx="150"
            cy="30"
            r="22"
            fill="none"
            stroke="#DCFDBC"
            strokeWidth="1"
            initial={{ opacity: 0.4 }}
            animate={{ 
              opacity: [0.4, 0.8, 0.4],
              r: [22, 26, 22]
            }}
            transition={{
              delay: 2,
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <text 
            x="150" 
            y="35" 
            textAnchor="middle" 
            className="text-xs font-bold" 
            fill="#FFFFFF"
            style={{ filter: 'drop-shadow(0 0 4px rgba(220, 253, 188, 0.6))' }}
          >
            AI
          </text>
        </motion.g>
        
        {/* Floating data particles */}
        {[
          { x: 220, y: 70, delay: 0 },
          { x: 230, y: 120, delay: 0.3 },
          { x: 225, y: 170, delay: 0.6 }
        ].map((particle, i) => (
          <motion.circle
            key={i}
            r="3"
            fill="#DCFDBC"
            style={{ filter: 'drop-shadow(0 0 4px rgba(220, 253, 188, 0.8))' }}
            initial={{ 
              cx: 220,
              cy: particle.y,
              opacity: 0
            }}
            animate={{ 
              cx: 240,
              opacity: [0, 1, 0]
            }}
            transition={{
              delay: 1.8 + particle.delay,
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut"
            }}
          />
        ))}
      </svg>
      
      {/* Glass overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5 pointer-events-none" />
    </div>
  );
}
