import { motion } from 'motion/react';

export function MonitoringIllustration() {
  return (
    <div className="relative w-full h-64 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F323D 0%, #1D3943 50%, #2A4A54 100%)' }}>
      {/* Galaxy nebula - parallax layer 1 (slowest) */}
      <motion.div
        className="absolute inset-0"
        animate={{
          x: [0, 20, 0],
          y: [0, 15, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {[...Array(40)].map((_, i) => {
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          const size = Math.random() * 2 + 0.5;
          const colors = ['#DCFDBC', '#A5C5C6', '#8DA2A9', '#69798C'];
          const color = colors[Math.floor(Math.random() * colors.length)];
          return (
            <motion.div
              key={`layer1-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${size}px`,
                height: `${size}px`,
                background: color,
                boxShadow: `0 0 ${size * 2}px ${color}`,
              }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          );
        })}
      </motion.div>

      {/* Galaxy nebula - parallax layer 2 */}
      <motion.div
        className="absolute inset-0"
        animate={{
          x: [0, -15, 0],
          y: [0, 10, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {[...Array(30)].map((_, i) => {
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          const size = Math.random() * 3 + 1;
          const colors = ['#DCFDBC', '#A5C5C6', '#8DA2A9'];
          const color = colors[Math.floor(Math.random() * colors.length)];
          return (
            <motion.div
              key={`layer2-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${size}px`,
                height: `${size}px`,
                background: color,
                boxShadow: `0 0 ${size * 3}px ${color}`,
              }}
              animate={{
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          );
        })}
      </motion.div>

      {/* Nebula clouds */}
      <motion.div
        className="absolute inset-0"
        animate={{
          x: [0, -8, 0],
          y: [0, 8, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {[...Array(5)].map((_, i) => {
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          const size = Math.random() * 120 + 80;
          const colors = [
            'rgba(220, 253, 188, 0.03)',
            'rgba(165, 197, 198, 0.04)',
            'rgba(141, 162, 169, 0.02)'
          ];
          const color = colors[Math.floor(Math.random() * colors.length)];
          return (
            <motion.div
              key={`nebula-${i}`}
              className="absolute rounded-full blur-3xl"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${size}px`,
                height: `${size}px`,
                background: color,
              }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut"
              }}
            />
          );
        })}
      </motion.div>

      {/* Animated background gradients */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 30% 20%, rgba(220, 253, 188, 0.08) 0%, transparent 50%)'
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
          background: 'radial-gradient(circle at 70% 80%, rgba(165, 197, 198, 0.1) 0%, transparent 50%)'
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
          <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
        
        {/* Radar circles with gradient */}
        {[90, 70, 50].map((r, i) => (
          <motion.circle
            key={i}
            cx="200"
            cy="125"
            r={r}
            fill="none"
            stroke="rgba(165, 197, 198, 0.3)"
            strokeWidth="1.5"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: [0.2, 0.4, 0.2] }}
            transition={{ 
              delay: i * 0.1, 
              duration: 0.6,
              opacity: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3
              }
            }}
          />
        ))}
        
        {/* Radar scanning dots (replacing the rotating line) */}
        {[...Array(24)].map((_, i) => {
          const angle = (i * 15 * Math.PI) / 180; // 24 points every 15 degrees
          const radius = 90;
          const x = 200 + Math.cos(angle) * radius;
          const y = 125 + Math.sin(angle) * radius;
          
          return (
            <motion.circle
              key={`radar-dot-${i}`}
              cx={x}
              cy={y}
              r="3"
              fill="#DCFDBC"
              style={{ filter: 'drop-shadow(0 0 4px rgba(220, 253, 188, 0.8))' }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 1, 0],
                scale: [0, 1, 1, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.125, // Sequential lighting
                ease: "easeInOut"
              }}
            />
          );
        })}
        
        {/* Center radar glow */}
        <motion.circle
          cx="200"
          cy="125"
          r="8"
          fill="#DCFDBC"
          opacity="0.3"
          filter="url(#glass-blur)"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <circle cx="200" cy="125" r="6" fill="rgba(255, 255, 255, 0.1)" />
        <circle cx="200" cy="125" r="6" fill="rgba(220, 253, 188, 0.3)" stroke="#DCFDBC" strokeWidth="2" />
        
        {/* Threat indicators with InvestHub colors */}
        {[
          { x: 150, y: 80, delay: 0.5, severity: 'high' },
          { x: 260, y: 100, delay: 0.7, severity: 'medium' },
          { x: 230, y: 160, delay: 0.9, severity: 'low' },
          { x: 140, y: 150, delay: 1.1, severity: 'medium' },
        ].map((threat, i) => (
          <motion.g
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: threat.delay, type: "spring" }}
          >
            {/* Threat glow */}
            <motion.circle
              cx={threat.x}
              cy={threat.y}
              r="16"
              fill={
                threat.severity === 'high' ? '#EF4444' :
                threat.severity === 'medium' ? '#F59E0B' : '#DCFDBC'
              }
              opacity="0.2"
              filter="url(#glass-blur)"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: threat.delay
              }}
            />
            {/* Glass background */}
            <circle
              cx={threat.x}
              cy={threat.y}
              r="10"
              fill="rgba(255, 255, 255, 0.08)"
              filter="url(#glass-blur)"
            />
            <circle
              cx={threat.x}
              cy={threat.y}
              r="10"
              fill={
                threat.severity === 'high' ? 'rgba(239, 68, 68, 0.3)' :
                threat.severity === 'medium' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(220, 253, 188, 0.3)'
              }
              stroke={
                threat.severity === 'high' ? '#EF4444' :
                threat.severity === 'medium' ? '#F59E0B' : '#DCFDBC'
              }
              strokeWidth="2"
            />
            <text
              x={threat.x}
              y={threat.y + 4}
              textAnchor="middle"
              className="text-[10px] font-bold"
              fill="#FFFFFF"
              style={{ 
                filter: `drop-shadow(0 0 3px ${
                  threat.severity === 'high' ? '#EF4444' :
                  threat.severity === 'medium' ? '#F59E0B' : '#DCFDBC'
                })` 
              }}
            >
              !
            </text>
          </motion.g>
        ))}
        
        {/* Alert panel with glass effect */}
        <motion.g
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          {/* Glass card */}
          <rect x="280" y="30" width="100" height="70" rx="10" fill="url(#cardGradient)" filter="url(#glass-blur)" />
          <rect x="280" y="30" width="100" height="70" rx="10" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(165, 197, 198, 0.5)" strokeWidth="2" />
          
          <text x="330" y="50" textAnchor="middle" className="text-xs font-bold" fill="#FFFFFF" style={{ filter: 'drop-shadow(0 0 4px rgba(220, 253, 188, 0.4))' }}>
            4 Alerts
          </text>
          
          {/* Alert bars with gradients */}
          <rect x="290" y="60" width="70" height="5" rx="2.5" fill="rgba(239, 68, 68, 0.3)" />
          <motion.rect 
            x="290" 
            y="60" 
            width="70" 
            height="5" 
            rx="2.5" 
            fill="#EF4444"
            style={{ filter: 'drop-shadow(0 0 3px #EF4444)' }}
            animate={{ width: [0, 70] }}
            transition={{ delay: 1.5, duration: 0.8 }}
          />
          
          <rect x="290" y="69" width="50" height="5" rx="2.5" fill="rgba(245, 158, 11, 0.3)" />
          <motion.rect 
            x="290" 
            y="69" 
            width="50" 
            height="5" 
            rx="2.5" 
            fill="#F59E0B"
            style={{ filter: 'drop-shadow(0 0 3px #F59E0B)' }}
            animate={{ width: [0, 50] }}
            transition={{ delay: 1.6, duration: 0.8 }}
          />
          
          <rect x="290" y="78" width="60" height="5" rx="2.5" fill="rgba(220, 253, 188, 0.3)" />
          <motion.rect 
            x="290" 
            y="78" 
            width="60" 
            height="5" 
            rx="2.5" 
            fill="#DCFDBC"
            style={{ filter: 'drop-shadow(0 0 3px #DCFDBC)' }}
            animate={{ width: [0, 60] }}
            transition={{ delay: 1.7, duration: 0.8 }}
          />
          
          {/* Labels */}
          <text x="292" y="64" className="text-[7px]" fill="rgba(255, 255, 255, 0.7)">High</text>
          <text x="292" y="73" className="text-[7px]" fill="rgba(255, 255, 255, 0.7)">Medium</text>
          <text x="292" y="82" className="text-[7px]" fill="rgba(255, 255, 255, 0.7)">Low</text>
        </motion.g>
        
        {/* Live indicator with glass effect */}
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.5, type: "spring" }}
        >
          {/* Glass pill */}
          <rect x="30" y="30" width="70" height="26" rx="13" fill="url(#cardGradient)" filter="url(#glass-blur)" />
          <rect x="30" y="30" width="70" height="26" rx="13" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(220, 253, 188, 0.6)" strokeWidth="2" />
          
          {/* Pulsing dot */}
          <motion.circle
            cx="46"
            cy="43"
            r="5"
            fill="#DCFDBC"
            style={{ filter: 'drop-shadow(0 0 6px rgba(220, 253, 188, 0.8))' }}
            animate={{ 
              opacity: [1, 0.3, 1],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          
          <text x="58" y="47" className="text-[11px] font-bold" fill="#FFFFFF" style={{ filter: 'drop-shadow(0 0 3px rgba(220, 253, 188, 0.4))' }}>
            LIVE
          </text>
        </motion.g>
        
        {/* Data stream lines with InvestHub color */}
        {[...Array(8)].map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          return (
            <motion.line
              key={i}
              x1="200"
              y1="125"
              x2={200 + Math.cos(angle) * 90}
              y2={125 + Math.sin(angle) * 90}
              stroke="rgba(165, 197, 198, 0.3)"
              strokeWidth="1"
              strokeDasharray="4 3"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ delay: 0.8 + i * 0.08, duration: 0.8 }}
            />
          );
        })}
        
        {/* Scanning pulse waves */}
        {[...Array(3)].map((_, i) => (
          <motion.circle
            key={`pulse-${i}`}
            cx="200"
            cy="125"
            r="20"
            fill="none"
            stroke="#DCFDBC"
            strokeWidth="2"
            initial={{ r: 20, opacity: 0.6 }}
            animate={{ 
              r: 90,
              opacity: 0
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 1,
              ease: "easeOut"
            }}
          />
        ))}
      </svg>
      
      {/* Glass overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5 pointer-events-none" />
    </div>
  );
}
