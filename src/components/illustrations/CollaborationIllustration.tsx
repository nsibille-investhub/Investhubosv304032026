import { motion } from 'motion/react';

export function CollaborationIllustration() {
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
          <linearGradient id="cardGradientCollab" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.15)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
          </linearGradient>
          <filter id="glass-blur-collab">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
          <linearGradient id="investHubGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DCFDBC" />
            <stop offset="100%" stopColor="#A5C5C6" />
          </linearGradient>
        </defs>
        
        {/* Central workspace - glass card */}
        <rect x="120" y="60" width="160" height="130" rx="12" fill="url(#cardGradientCollab)" filter="url(#glass-blur-collab)" />
        <rect x="120" y="60" width="160" height="130" rx="12" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(165, 197, 198, 0.5)" strokeWidth="2" />
        
        {/* Document/Task items */}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x="135" y={80 + i * 35} width="130" height="25" rx="6" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(165, 197, 198, 0.2)" strokeWidth="1" />
            <rect x="145" y={87 + i * 35} width="80" height="4" rx="2" fill="#DCFDBC" opacity="0.4" />
            <rect x="145" y={94 + i * 35} width="60" height="3" rx="1.5" fill="rgba(165, 197, 198, 0.3)" />
            
            {/* Checkmark for completed */}
            {i < 2 && (
              <g>
                <circle cx="252" cy={92 + i * 35} r="8" fill="#DCFDBC" style={{ filter: 'drop-shadow(0 0 4px rgba(220, 253, 188, 0.6))' }} />
                <path
                  d={`M 249 ${92 + i * 35} L 251 ${94 + i * 35} L 255 ${90 + i * 35}`}
                  stroke="#0F323D"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </g>
            )}
          </g>
        ))}
        
        {/* User avatars with InvestHub colors */}
        {[
          { x: 80, y: 80, color: '#DCFDBC' },
          { x: 320, y: 120, color: '#A5C5C6' },
          { x: 80, y: 160, color: '#8DA2A9' },
        ].map((user, i) => (
          <g key={i}>
            {/* Glow */}
            <circle cx={user.x} cy={user.y} r="24" fill={user.color} opacity="0.15" filter="url(#glass-blur-collab)" />
            
            {/* Avatar glass circle */}
            <circle cx={user.x} cy={user.y} r="22" fill="rgba(255, 255, 255, 0.08)" filter="url(#glass-blur-collab)" />
            <circle cx={user.x} cy={user.y} r="22" fill="rgba(255, 255, 255, 0.1)" stroke={user.color} strokeWidth="2.5" />
            <circle cx={user.x} cy={user.y} r="15" fill={user.color} opacity="0.2" />
            
            {/* User icon */}
            <circle cx={user.x} cy={user.y - 3} r="5" fill={user.color} />
            <path
              d={`M ${user.x - 8} ${user.y + 10} Q ${user.x} ${user.y + 5} ${user.x + 8} ${user.y + 10}`}
              fill={user.color}
            />
            
            {/* Active indicator */}
            <circle
              cx={user.x + 15}
              cy={user.y - 15}
              r="5"
              fill="#DCFDBC"
              stroke="rgba(15, 50, 61, 0.8)"
              strokeWidth="2"
              style={{ filter: 'drop-shadow(0 0 4px rgba(220, 253, 188, 0.8))' }}
            />
          </g>
        ))}
        
        {/* Connection lines */}
        {[
          { x1: 102, y1: 80, x2: 120, y2: 80 },
          { x1: 280, y1: 110, x2: 298, y2: 115 },
          { x1: 102, y1: 160, x2: 120, y2: 155 },
        ].map((line, i) => (
          <line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="rgba(165, 197, 198, 0.4)"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        ))}
        
        {/* Chat bubbles with glass effect */}
        {[
          { x: 340, y: 60 },
          { x: 50, y: 200 },
        ].map((bubble, i) => (
          <g key={i}>
            <rect x={bubble.x - 20} y={bubble.y} width="40" height="24" rx="8" fill="rgba(255, 255, 255, 0.08)" filter="url(#glass-blur-collab)" />
            <rect x={bubble.x - 20} y={bubble.y} width="40" height="24" rx="8" fill="rgba(165, 197, 198, 0.15)" stroke="rgba(165, 197, 198, 0.3)" strokeWidth="1.5" />
            <circle cx={bubble.x - 10} cy={bubble.y + 12} r="2" fill="#A5C5C6" />
            <circle cx={bubble.x} cy={bubble.y + 12} r="2" fill="#A5C5C6" />
            <circle cx={bubble.x + 10} cy={bubble.y + 12} r="2" fill="#A5C5C6" />
          </g>
        ))}
        
        {/* Animated notification badge - appears, increments, resolves to check, disappears, loops */}
        <motion.g
          animate={{
            scale: [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            opacity: [0, 1, 1, 1, 1, 1, 1, 1, 1, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            times: [0, 0.1, 0.25, 0.4, 0.55, 0.7, 0.75, 0.9, 0.95, 1]
          }}
        >
          {/* Badge glow */}
          <motion.circle 
            cx="270" 
            cy="70" 
            r="14" 
            fill="#EF4444" 
            opacity="0.3" 
            filter="url(#glass-blur-collab)"
          />
          
          {/* Badge background */}
          <circle cx="270" cy="70" r="12" fill="#EF4444" style={{ filter: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.6))' }} />
          
          {/* Number 1 (0-2.5s) */}
          <motion.text 
            x="270" 
            y="75" 
            textAnchor="middle" 
            className="text-xs font-bold" 
            fill="white"
            animate={{
              opacity: [1, 1, 0]
            }}
            transition={{
              duration: 8,
              times: [0, 0.25, 0.3],
              repeat: Infinity
            }}
          >
            1
          </motion.text>
          
          {/* Number 2 (2.5-4.5s) */}
          <motion.text 
            x="270" 
            y="75" 
            textAnchor="middle" 
            className="text-xs font-bold" 
            fill="white"
            animate={{
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              duration: 8,
              times: [0, 0.3, 0.5, 0.55],
              repeat: Infinity
            }}
          >
            2
          </motion.text>
          
          {/* Number 3 (4.5-6s) */}
          <motion.text 
            x="270" 
            y="75" 
            textAnchor="middle" 
            className="text-xs font-bold" 
            fill="white"
            animate={{
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              duration: 8,
              times: [0, 0.55, 0.7, 0.72],
              repeat: Infinity
            }}
          >
            3
          </motion.text>
          
          {/* Check mark (6-7.5s) - appears when number disappears */}
          <motion.g
            animate={{
              opacity: [0, 0, 1, 1, 1],
              scale: [0, 0, 1.2, 1, 1]
            }}
            transition={{
              duration: 8,
              times: [0, 0.7, 0.75, 0.8, 0.9],
              repeat: Infinity
            }}
          >
            {/* Change badge to green */}
            <circle cx="270" cy="70" r="12" fill="#DCFDBC" style={{ filter: 'drop-shadow(0 0 6px rgba(220, 253, 188, 0.8))' }} />
            <path
              d="M 266 70 L 269 73 L 274 67"
              stroke="#0F323D"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.g>
        </motion.g>
      </svg>
      
      {/* Glass overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5 pointer-events-none" />
    </div>
  );
}
