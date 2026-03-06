import { motion } from 'motion/react';

export function SmartClassificationIllustration() {
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
          <linearGradient id="classifyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.15)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
          </linearGradient>
          <filter id="classify-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
        </defs>
        
        {/* Unorganized documents on left */}
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Random scattered documents */}
          {[
            { x: 40, y: 60, rotate: -8 },
            { x: 70, y: 90, rotate: 12 },
            { x: 50, y: 130, rotate: -5 },
            { x: 90, y: 150, rotate: 15 },
            { x: 60, y: 170, rotate: -10 }
          ].map((doc, i) => (
            <motion.g
              key={i}
              initial={{ opacity: 0, x: 200, y: 125 }}
              animate={{ 
                opacity: 1, 
                x: doc.x, 
                y: doc.y,
                rotate: doc.rotate 
              }}
              transition={{ 
                delay: 0.2 + i * 0.15, 
                duration: 0.8,
                type: "spring",
                stiffness: 100
              }}
            >
              <rect 
                width="35" 
                height="45" 
                rx="4" 
                fill="url(#classifyGradient)" 
                filter="url(#classify-blur)"
              />
              <rect 
                width="35" 
                height="45" 
                rx="4" 
                fill="rgba(255, 255, 255, 0.1)" 
                stroke="rgba(165, 197, 198, 0.5)" 
                strokeWidth="1.5" 
              />
              {/* Document lines */}
              <rect x="5" y="8" width="25" height="2" rx="1" fill="rgba(165, 197, 198, 0.4)" />
              <rect x="5" y="14" width="20" height="2" rx="1" fill="rgba(165, 197, 198, 0.4)" />
              <rect x="5" y="20" width="22" height="2" rx="1" fill="rgba(165, 197, 198, 0.4)" />
            </motion.g>
          ))}
        </motion.g>
        
        {/* AI processing center */}
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.2, type: "spring", stiffness: 150 }}
        >
          {/* Central AI node with glow */}
          <motion.circle 
            cx="200" 
            cy="125" 
            r="35" 
            fill="#DCFDBC" 
            opacity="0.2"
            filter="url(#classify-blur)"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <circle 
            cx="200" 
            cy="125" 
            r="28" 
            fill="rgba(255, 255, 255, 0.1)" 
            filter="url(#classify-blur)"
          />
          <circle 
            cx="200" 
            cy="125" 
            r="28" 
            fill="rgba(220, 253, 188, 0.2)" 
            stroke="#DCFDBC" 
            strokeWidth="2"
          />
          
          {/* AI icon */}
          <text 
            x="200" 
            y="132" 
            textAnchor="middle" 
            className="text-sm font-bold" 
            fill="#FFFFFF"
            style={{ filter: 'drop-shadow(0 0 4px rgba(220, 253, 188, 0.6))' }}
          >
            AI
          </text>
          
          {/* Rotating connection lines */}
          {[0, 1, 2].map((i) => (
            <motion.line
              key={i}
              x1="200"
              y1="125"
              x2="200"
              y2="80"
              stroke="#A5C5C6"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.5"
              initial={{ rotate: i * 120 }}
              animate={{ rotate: i * 120 + 360 }}
              style={{ transformOrigin: '200px 125px' }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </motion.g>
        
        {/* Organized folders on right */}
        <motion.g
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          {/* Folder categories */}
          {[
            { y: 50, label: 'Fonds A', color: '#DCFDBC', docs: 2 },
            { y: 100, label: 'Closing 2024', color: '#A5C5C6', docs: 3 },
            { y: 150, label: 'KYC Docs', color: '#DCFDBC', docs: 2 },
          ].map((folder, i) => (
            <motion.g
              key={i}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.8 + i * 0.2, duration: 0.5 }}
            >
              {/* Folder */}
              <rect 
                x="280" 
                y={folder.y} 
                width="90" 
                height="35" 
                rx="4" 
                fill="url(#classifyGradient)" 
                filter="url(#classify-blur)"
              />
              <rect 
                x="280" 
                y={folder.y} 
                width="90" 
                height="35" 
                rx="4" 
                fill="rgba(255, 255, 255, 0.12)" 
                stroke={folder.color} 
                strokeWidth="2" 
              />
              
              {/* Folder tab */}
              <path 
                d={`M 285 ${folder.y} L 285 ${folder.y - 5} L 310 ${folder.y - 5} L 315 ${folder.y} Z`}
                fill={folder.color}
                opacity="0.4"
              />
              
              {/* Folder label */}
              <text 
                x="325" 
                y={folder.y + 15} 
                textAnchor="middle" 
                className="text-[9px] font-semibold" 
                fill="#FFFFFF"
              >
                {folder.label}
              </text>
              
              {/* Document count badge */}
              <motion.circle
                cx="360"
                cy={folder.y + 10}
                r="8"
                fill={folder.color}
                opacity="0.8"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2 + i * 0.2, type: "spring" }}
              />
              <text 
                x="360" 
                y={folder.y + 14} 
                textAnchor="middle" 
                className="text-[8px] font-bold" 
                fill="#0F323D"
              >
                {folder.docs}
              </text>
              
              {/* Small document icons inside folder */}
              {Array.from({ length: folder.docs }).map((_, docIdx) => (
                <motion.rect
                  key={docIdx}
                  x={288 + docIdx * 12}
                  y={folder.y + 20}
                  width="8"
                  height="10"
                  rx="1"
                  fill="rgba(255, 255, 255, 0.3)"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 2.2 + i * 0.2 + docIdx * 0.1, type: "spring" }}
                />
              ))}
            </motion.g>
          ))}
        </motion.g>
        
        {/* Connection arrows from center to folders */}
        {[
          { x1: 228, y1: 105, x2: 275, y2: 65 },
          { x1: 228, y1: 125, x2: 275, y2: 115 },
          { x1: 228, y1: 145, x2: 275, y2: 165 }
        ].map((arrow, i) => (
          <motion.g key={i}>
            <motion.line
              x1={arrow.x1}
              y1={arrow.y1}
              x2={arrow.x2}
              y2={arrow.y2}
              stroke="#DCFDBC"
              strokeWidth="2"
              strokeDasharray="4 2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ delay: 1.6 + i * 0.15, duration: 0.8 }}
              style={{ filter: 'drop-shadow(0 0 2px rgba(220, 253, 188, 0.6))' }}
            />
            {/* Arrow head */}
            <motion.polygon
              points={`${arrow.x2},${arrow.y2} ${arrow.x2-5},${arrow.y2-3} ${arrow.x2-5},${arrow.y2+3}`}
              fill="#DCFDBC"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 2 + i * 0.15 }}
            />
          </motion.g>
        ))}
        
        {/* Matching indicators - entity linking */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          {/* Link icon between folders */}
          <motion.g
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <circle cx="325" cy="210" r="12" fill="rgba(165, 197, 198, 0.3)" />
            <path 
              d="M 320 207 L 320 213 M 330 207 L 330 213 M 323 210 L 327 210"
              stroke="#DCFDBC"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ filter: 'drop-shadow(0 0 2px rgba(220, 253, 188, 0.6))' }}
            />
          </motion.g>
          
          <text 
            x="325" 
            y="235" 
            textAnchor="middle" 
            className="text-[8px]" 
            fill="rgba(255, 255, 255, 0.7)"
          >
            Auto-linking
          </text>
        </motion.g>
      </svg>
      
      {/* Glass overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5 pointer-events-none" />
    </div>
  );
}
