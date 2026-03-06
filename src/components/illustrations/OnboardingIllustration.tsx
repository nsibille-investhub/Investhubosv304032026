import { motion } from 'motion/react';

export function OnboardingIllustration() {
  return (
    <div className="relative w-full h-64 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F323D 0%, #1D3943 50%, #507583 100%)' }}>
      {/* Animated background gradients */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 25% 25%, rgba(220, 253, 188, 0.12) 0%, transparent 50%)'
        }}
        animate={{
          opacity: [0.4, 0.7, 0.4],
          scale: [1, 1.1, 1]
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
          background: 'radial-gradient(circle at 75% 75%, rgba(165, 197, 198, 0.15) 0%, transparent 50%)'
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5
        }}
      />
      
      {/* Form background */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 250">
        <defs>
          <linearGradient id="formGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.15)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
          </linearGradient>
          <linearGradient id="fillGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#DCFDBC" />
            <stop offset="100%" stopColor="#A5C5C6" />
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
        
        {/* Glow behind form */}
        <motion.rect
          x="50"
          y="30"
          width="300"
          height="190"
          rx="12"
          fill="#DCFDBC"
          opacity="0.15"
          filter="url(#glass-blur)"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.1, 0.2, 0.1],
            scale: [1, 1.02, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Form container with glass effect */}
        <motion.rect
          x="50"
          y="30"
          width="300"
          height="190"
          rx="12"
          fill="url(#formGradient)"
          stroke="rgba(165, 197, 198, 0.4)"
          strokeWidth="2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          filter="url(#glass-blur)"
        />
        <motion.rect
          x="50"
          y="30"
          width="300"
          height="190"
          rx="12"
          fill="rgba(255, 255, 255, 0.08)"
          stroke="rgba(165, 197, 198, 0.6)"
          strokeWidth="2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        />
        
        {/* Form fields - being auto-filled */}
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            {/* Field label with gradient */}
            <motion.rect
              x="70"
              y={60 + i * 40}
              width="60"
              height="8"
              rx="4"
              fill="rgba(165, 197, 198, 0.5)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.15 }}
            />
            
            {/* Field glow */}
            <motion.rect
              x="70"
              y={72 + i * 40}
              width="260"
              height="20"
              rx="6"
              fill="#DCFDBC"
              opacity="0"
              animate={{ opacity: [0, 0.15, 0] }}
              transition={{
                delay: 0.5 + i * 0.2,
                duration: 0.8,
                ease: "easeOut"
              }}
            />
            
            {/* Field input - glass effect */}
            <motion.rect
              x="70"
              y={72 + i * 40}
              width="260"
              height="20"
              rx="6"
              fill="rgba(255, 255, 255, 0.06)"
              stroke="rgba(165, 197, 198, 0.3)"
              strokeWidth="1.5"
            />
            
            {/* Animated filling gradient */}
            <defs>
              <linearGradient id={`fieldGradient${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#DCFDBC" />
                <stop offset="50%" stopColor="#A5C5C6" />
                <stop offset="100%" stopColor="#8DA2A9" />
              </linearGradient>
            </defs>
            <motion.rect
              x="75"
              y={76 + i * 40}
              width="0"
              height="12"
              rx="3"
              fill={`url(#fieldGradient${i})`}
              animate={{ width: 250 }}
              transition={{
                delay: 0.5 + i * 0.2,
                duration: 0.8,
                ease: "easeOut"
              }}
              style={{ filter: 'drop-shadow(0 0 4px rgba(220, 253, 188, 0.6))' }}
            />
            
            {/* Shimmer effect on fill */}
            <motion.rect
              x="75"
              y={76 + i * 40}
              width="30"
              height="12"
              rx="3"
              fill="url(#shimmerGradient)"
              initial={{ x: 75, opacity: 0 }}
              animate={{ 
                x: 295,
                opacity: [0, 0.8, 0]
              }}
              transition={{
                delay: 0.5 + i * 0.2,
                duration: 0.8,
                ease: "easeOut"
              }}
            />
          </g>
        ))}
        
        {/* Shimmer gradient definition */}
        <defs>
          <linearGradient id="shimmerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
            <stop offset="50%" stopColor="rgba(255, 255, 255, 0.6)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </linearGradient>
        </defs>
        
        {/* Magic wand icon with enhanced effects */}
        <motion.g
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: 0.8,
            type: "spring",
            stiffness: 200
          }}
        >
          {/* Wand glow */}
          <motion.circle 
            cx="320" 
            cy="50" 
            r="25" 
            fill="#DCFDBC" 
            opacity="0.2"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              delay: 1,
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {/* Glass circle behind wand */}
          <circle 
            cx="320" 
            cy="50" 
            r="20" 
            fill="rgba(255, 255, 255, 0.1)" 
            filter="url(#glass-blur)"
          />
          <circle 
            cx="320" 
            cy="50" 
            r="20" 
            fill="rgba(220, 253, 188, 0.2)" 
            stroke="#DCFDBC" 
            strokeWidth="2"
          />
          {/* Wand */}
          <path
            d="M 315 55 L 325 45 M 320 50 L 315 45 M 320 50 L 325 55"
            stroke="#DCFDBC"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            style={{ filter: 'drop-shadow(0 0 4px rgba(220, 253, 188, 0.8))' }}
          />
        </motion.g>
        
        {/* Enhanced sparkles with trails */}
        {[
          { x: 100, y: 80, delay: 0 },
          { x: 280, y: 100, delay: 0.15 },
          { x: 150, y: 140, delay: 0.3 },
          { x: 320, y: 160, delay: 0.45 },
          { x: 200, y: 190, delay: 0.6 },
          { x: 90, y: 180, delay: 0.75 }
        ].map((sparkle, i) => (
          <g key={i}>
            {/* Sparkle glow */}
            <motion.circle
              cx={sparkle.x}
              cy={sparkle.y}
              r="6"
              fill="#DCFDBC"
              opacity="0.3"
              filter="url(#glass-blur)"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 0.4, 0],
                scale: [0, 1.5, 0]
              }}
              transition={{
                delay: 1 + sparkle.delay,
                duration: 1.2,
                repeat: Infinity,
                repeatDelay: 2
              }}
            />
            {/* Main sparkle */}
            <motion.circle
              cx={sparkle.x}
              cy={sparkle.y}
              r="3"
              fill="#DCFDBC"
              style={{ filter: 'drop-shadow(0 0 3px rgba(220, 253, 188, 0.8))' }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                delay: 1 + sparkle.delay,
                duration: 1.2,
                repeat: Infinity,
                repeatDelay: 2
              }}
            />
            {/* Sparkle rays */}
            <motion.g
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                rotate: [0, 180, 360]
              }}
              transition={{
                delay: 1 + sparkle.delay,
                duration: 1.2,
                repeat: Infinity,
                repeatDelay: 2
              }}
              style={{ transformOrigin: `${sparkle.x}px ${sparkle.y}px` }}
            >
              <line 
                x1={sparkle.x - 6} 
                y1={sparkle.y} 
                x2={sparkle.x + 6} 
                y2={sparkle.y} 
                stroke="#DCFDBC" 
                strokeWidth="1.5" 
                strokeLinecap="round"
              />
              <line 
                x1={sparkle.x} 
                y1={sparkle.y - 6} 
                x2={sparkle.x} 
                y2={sparkle.y + 6} 
                stroke="#DCFDBC" 
                strokeWidth="1.5" 
                strokeLinecap="round"
              />
            </motion.g>
          </g>
        ))}
      </svg>
      
      {/* Floating label with glass effect */}
      <motion.div
        className="absolute top-4 left-4 px-3 py-1.5 rounded-full border backdrop-blur-sm"
        style={{
          background: 'linear-gradient(135deg, rgba(220, 253, 188, 0.2), rgba(165, 197, 198, 0.15))',
          borderColor: 'rgba(220, 253, 188, 0.4)',
          boxShadow: '0 4px 12px rgba(220, 253, 188, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
        }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2 }}
      >
        <span className="font-semibold" style={{ 
          fontSize: '0.75rem',
          background: 'linear-gradient(135deg, #DCFDBC 0%, #A5C5C6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 8px rgba(220, 253, 188, 0.4))'
        }}>Auto-filled ✨</span>
      </motion.div>
      
      {/* Glass overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5 pointer-events-none" />
    </div>
  );
}
