import { motion } from 'motion/react';

export function DataExtractionIllustration() {
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
          <linearGradient id="extractGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.15)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
          </linearGradient>
          <filter id="extract-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
          <filter id="extract-glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* PDF/Document stack on left */}
        <motion.g
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back documents */}
          {[0, 1, 2].map((i) => (
            <motion.g
              key={i}
              initial={{ x: -30 - i * 5, opacity: 0 }}
              animate={{ x: -i * 5, opacity: 0.3 + i * 0.1 }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
            >
              <rect 
                x={50 + i * 8} 
                y={50 + i * 8} 
                width="120" 
                height="150" 
                rx="8" 
                fill="url(#extractGradient)" 
                filter="url(#extract-blur)"
              />
              <rect 
                x={50 + i * 8} 
                y={50 + i * 8} 
                width="120" 
                height="150" 
                rx="8" 
                fill="rgba(255, 255, 255, 0.08)" 
                stroke="rgba(165, 197, 198, 0.4)" 
                strokeWidth="2" 
              />
            </motion.g>
          ))}
          
          {/* Front document with text lines */}
          <motion.g
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <rect 
              x="50" 
              y="50" 
              width="120" 
              height="150" 
              rx="8" 
              fill="url(#extractGradient)" 
              filter="url(#extract-blur)"
            />
            <rect 
              x="50" 
              y="50" 
              width="120" 
              height="150" 
              rx="8" 
              fill="rgba(255, 255, 255, 0.12)" 
              stroke="rgba(165, 197, 198, 0.6)" 
              strokeWidth="2" 
            />
            
            {/* Simulated text lines with varying opacity */}
            {[0, 1, 2, 3, 4, 5, 6].map((i) => {
              const width = 90 - (i % 3) * 10;
              return (
                <motion.rect
                  key={i}
                  x="65"
                  y={70 + i * 18}
                  width={width}
                  height="6"
                  rx="3"
                  fill="rgba(165, 197, 198, 0.5)"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width }}
                  transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
                />
              );
            })}
          </motion.g>
        </motion.g>
        
        {/* OCR/NLP scanning rays */}
        {[0, 1, 2, 3].map((i) => (
          <motion.line
            key={i}
            x1="170"
            y1={80 + i * 30}
            x2="210"
            y2={80 + i * 30}
            stroke="#DCFDBC"
            strokeWidth="2"
            strokeDasharray="4 4"
            initial={{ opacity: 0, x1: 170 }}
            animate={{ 
              opacity: [0, 1, 0],
              x1: [170, 190, 210]
            }}
            transition={{
              delay: 1 + i * 0.2,
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 2,
              ease: "easeInOut"
            }}
            style={{ filter: 'drop-shadow(0 0 4px rgba(220, 253, 188, 0.8))' }}
          />
        ))}
        
        {/* Extracted data fields on right */}
        <motion.g
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          {/* Data panel */}
          <rect 
            x="230" 
            y="50" 
            width="140" 
            height="150" 
            rx="8" 
            fill="url(#extractGradient)" 
            filter="url(#extract-blur)"
          />
          <rect 
            x="230" 
            y="50" 
            width="140" 
            height="150" 
            rx="8" 
            fill="rgba(255, 255, 255, 0.12)" 
            stroke="rgba(220, 253, 188, 0.5)" 
            strokeWidth="2" 
          />
          
          {/* Extracted fields */}
          {[
            { y: 70, label: 'Investisseur', color: '#DCFDBC', width: 100 },
            { y: 95, label: 'Fonds', color: '#A5C5C6', width: 80 },
            { y: 120, label: 'Montant', color: '#DCFDBC', width: 90 },
            { y: 145, label: 'Date', color: '#A5C5C6', width: 60 },
            { y: 170, label: 'Clause', color: '#DCFDBC', width: 110 },
          ].map((field, i) => (
            <motion.g
              key={i}
              initial={{ opacity: 0, y: field.y + 10 }}
              animate={{ opacity: 1, y: field.y }}
              transition={{ delay: 1.5 + i * 0.15, duration: 0.4 }}
            >
              {/* Field label */}
              <text 
                x="240" 
                y={field.y} 
                className="text-[9px]" 
                fill="rgba(255, 255, 255, 0.5)"
              >
                {field.label}
              </text>
              
              {/* Field value bar with glow */}
              <motion.rect
                x="240"
                y={field.y + 3}
                width={field.width}
                height="8"
                rx="4"
                fill={field.color}
                opacity="0.5"
                initial={{ width: 0 }}
                animate={{ width: field.width }}
                transition={{ delay: 1.6 + i * 0.15, duration: 0.5 }}
                style={{ filter: `drop-shadow(0 0 3px ${field.color})` }}
              />
            </motion.g>
          ))}
        </motion.g>
        
        {/* AI/OCR badge */}
        <motion.g
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1.8, type: "spring", stiffness: 150 }}
        >
          {/* Badge glow */}
          <motion.circle 
            cx="110" 
            cy="35" 
            r="25" 
            fill="#DCFDBC" 
            opacity="0.3"
            filter="url(#extract-blur)"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              delay: 2.2,
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <circle 
            cx="110" 
            cy="35" 
            r="18" 
            fill="rgba(255, 255, 255, 0.1)" 
            filter="url(#extract-blur)"
          />
          <circle 
            cx="110" 
            cy="35" 
            r="18" 
            fill="rgba(220, 253, 188, 0.25)" 
            stroke="#DCFDBC" 
            strokeWidth="2"
          />
          
          <text 
            x="110" 
            y="32" 
            textAnchor="middle" 
            className="text-[8px] font-bold" 
            fill="#FFFFFF"
          >
            OCR
          </text>
          <text 
            x="110" 
            y="42" 
            textAnchor="middle" 
            className="text-[7px]" 
            fill="rgba(255, 255, 255, 0.8)"
          >
            NLP
          </text>
        </motion.g>
        
        {/* Data particles flowing */}
        {[
          { x: 180, y: 80, delay: 0 },
          { x: 185, y: 110, delay: 0.3 },
          { x: 182, y: 140, delay: 0.6 },
          { x: 188, y: 170, delay: 0.9 }
        ].map((particle, i) => (
          <motion.circle
            key={i}
            r="3"
            fill="#DCFDBC"
            style={{ filter: 'drop-shadow(0 0 4px rgba(220, 253, 188, 0.8))' }}
            initial={{ 
              cx: 170,
              cy: particle.y,
              opacity: 0
            }}
            animate={{ 
              cx: 230,
              opacity: [0, 1, 0]
            }}
            transition={{
              delay: 2 + particle.delay,
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
