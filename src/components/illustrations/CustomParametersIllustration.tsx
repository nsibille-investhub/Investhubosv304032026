import { motion } from 'motion/react';

export function CustomParametersIllustration() {
  return (
    <div className="relative w-full h-64 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F323D 0%, #1D3943 50%, #2A4A54 100%)' }}>
      {/* Background particles */}
      <div className="absolute inset-0">
        {[...Array(25)].map((_, i) => {
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          const size = Math.random() * 3 + 1;
          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${size}px`,
                height: `${size}px`,
                background: 'rgba(165, 197, 198, 0.4)',
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
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
          <linearGradient id="sliderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(165, 197, 198, 0.3)" />
            <stop offset="50%" stopColor="rgba(220, 253, 188, 0.8)" />
            <stop offset="100%" stopColor="rgba(165, 197, 198, 0.3)" />
          </linearGradient>
          <filter id="controlGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Control Panel Background */}
        <motion.g
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <rect x="50" y="40" width="300" height="170" rx="15" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(220, 253, 188, 0.3)" strokeWidth="2" />
        </motion.g>

        {/* Slider 1 - Sensitivity */}
        <motion.g
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <text x="70" y="70" className="text-xs" fill="rgba(255, 255, 255, 0.7)">Sensibilité</text>
          
          {/* Slider track */}
          <rect x="70" y="80" width="250" height="6" rx="3" fill="rgba(255, 255, 255, 0.1)" />
          
          {/* Slider fill */}
          <motion.rect 
            x="70" 
            y="80" 
            width="0" 
            height="6" 
            rx="3" 
            fill="url(#sliderGradient)"
            animate={{ width: 180 }}
            transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
          />
          
          {/* Slider thumb */}
          <motion.circle
            cx="70"
            cy="83"
            r="8"
            fill="#DCFDBC"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="2"
            filter="url(#controlGlow)"
            animate={{ cx: 250 }}
            transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
            whileHover={{ scale: 1.3 }}
          />
          
          {/* Value indicator */}
          <motion.text 
            x="260" 
            y="85" 
            className="text-xs font-bold" 
            fill="#DCFDBC"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            72%
          </motion.text>
        </motion.g>

        {/* Slider 2 - Match Score */}
        <motion.g
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <text x="70" y="115" className="text-xs" fill="rgba(255, 255, 255, 0.7)">Score minimum</text>
          
          <rect x="70" y="125" width="250" height="6" rx="3" fill="rgba(255, 255, 255, 0.1)" />
          
          <motion.rect 
            x="70" 
            y="125" 
            width="0" 
            height="6" 
            rx="3" 
            fill="url(#sliderGradient)"
            animate={{ width: 200 }}
            transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
          />
          
          <motion.circle
            cx="70"
            cy="128"
            r="8"
            fill="#DCFDBC"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="2"
            filter="url(#controlGlow)"
            animate={{ cx: 270 }}
            transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
            whileHover={{ scale: 1.3 }}
          />
          
          <motion.text 
            x="280" 
            y="130" 
            className="text-xs font-bold" 
            fill="#DCFDBC"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            80%
          </motion.text>
        </motion.g>

        {/* Toggle switches */}
        {[
          { y: 160, label: 'Auto-review', enabled: true, delay: 0.6 },
          { y: 185, label: 'Smart filtering', enabled: true, delay: 0.7 },
        ].map((toggle, i) => (
          <motion.g
            key={i}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: toggle.delay }}
          >
            <text x="70" y={toggle.y + 5} className="text-xs" fill="rgba(255, 255, 255, 0.7)">
              {toggle.label}
            </text>
            
            {/* Toggle background */}
            <rect 
              x="230" 
              y={toggle.y - 8} 
              width="40" 
              height="20" 
              rx="10" 
              fill={toggle.enabled ? "rgba(220, 253, 188, 0.3)" : "rgba(255, 255, 255, 0.1)"}
              stroke={toggle.enabled ? "#DCFDBC" : "rgba(255, 255, 255, 0.3)"}
              strokeWidth="2"
            />
            
            {/* Toggle thumb */}
            <motion.circle
              cx={toggle.enabled ? 260 : 240}
              cy={toggle.y + 2}
              r="7"
              fill={toggle.enabled ? "#DCFDBC" : "rgba(255, 255, 255, 0.5)"}
              filter="url(#controlGlow)"
              initial={{ cx: 240 }}
              animate={{ cx: toggle.enabled ? 260 : 240 }}
              transition={{ delay: toggle.delay + 0.3, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.2 }}
            />
          </motion.g>
        ))}

        {/* Settings icon */}
        <motion.g
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
        >
          <circle cx="330" cy="175" r="20" fill="rgba(139, 92, 246, 0.2)" stroke="#8B5CF6" strokeWidth="2" />
          
          {/* Gear teeth */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 330 + Math.cos(rad) * 14;
            const y1 = 175 + Math.sin(rad) * 14;
            const x2 = 330 + Math.cos(rad) * 18;
            const y2 = 175 + Math.sin(rad) * 18;
            
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#8B5CF6"
                strokeWidth="3"
                strokeLinecap="round"
              />
            );
          })}
          
          <circle cx="330" cy="175" r="8" fill="rgba(15, 50, 61, 0.8)" stroke="#8B5CF6" strokeWidth="2" />
          
          {/* Rotating animation */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "330px 175px" }}
          >
            <circle cx="330" cy="175" r="8" fill="none" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
          </motion.g>
        </motion.g>

        {/* AI Badge */}
        <motion.g
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 1, type: "spring" }}
        >
          <rect x="280" y="50" width="60" height="24" rx="12" fill="rgba(139, 92, 246, 0.3)" stroke="#8B5CF6" strokeWidth="2" />
          <text x="310" y="66" textAnchor="middle" className="text-xs font-bold" fill="#FFFFFF">AI ON</text>
          
          <motion.circle
            cx="292"
            cy="62"
            r="3"
            fill="#8B5CF6"
            animate={{
              opacity: [1, 0.3, 1],
              scale: [1, 1.5, 1]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.g>

        {/* Efficiency indicator */}
        <motion.g
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <text x="70" y="35" className="text-xs" fill="rgba(255, 255, 255, 0.5)">Faux positifs</text>
          <motion.text 
            x="150" 
            y="35" 
            className="text-xs font-bold" 
            fill="#10B981"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            -67% ↓
          </motion.text>
        </motion.g>
      </svg>

      {/* Glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5 pointer-events-none" />
    </div>
  );
}
