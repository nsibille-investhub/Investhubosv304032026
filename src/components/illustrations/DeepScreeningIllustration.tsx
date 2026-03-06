import { motion } from 'motion/react';

export function DeepScreeningIllustration() {
  return (
    <div className="relative w-full h-64 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F323D 0%, #1D3943 50%, #2A4A54 100%)' }}>
      {/* Background stars */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => {
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          const size = Math.random() * 2 + 0.5;
          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${size}px`,
                height: `${size}px`,
                background: '#DCFDBC',
                boxShadow: `0 0 ${size * 2}px #DCFDBC`,
              }}
              animate={{
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
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
          <linearGradient id="dbGradient" x1="0%" y1="0%" x2="100%\" y2="100%">
            <stop offset="0%" stopColor="rgba(220, 253, 188, 0.3)" />
            <stop offset="100%" stopColor="rgba(165, 197, 198, 0.3)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Central search icon */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <circle cx="200" cy="125" r="30" fill="url(#dbGradient)" filter="url(#glow)" />
          <circle cx="200" cy="125" r="25" fill="rgba(255, 255, 255, 0.1)" stroke="#DCFDBC" strokeWidth="2" />
          
          {/* Magnifying glass */}
          <circle cx="198" cy="120" r="12" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
          <motion.line 
            x1="207" 
            y1="129" 
            x2="215" 
            y2="137" 
            stroke="#FFFFFF" 
            strokeWidth="2.5" 
            strokeLinecap="round"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: '207px 129px' }}
          />
        </motion.g>

        {/* Database nodes in circular layout */}
        {[
          { angle: 0, label: 'PEP', color: '#EF4444', delay: 0.3 },
          { angle: 60, label: 'Sanctions', color: '#F59E0B', delay: 0.4 },
          { angle: 120, label: 'UBO', color: '#3B82F6', delay: 0.5 },
          { angle: 180, label: 'Media', color: '#8B5CF6', delay: 0.6 },
          { angle: 240, label: 'Watch', color: '#EC4899', delay: 0.7 },
          { angle: 300, label: 'Reg.', color: '#10B981', delay: 0.8 },
        ].map((db, i) => {
          const radius = 90;
          const angleRad = (db.angle * Math.PI) / 180;
          const x = 200 + Math.cos(angleRad) * radius;
          const y = 125 + Math.sin(angleRad) * radius;

          return (
            <motion.g
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: db.delay, type: "spring", stiffness: 200 }}
            >
              {/* Connection line */}
              <motion.line
                x1="200"
                y1="125"
                x2={x}
                y2={y}
                stroke="rgba(220, 253, 188, 0.3)"
                strokeWidth="1.5"
                strokeDasharray="4 2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.5 }}
                transition={{ delay: db.delay, duration: 0.8 }}
              />

              {/* Data pulse */}
              <motion.circle
                cx="200"
                cy="125"
                r="3"
                fill={db.color}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  cx: [200, x],
                  cy: [125, y],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: db.delay + 1,
                  ease: "linear"
                }}
              />

              {/* Database node */}
              <motion.circle
                cx={x}
                cy={y}
                r="18"
                fill="rgba(255, 255, 255, 0.1)"
                stroke={db.color}
                strokeWidth="2"
                whileHover={{ scale: 1.2 }}
              />
              <motion.circle
                cx={x}
                cy={y}
                r="12"
                fill={db.color}
                opacity="0.3"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.1, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: db.delay,
                  ease: "easeInOut"
                }}
              />
              
              {/* Database icon */}
              <rect x={x - 6} y={y - 8} width="12" height="4" rx="1" fill="#FFFFFF" opacity="0.9" />
              <rect x={x - 6} y={y - 2} width="12" height="4" rx="1" fill="#FFFFFF" opacity="0.7" />
              <rect x={x - 6} y={y + 4} width="12" height="4" rx="1" fill="#FFFFFF" opacity="0.5" />
            </motion.g>
          );
        })}

        {/* Scanning effect */}
        <motion.circle
          cx="200"
          cy="125"
          r="30"
          fill="none"
          stroke="#DCFDBC"
          strokeWidth="2"
          opacity="0.6"
          initial={{ r: 30, opacity: 0.6 }}
          animate={{
            r: 100,
            opacity: 0,
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />

        {/* Results counter */}
        <motion.g
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <rect x="280" y="30" width="100" height="50" rx="10" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(220, 253, 188, 0.5)" strokeWidth="2" />
          <text x="330" y="50" textAnchor="middle" className="text-xs font-bold" fill="#DCFDBC">
            Sources
          </text>
          <motion.text 
            x="330" 
            y="68" 
            textAnchor="middle" 
            className="text-xl font-bold" 
            fill="#FFFFFF"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            6/6
          </motion.text>
        </motion.g>

        {/* Status indicator */}
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.2, type: "spring" }}
        >
          <rect x="30" y="40" width="80" height="30" rx="15" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(16, 185, 129, 0.6)" strokeWidth="2" />
          <motion.circle
            cx="50"
            cy="55"
            r="6"
            fill="#10B981"
            animate={{
              opacity: [1, 0.3, 1],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <text x="64" y="59" className="text-xs font-bold" fill="#FFFFFF">Active</text>
        </motion.g>
      </svg>

      {/* Glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5 pointer-events-none" />
    </div>
  );
}
