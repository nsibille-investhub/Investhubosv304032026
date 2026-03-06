import { motion } from 'motion/react';

export function ContinuousMonitoringIllustration() {
  return (
    <div className="relative w-full h-64 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F323D 0%, #1D3943 50%, #2A4A54 100%)' }}>
      {/* Animated background grid */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(220, 253, 188, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(220, 253, 188, 0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
        animate={{
          x: [0, 20],
          y: [0, 20],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 250">
        <defs>
          <linearGradient id="timelineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(165, 197, 198, 0.3)" />
            <stop offset="50%" stopColor="rgba(220, 253, 188, 1)" />
            <stop offset="100%" stopColor="rgba(165, 197, 198, 0.3)" />
          </linearGradient>
          <filter id="pulseGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Timeline base */}
        <line x1="50" y1="125" x2="350" y2="125" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="2" strokeDasharray="5 5" />

        {/* Timeline points with events */}
        {[
          { x: 80, label: 'J-30', status: 'ok', delay: 0.2 },
          { x: 140, label: 'J-15', status: 'ok', delay: 0.4 },
          { x: 200, label: 'J-7', status: 'warning', delay: 0.6 },
          { x: 260, label: 'J-1', status: 'alert', delay: 0.8 },
          { x: 320, label: 'Now', status: 'active', delay: 1 },
        ].map((point, i) => {
          const colors = {
            ok: '#10B981',
            warning: '#F59E0B',
            alert: '#EF4444',
            active: '#DCFDBC'
          };
          const color = colors[point.status as keyof typeof colors];

          return (
            <motion.g
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: point.delay, type: "spring", stiffness: 200 }}
            >
              {/* Timeline dot */}
              <motion.circle
                cx={point.x}
                cy="125"
                r="6"
                fill={color}
                filter="url(#pulseGlow)"
                animate={point.status === 'active' ? {
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.5, 1]
                } : {}}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Outer ring for active */}
              {point.status === 'active' && (
                <motion.circle
                  cx={point.x}
                  cy="125"
                  r="10"
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  initial={{ r: 10, opacity: 0.8 }}
                  animate={{
                    r: 20,
                    opacity: 0
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                />
              )}

              {/* Label */}
              <text x={point.x} y="145" textAnchor="middle" className="text-xs" fill="rgba(255, 255, 255, 0.6)">
                {point.label}
              </text>

              {/* Event cards */}
              {point.status !== 'ok' && (
                <motion.g
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: point.delay + 0.3 }}
                >
                  <rect 
                    x={point.x - 25} 
                    y="60" 
                    width="50" 
                    height="40" 
                    rx="8" 
                    fill="rgba(255, 255, 255, 0.08)" 
                    stroke={color} 
                    strokeWidth="2"
                  />
                  
                  {/* Alert icon */}
                  <motion.circle
                    cx={point.x}
                    cy="75"
                    r="8"
                    fill={color}
                    opacity="0.3"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.1, 0.3]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: point.delay
                    }}
                  />
                  <text x={point.x} y="79" textAnchor="middle" className="text-xs font-bold" fill="#FFFFFF">!</text>
                  
                  {/* Count */}
                  <text x={point.x} y="93" textAnchor="middle" className="text-xs font-bold" fill={color}>
                    {point.status === 'warning' ? '2' : point.status === 'alert' ? '5' : '...'}
                  </text>
                </motion.g>
              )}
            </motion.g>
          );
        })}

        {/* Progress indicator */}
        <motion.line
          x1="50"
          y1="125"
          x2="50"
          y2="125"
          stroke="url(#timelineGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          filter="url(#pulseGlow)"
          animate={{ x2: 320 }}
          transition={{ delay: 0.5, duration: 2, ease: "easeInOut" }}
        />

        {/* Live monitoring indicator - top left */}
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.2, type: "spring" }}
        >
          <rect x="30" y="30" width="90" height="28" rx="14" fill="rgba(16, 185, 129, 0.2)" stroke="#10B981" strokeWidth="2" />
          
          <motion.circle
            cx="50"
            cy="44"
            r="5"
            fill="#10B981"
            filter="url(#pulseGlow)"
            animate={{
              opacity: [1, 0.3, 1],
              scale: [1, 1.3, 1]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          
          <text x="62" y="48" className="text-xs font-bold" fill="#FFFFFF">LIVE 24/7</text>
        </motion.g>

        {/* Activity stream - right side */}
        <motion.g
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <rect x="260" y="160" width="120" height="70" rx="10" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(220, 253, 188, 0.3)" strokeWidth="2" />
          
          <text x="270" y="177" className="text-xs font-bold" fill="rgba(255, 255, 255, 0.7)">Activity</text>
          
          {/* Activity bars */}
          {[
            { width: 80, color: '#10B981', y: 185, delay: 1.5 },
            { width: 60, color: '#3B82F6', y: 195, delay: 1.6 },
            { width: 90, color: '#F59E0B', y: 205, delay: 1.7 },
            { width: 70, color: '#8B5CF6', y: 215, delay: 1.8 },
          ].map((bar, i) => (
            <motion.g key={i}>
              <rect x="270" y={bar.y} width="100" height="6" rx="3" fill="rgba(255, 255, 255, 0.1)" />
              <motion.rect
                x="270"
                y={bar.y}
                width="0"
                height="6"
                rx="3"
                fill={bar.color}
                animate={{ width: bar.width }}
                transition={{ delay: bar.delay, duration: 0.8, ease: "easeOut" }}
              />
            </motion.g>
          ))}
        </motion.g>

        {/* Notification badges */}
        {[
          { x: 140, y: 40, count: 3, color: '#F59E0B', delay: 1.6 },
          { x: 200, y: 30, count: 7, color: '#EF4444', delay: 1.8 },
        ].map((notif, i) => (
          <motion.g
            key={i}
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: notif.delay, type: "spring", stiffness: 300 }}
          >
            <motion.circle
              cx={notif.x}
              cy={notif.y}
              r="12"
              fill={notif.color}
              filter="url(#pulseGlow)"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: notif.delay
              }}
            />
            <text x={notif.x} y={notif.y + 4} textAnchor="middle" className="text-xs font-bold" fill="#FFFFFF">
              {notif.count}
            </text>
          </motion.g>
        ))}

        {/* Auto-scan indicator */}
        <motion.g
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.3 }}
        >
          <rect x="30" y="170" width="100" height="50" rx="10" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="2" />
          
          <text x="40" y="188" className="text-xs" fill="rgba(255, 255, 255, 0.6)">Next scan</text>
          
          <motion.text 
            x="40" 
            y="208" 
            className="text-lg font-bold" 
            fill="#8B5CF6"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            2h 34m
          </motion.text>
          
          {/* Clock icon */}
          <circle cx="110" cy="195" r="12" fill="none" stroke="#8B5CF6" strokeWidth="2" opacity="0.6" />
          <motion.line 
            x1="110" 
            y1="195" 
            x2="110" 
            y2="188" 
            stroke="#8B5CF6" 
            strokeWidth="2" 
            strokeLinecap="round"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "110px 195px" }}
          />
          <line x1="110" y1="195" x2="115" y2="195" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
        </motion.g>

        {/* Scanning wave effect */}
        <motion.line
          x1="320"
          y1="60"
          x2="320"
          y2="150"
          stroke="#DCFDBC"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.6"
          initial={{ x1: 50, x2: 50 }}
          animate={{ x1: 350, x2: 350 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 2
          }}
        />
      </svg>

      {/* Glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5 pointer-events-none" />
    </div>
  );
}
