import { motion } from 'motion/react';

export function RiskScoringIllustration() {
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
          background: 'radial-gradient(circle at 50% 80%, rgba(220, 253, 188, 0.15) 0%, transparent 50%)'
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
          background: 'radial-gradient(circle at 20% 30%, rgba(165, 197, 198, 0.1) 0%, transparent 50%)'
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
        {/* Risk gauge background */}
        <defs>
          <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#DCFDBC" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
          <linearGradient id="needleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#DCFDBC" />
            <stop offset="100%" stopColor="#A5C5C6" />
          </linearGradient>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
        
        {/* Gauge glow background */}
        <motion.path
          d="M 100 180 A 100 100 0 0 1 300 180"
          fill="none"
          stroke="rgba(220, 253, 188, 0.3)"
          strokeWidth="28"
          strokeLinecap="round"
          filter="url(#glass-blur)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Gauge arc background */}
        <motion.path
          d="M 100 180 A 100 100 0 0 1 300 180"
          fill="none"
          stroke="rgba(165, 197, 198, 0.2)"
          strokeWidth="20"
          strokeLinecap="round"
        />
        
        {/* Animated gauge arc with gradient - fills from 0 to 75% */}
        <motion.path
          d="M 100 180 A 100 100 0 0 1 300 180"
          fill="none"
          stroke="url(#riskGradient)"
          strokeWidth="20"
          strokeLinecap="round"
          animate={{ pathLength: [0, 0.75, 0] }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.7, 1]
          }}
          style={{ filter: 'drop-shadow(0 0 8px rgba(220, 253, 188, 0.4))' }}
        />
        
        {/* Risk markers removed as requested */}
        
        {/* Animated needle - rotates from -90° (0 score) to ~45° (75 score) */}
        <motion.g
          animate={{ rotate: [-90, 45, -90] }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.7, 1]
          }}
          style={{ transformOrigin: '200px 180px' }}
        >
          {/* Needle shadow */}
          <motion.line 
            x1="200" 
            y1="180" 
            x2="200" 
            y2="95" 
            stroke="rgba(0, 0, 0, 0.3)" 
            strokeWidth="4" 
            strokeLinecap="round"
            filter="url(#glass-blur)"
          />
          {/* Gradient needle */}
          <line 
            x1="200" 
            y1="180" 
            x2="200" 
            y2="95" 
            stroke="url(#needleGradient)" 
            strokeWidth="3" 
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 4px rgba(220, 253, 188, 0.6))' }}
          />
          {/* Center point glow */}
          <circle 
            cx="200" 
            cy="180" 
            r="12" 
            fill="#DCFDBC" 
            opacity="0.3"
            filter="url(#glass-blur)"
          />
          <circle 
            cx="200" 
            cy="180" 
            r="8" 
            fill="rgba(255, 255, 255, 0.1)" 
          />
          <circle 
            cx="200" 
            cy="180" 
            r="8" 
            fill="#DCFDBC" 
            opacity="0.4"
          />
          <circle 
            cx="200" 
            cy="180" 
            r="8" 
            fill="none"
            stroke="#DCFDBC" 
            strokeWidth="2"
          />
        </motion.g>
        
        {/* Score display with glass effect - animates from 0 to 75 */}
        <motion.g>
          {/* Score glow */}
          <motion.rect 
            x="165" 
            y="140" 
            width="70" 
            height="35" 
            rx="8" 
            fill="#DCFDBC" 
            opacity="0.2"
            filter="url(#glass-blur)"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.2, 0.35, 0.2]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {/* Glass background */}
          <rect 
            x="165" 
            y="140" 
            width="70" 
            height="35" 
            rx="8" 
            fill="url(#scoreGradient)" 
            filter="url(#glass-blur)"
          />
          <rect 
            x="165" 
            y="140" 
            width="70" 
            height="35" 
            rx="8" 
            fill="rgba(255, 255, 255, 0.1)" 
            stroke="rgba(220, 253, 188, 0.6)" 
            strokeWidth="2" 
          />
          {/* Score text with gradient */}
          <defs>
            <linearGradient id="scoreTextGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DCFDBC" />
              <stop offset="100%" stopColor="#A5C5C6" />
            </linearGradient>
          </defs>
          
          {/* Animated score numbers */}
          {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75].map((score, index) => {
            const startTime = index / 16 * 0.7; // Distribute across 70% of animation
            const endTime = startTime + 0.05;
            return (
              <motion.text 
                key={score}
                x="200" 
                y="160" 
                textAnchor="middle" 
                className="text-2xl font-bold" 
                fill="url(#scoreTextGradient)"
                style={{ filter: 'drop-shadow(0 0 4px rgba(220, 253, 188, 0.6))' }}
                animate={{
                  opacity: index === 0 ? [1, 1, 0] : [0, 1, 1, 0]
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  times: index === 0 ? [0, startTime, endTime] : [0, startTime, startTime + 0.03, endTime],
                  ease: "linear"
                }}
              >
                {score}
              </motion.text>
            );
          })}
          
          <text 
            x="200" 
            y="170" 
            textAnchor="middle" 
            className="text-[8px]" 
            fill="rgba(165, 197, 198, 0.8)"
          >
            SCORE
          </text>
        </motion.g>
        
        {/* Workflow indicators - animated sequence: Fast Track -> Standard -> Enhanced */}
        
        {/* Fast Track (appears 0-25, score 0-25) */}
        <motion.g
          animate={{
            opacity: [0, 1, 1, 0, 0, 0],
            y: [-10, 0, 0, -10, -10, -10]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            times: [0, 0.05, 0.22, 0.27, 0.7, 1],
            ease: "easeInOut"
          }}
        >
          {/* Glow behind badge */}
          <motion.rect 
            x="165" 
            y="50" 
            width="70" 
            height="22" 
            rx="11" 
            fill="#DCFDBC"
            opacity="0.25"
            filter="url(#glass-blur)"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.2, 0.35, 0.2]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {/* Glass background */}
          <rect 
            x="165" 
            y="50" 
            width="70" 
            height="22" 
            rx="11" 
            fill="rgba(255, 255, 255, 0.08)"
            filter="url(#glass-blur)"
          />
          <rect 
            x="165" 
            y="50" 
            width="70" 
            height="22" 
            rx="11" 
            fill="rgba(255, 255, 255, 0.12)"
            stroke="#DCFDBC"
            strokeWidth="2"
          />
          <text 
            x="200" 
            y="64" 
            textAnchor="middle" 
            className="text-[10px] font-bold" 
            fill="#FFFFFF"
            style={{ filter: 'drop-shadow(0 0 4px #DCFDBC)' }}
          >
            Fast Track
          </text>
        </motion.g>
        
        {/* Standard (appears 25-50, score 25-50) */}
        <motion.g
          animate={{
            opacity: [0, 0, 0, 1, 1, 0, 0],
            y: [-10, -10, -10, 0, 0, -10, -10]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            times: [0, 0.22, 0.27, 0.32, 0.47, 0.52, 1],
            ease: "easeInOut"
          }}
        >
          {/* Glow behind badge */}
          <motion.rect 
            x="165" 
            y="50" 
            width="70" 
            height="22" 
            rx="11" 
            fill="#F59E0B"
            opacity="0.25"
            filter="url(#glass-blur)"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.2, 0.35, 0.2]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {/* Glass background */}
          <rect 
            x="165" 
            y="50" 
            width="70" 
            height="22" 
            rx="11" 
            fill="rgba(255, 255, 255, 0.08)"
            filter="url(#glass-blur)"
          />
          <rect 
            x="165" 
            y="50" 
            width="70" 
            height="22" 
            rx="11" 
            fill="rgba(255, 255, 255, 0.12)"
            stroke="#F59E0B"
            strokeWidth="2"
          />
          <text 
            x="200" 
            y="64" 
            textAnchor="middle" 
            className="text-[10px] font-bold" 
            fill="#FFFFFF"
            style={{ filter: 'drop-shadow(0 0 4px #F59E0B)' }}
          >
            Standard
          </text>
        </motion.g>
        
        {/* Enhanced (appears 50-75, score 50-75) */}
        <motion.g
          animate={{
            opacity: [0, 0, 0, 1, 1, 0],
            y: [-10, -10, -10, 0, 0, -10]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            times: [0, 0.47, 0.52, 0.57, 0.67, 0.72],
            ease: "easeInOut"
          }}
        >
          {/* Glow behind badge */}
          <motion.rect 
            x="162" 
            y="50" 
            width="76" 
            height="22" 
            rx="11" 
            fill="#A5C5C6"
            opacity="0.25"
            filter="url(#glass-blur)"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.2, 0.35, 0.2]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {/* Glass background */}
          <rect 
            x="162" 
            y="50" 
            width="76" 
            height="22" 
            rx="11" 
            fill="rgba(255, 255, 255, 0.08)"
            filter="url(#glass-blur)"
          />
          <rect 
            x="162" 
            y="50" 
            width="76" 
            height="22" 
            rx="11" 
            fill="rgba(255, 255, 255, 0.12)"
            stroke="#A5C5C6"
            strokeWidth="2"
          />
          <text 
            x="200" 
            y="64" 
            textAnchor="middle" 
            className="text-[10px] font-bold" 
            fill="#FFFFFF"
            style={{ filter: 'drop-shadow(0 0 4px #A5C5C6)' }}
          >
            Enhanced
          </text>
        </motion.g>
        
        {/* Pulsing particles around gauge */}
        {[
          { angle: 30, delay: 0 },
          { angle: 90, delay: 0.5 },
          { angle: 150, delay: 1 }
        ].map((particle, i) => {
          const x = 200 + Math.cos((particle.angle * Math.PI) / 180) * 105;
          const y = 180 + Math.sin((particle.angle * Math.PI) / 180) * 105;
          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="#DCFDBC"
              style={{ filter: 'drop-shadow(0 0 4px rgba(220, 253, 188, 0.8))' }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                delay: 2 + particle.delay,
                duration: 2,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut"
              }}
            />
          );
        })}
      </svg>
      
      {/* Glass overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5 pointer-events-none" />
    </div>
  );
}
