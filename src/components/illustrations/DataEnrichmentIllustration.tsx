import { motion } from 'motion/react';

export function DataEnrichmentIllustration() {
  return (
    <div className="relative w-full h-64 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F323D 0%, #1D3943 50%, #69798C 100%)' }}>
      {/* Animated background gradients */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 20% 30%, rgba(165, 197, 198, 0.15) 0%, transparent 50%)'
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
          background: 'radial-gradient(circle at 80% 70%, rgba(220, 253, 188, 0.1) 0%, transparent 50%)'
        }}
        animate={{
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 250">
        {/* Glow effect behind center node */}
        <defs>
          <radialGradient id="centerGlow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#DCFDBC" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#DCFDBC" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="nodeGlow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#A5C5C6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#A5C5C6" stopOpacity="0" />
          </radialGradient>
          <filter id="glass-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
        </defs>
        
        {/* Animated central glow */}
        <motion.circle
          cx="200"
          cy="125"
          r="60"
          fill="url(#centerGlow)"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: [0.8, 1.2, 0.8],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Center node - main entity with glass effect */}
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        >
          {/* Glass morphism background */}
          <circle 
            cx="200" 
            cy="125" 
            r="35" 
            fill="rgba(255, 255, 255, 0.1)" 
            stroke="url(#centerGradient)" 
            strokeWidth="2.5"
            filter="url(#glass-blur)"
          />
          <circle 
            cx="200" 
            cy="125" 
            r="35" 
            fill="rgba(255, 255, 255, 0.15)" 
            className="backdrop-blur-sm"
          />
          {/* Gradient border */}
          <defs>
            <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DCFDBC" />
              <stop offset="100%" stopColor="#A5C5C6" />
            </linearGradient>
          </defs>
          <circle 
            cx="200" 
            cy="125" 
            r="35" 
            fill="none" 
            stroke="url(#centerGradient)" 
            strokeWidth="2.5"
          />
          {/* Inner glow */}
          <circle cx="200" cy="125" r="25" fill="#DCFDBC" opacity="0.2" />
          <motion.circle 
            cx="200" 
            cy="125" 
            r="20" 
            fill="none" 
            stroke="#DCFDBC" 
            strokeWidth="1"
            initial={{ opacity: 0.3 }}
            animate={{ 
              opacity: [0.3, 0.8, 0.3],
              r: [20, 25, 20]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <text x="200" y="132" textAnchor="middle" className="text-xs font-bold" fill="#FFFFFF">
            Entity
          </text>
        </motion.g>
        
        {/* Data sources around */}
        {[
          { angle: 0, label: 'UBO', color: '#A5C5C6', delay: 0.4 },
          { angle: 60, label: 'Registry', color: '#8DA2A9', delay: 0.5 },
          { angle: 120, label: 'Sanctions', color: '#69798C', delay: 0.6 },
          { angle: 180, label: 'PEP', color: '#DCFDBC', delay: 0.7 },
          { angle: 240, label: 'Media', color: '#A5C5C6', delay: 0.8 },
          { angle: 300, label: 'Credit', color: '#8DA2A9', delay: 0.9 },
        ].map((source, i) => {
          const x = 200 + Math.cos((source.angle * Math.PI) / 180) * 100;
          const y = 125 + Math.sin((source.angle * Math.PI) / 180) * 100;
          
          return (
            <g key={i}>
              {/* Glow behind node */}
              <motion.circle
                cx={x}
                cy={y}
                r="40"
                fill="url(#nodeGlow)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0.8, 1.1, 0.8],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{
                  delay: source.delay,
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Connecting line with gradient */}
              <defs>
                <linearGradient id={`lineGradient${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={source.color} stopOpacity="0.2" />
                  <stop offset="50%" stopColor={source.color} stopOpacity="0.6" />
                  <stop offset="100%" stopColor={source.color} stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <motion.line
                x1="200"
                y1="125"
                x2={x}
                y2={y}
                stroke={`url(#lineGradient${i})`}
                strokeWidth="2"
                strokeDasharray="6 4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.8 }}
                transition={{ delay: source.delay, duration: 0.8 }}
              />
              
              {/* Animated flow on line */}
              <motion.line
                x1="200"
                y1="125"
                x2={x}
                y2={y}
                stroke={source.color}
                strokeWidth="2"
                strokeDasharray="6 4"
                strokeLinecap="round"
                initial={{ 
                  strokeDashoffset: 100,
                  opacity: 0
                }}
                animate={{ 
                  strokeDashoffset: [100, 0],
                  opacity: [0, 0.8, 0]
                }}
                transition={{
                  delay: source.delay + 1,
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "linear"
                }}
              />
              
              {/* Data source node with glass effect */}
              <motion.g
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: source.delay, type: "spring", stiffness: 150 }}
              >
                {/* Glass background */}
                <circle 
                  cx={x} 
                  cy={y} 
                  r="28" 
                  fill="rgba(255, 255, 255, 0.08)" 
                  filter="url(#glass-blur)"
                />
                <circle 
                  cx={x} 
                  cy={y} 
                  r="28" 
                  fill="rgba(255, 255, 255, 0.12)" 
                  stroke={source.color} 
                  strokeWidth="2"
                />
                <circle cx={x} cy={y} r="18" fill={source.color} opacity="0.25" />
                
                {/* Pulsing ring */}
                <motion.circle
                  cx={x}
                  cy={y}
                  r="22"
                  fill="none"
                  stroke={source.color}
                  strokeWidth="1"
                  initial={{ opacity: 0.4 }}
                  animate={{ 
                    opacity: [0.4, 0.8, 0.4],
                    r: [22, 26, 22]
                  }}
                  transition={{
                    delay: source.delay + 0.3,
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                <text 
                  x={x} 
                  y={y + 4} 
                  textAnchor="middle" 
                  className="text-[10px] font-bold" 
                  fill="#FFFFFF"
                  style={{ textShadow: `0 0 8px ${source.color}` }}
                >
                  {source.label}
                </text>
              </motion.g>
              
              {/* Enhanced data packet animation with trail */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: source.delay + 1 }}
              >
                {/* Packet glow trail */}
                <motion.circle
                  r="8"
                  fill={source.color}
                  opacity="0.2"
                  filter="url(#glass-blur)"
                  initial={{ 
                    cx: x,
                    cy: y
                  }}
                  animate={{ 
                    cx: 200,
                    cy: 125,
                    opacity: [0, 0.3, 0]
                  }}
                  transition={{
                    delay: source.delay + 1,
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: "easeInOut"
                  }}
                />
                {/* Main packet */}
                <motion.circle
                  r="5"
                  fill={source.color}
                  style={{ filter: `drop-shadow(0 0 6px ${source.color})` }}
                  initial={{ 
                    cx: x,
                    cy: y,
                    opacity: 0
                  }}
                  animate={{ 
                    cx: 200,
                    cy: 125,
                    opacity: [0, 1, 1, 0]
                  }}
                  transition={{
                    delay: source.delay + 1,
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: "easeInOut"
                  }}
                />
              </motion.g>
            </g>
          );
        })}
      </svg>
      
      {/* Glass overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5 pointer-events-none" />
    </div>
  );
}
