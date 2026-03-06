import { motion } from 'motion/react';

export function ComplianceControlsIllustration() {
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
          <linearGradient id="controlGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.15)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
          </linearGradient>
          <filter id="control-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
        </defs>
        
        {/* Control checklist panel */}
        <motion.g
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Main panel */}
          <rect 
            x="40" 
            y="40" 
            width="150" 
            height="170" 
            rx="8" 
            fill="url(#controlGradient)" 
            filter="url(#control-blur)"
          />
          <rect 
            x="40" 
            y="40" 
            width="150" 
            height="170" 
            rx="8" 
            fill="rgba(255, 255, 255, 0.12)" 
            stroke="rgba(165, 197, 198, 0.6)" 
            strokeWidth="2" 
          />
          
          {/* Title bar */}
          <rect 
            x="40" 
            y="40" 
            width="150" 
            height="30" 
            fill="rgba(220, 253, 188, 0.15)" 
          />
          <text 
            x="115" 
            y="60" 
            textAnchor="middle" 
            className="text-[10px] font-bold" 
            fill="#FFFFFF"
          >
            Contrôles Compliance
          </text>
          
          {/* Checkboxes and rules */}
          {[
            { y: 90, label: 'Validation montant', status: 'pass', delay: 0.3 },
            { y: 115, label: 'Vérif. identité', status: 'pass', delay: 0.5 },
            { y: 140, label: 'Règles RGPD', status: 'warning', delay: 0.7 },
            { y: 165, label: 'Audit trail', status: 'pass', delay: 0.9 },
            { y: 190, label: 'Approbation', status: 'pending', delay: 1.1 }
          ].map((rule, i) => (
            <motion.g
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: rule.delay, duration: 0.5 }}
            >
              {/* Checkbox */}
              <rect 
                x="55" 
                y={rule.y - 10} 
                width="16" 
                height="16" 
                rx="3" 
                fill="rgba(255, 255, 255, 0.1)" 
                stroke={
                  rule.status === 'pass' ? '#DCFDBC' : 
                  rule.status === 'warning' ? '#F59E0B' : 
                  '#A5C5C6'
                }
                strokeWidth="2"
              />
              
              {/* Check mark or icon */}
              {rule.status === 'pass' && (
                <motion.path
                  d={`M ${58} ${rule.y - 2} L ${62} ${rule.y + 2} L ${68} ${rule.y - 6}`}
                  stroke="#DCFDBC"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: rule.delay + 0.3, duration: 0.3 }}
                  style={{ filter: 'drop-shadow(0 0 3px rgba(220, 253, 188, 0.8))' }}
                />
              )}
              {rule.status === 'warning' && (
                <text 
                  x="63" 
                  y={rule.y + 2} 
                  textAnchor="middle" 
                  className="text-xs font-bold" 
                  fill="#F59E0B"
                >
                  !
                </text>
              )}
              {rule.status === 'pending' && (
                <motion.circle
                  cx="63"
                  cy={rule.y - 2}
                  r="3"
                  fill="#A5C5C6"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              
              {/* Label */}
              <text 
                x="78" 
                y={rule.y} 
                className="text-[9px]" 
                fill="rgba(255, 255, 255, 0.8)"
              >
                {rule.label}
              </text>
            </motion.g>
          ))}
        </motion.g>
        
        {/* Review queue panel */}
        <motion.g
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          {/* Queue panel */}
          <rect 
            x="210" 
            y="40" 
            width="150" 
            height="170" 
            rx="8" 
            fill="url(#controlGradient)" 
            filter="url(#control-blur)"
          />
          <rect 
            x="210" 
            y="40" 
            width="150" 
            height="170" 
            rx="8" 
            fill="rgba(255, 255, 255, 0.12)" 
            stroke="rgba(165, 197, 198, 0.6)" 
            strokeWidth="2" 
          />
          
          {/* Title */}
          <rect 
            x="210" 
            y="40" 
            width="150" 
            height="30" 
            fill="rgba(165, 197, 198, 0.15)" 
          />
          <text 
            x="285" 
            y="60" 
            textAnchor="middle" 
            className="text-[10px] font-bold" 
            fill="#FFFFFF"
          >
            File de validation
          </text>
          
          {/* Queue items */}
          {[
            { y: 85, name: 'Import_001.pdf', priority: 'high' },
            { y: 115, name: 'Import_002.pdf', priority: 'medium' },
            { y: 145, name: 'Import_003.pdf', priority: 'low' },
          ].map((item, i) => (
            <motion.g
              key={i}
              initial={{ opacity: 0, y: item.y + 10 }}
              animate={{ opacity: 1, y: item.y }}
              transition={{ delay: 1.3 + i * 0.2, duration: 0.5 }}
            >
              {/* Item card */}
              <rect 
                x="220" 
                y={item.y} 
                width="130" 
                height="22" 
                rx="4" 
                fill="rgba(255, 255, 255, 0.08)" 
                stroke="rgba(165, 197, 198, 0.4)" 
                strokeWidth="1"
              />
              
              {/* Priority indicator */}
              <circle 
                cx="228" 
                cy={item.y + 11} 
                r="4" 
                fill={
                  item.priority === 'high' ? '#EF4444' :
                  item.priority === 'medium' ? '#F59E0B' :
                  '#A5C5C6'
                }
              />
              
              {/* File name */}
              <text 
                x="236" 
                y={item.y + 14} 
                className="text-[8px]" 
                fill="rgba(255, 255, 255, 0.9)"
              >
                {item.name}
              </text>
              
              {/* Review button */}
              <rect 
                x="320" 
                y={item.y + 5} 
                width="22" 
                height="12" 
                rx="2" 
                fill="#DCFDBC" 
                opacity="0.3"
              />
              <text 
                x="331" 
                y={item.y + 14} 
                textAnchor="middle" 
                className="text-[7px] font-semibold" 
                fill="#FFFFFF"
              >
                ✓
              </text>
            </motion.g>
          ))}
          
          {/* Batch action button */}
          <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 2, type: "spring" }}
          >
            <rect 
              x="220" 
              y="180" 
              width="130" 
              height="22" 
              rx="4" 
              fill="#DCFDBC" 
              opacity="0.3"
            />
            <rect 
              x="220" 
              y="180" 
              width="130" 
              height="22" 
              rx="4" 
              fill="rgba(220, 253, 188, 0.2)" 
              stroke="#DCFDBC" 
              strokeWidth="2"
            />
            <text 
              x="285" 
              y="195" 
              textAnchor="middle" 
              className="text-[9px] font-bold" 
              fill="#FFFFFF"
            >
              Valider en lot
            </text>
          </motion.g>
        </motion.g>
        
        {/* Shield/Security badge */}
        <motion.g
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1.8, type: "spring", stiffness: 150 }}
        >
          {/* Badge glow */}
          <motion.circle 
            cx="115" 
            cy="30" 
            r="25" 
            fill="#DCFDBC" 
            opacity="0.3"
            filter="url(#control-blur)"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Shield background */}
          <path
            d="M 115 12 L 125 17 L 125 28 C 125 35 120 40 115 42 C 110 40 105 35 105 28 L 105 17 Z"
            fill="rgba(255, 255, 255, 0.1)"
            filter="url(#control-blur)"
          />
          <path
            d="M 115 12 L 125 17 L 125 28 C 125 35 120 40 115 42 C 110 40 105 35 105 28 L 105 17 Z"
            fill="rgba(220, 253, 188, 0.25)"
            stroke="#DCFDBC"
            strokeWidth="2"
          />
          
          {/* Check mark inside shield */}
          <motion.path
            d="M 110 27 L 113 30 L 120 22"
            stroke="#FFFFFF"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 2.2, duration: 0.4 }}
            style={{ filter: 'drop-shadow(0 0 3px rgba(220, 253, 188, 0.8))' }}
          />
        </motion.g>
        
        {/* RGPD compliance badge */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.3 }}
        >
          <rect 
            x="250" 
            y="15" 
            width="50" 
            height="16" 
            rx="8" 
            fill="rgba(165, 197, 198, 0.3)"
          />
          <text 
            x="275" 
            y="26" 
            textAnchor="middle" 
            className="text-[8px] font-bold" 
            fill="#FFFFFF"
          >
            RGPD ✓
          </text>
        </motion.g>
        
        {/* Audit trail indicator */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          {/* Dotted line showing audit trail */}
          <motion.path
            d="M 190 125 Q 200 125 210 125"
            stroke="#A5C5C6"
            strokeWidth="2"
            strokeDasharray="2 3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 2.6, duration: 0.8 }}
          />
          
          <motion.circle
            cx="200"
            cy="125"
            r="2"
            fill="#DCFDBC"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ filter: 'drop-shadow(0 0 3px rgba(220, 253, 188, 0.8))' }}
          />
        </motion.g>
      </svg>
      
      {/* Glass overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5 pointer-events-none" />
    </div>
  );
}
