import { motion } from 'motion/react';

export function HeroIllustration() {
  return (
    <div className="relative w-full h-[600px] rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F323D 0%, #1D3943 40%, #2A4A54 100%)' }}>
      {/* Galaxy nebula - parallax layer 1 (slowest, background) */}
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
        {[...Array(50)].map((_, i) => {
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

      {/* Galaxy nebula - parallax layer 2 (medium speed) */}
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
        {[...Array(40)].map((_, i) => {
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

      {/* Galaxy nebula - parallax layer 3 (faster, foreground) */}
      <motion.div
        className="absolute inset-0"
        animate={{
          x: [0, 10, 0],
          y: [0, -12, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {[...Array(30)].map((_, i) => {
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          const size = Math.random() * 4 + 1.5;
          const colors = ['#DCFDBC', '#A5C5C6'];
          const color = colors[Math.floor(Math.random() * colors.length)];
          return (
            <motion.div
              key={`layer3-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${size}px`,
                height: `${size}px`,
                background: color,
                boxShadow: `0 0 ${size * 4}px ${color}`,
              }}
              animate={{
                opacity: [0.3, 0.7, 0.3],
                scale: [1, 1.4, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 1.5,
                ease: "easeInOut"
              }}
            />
          );
        })}
      </motion.div>

      {/* Nebula clouds - large glowing areas */}
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
        {[...Array(8)].map((_, i) => {
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          const size = Math.random() * 150 + 100;
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
      
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600">
        <defs>
          <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.15)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
          </linearGradient>
          <linearGradient id="mainCompanyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
        
        {/* === LEVEL 1: UBO (Ultimate Beneficial Owner) === */}
        <motion.g
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {/* Card glow */}
          <rect x="320" y="20" width="160" height="80" rx="12" fill="#DCFDBC" opacity="0.15" filter="url(#glass-blur)" />
          {/* Glass card */}
          <rect x="320" y="20" width="160" height="80" rx="12" fill="url(#cardGradient)" filter="url(#glass-blur)" />
          <rect x="320" y="20" width="160" height="80" rx="12" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(165, 197, 198, 0.5)" strokeWidth="2" />
          {/* Person icon */}
          <circle cx="340" cy="45" r="12" fill="rgba(220, 253, 188, 0.3)" />
          <circle cx="340" cy="42" r="4" fill="#DCFDBC" />
          <path d="M 333 50 Q 340 47 347 50" stroke="#DCFDBC" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Name */}
          <text x="358" y="48" className="text-xs font-bold" fill="#FFFFFF">Jean Dupont</text>
          <text x="358" y="62" className="text-[9px]" fill="rgba(165, 197, 198, 0.8)">UBO</text>
          {/* Badge */}
          <rect x="358" y="70" width="80" height="16" rx="8" fill="rgba(220, 253, 188, 0.2)" stroke="#DCFDBC" strokeWidth="1" />
          <text x="398" y="80" textAnchor="middle" className="text-[8px] font-semibold" fill="#DCFDBC">ID confirmé</text>
        </motion.g>
        
        {/* Connection UBO -> Main Company */}
        <motion.line
          x1="400" y1="100" x2="400" y2="170"
          stroke="#DCFDBC" strokeWidth="2" strokeDasharray="6 4" opacity="0.6"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        />
        {/* Ownership badge on line */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, type: "spring" }}
        >
          <rect x="370" y="125" width="60" height="20" rx="10" fill="rgba(59, 130, 246, 0.9)" />
          <text x="400" y="138" textAnchor="middle" className="text-[9px] font-bold" fill="white">owns 100%</text>
        </motion.g>
        
        {/* === LEVEL 2: MAIN COMPANY (center) === */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 150 }}
        >
          {/* Main glow - enhanced */}
          <motion.rect 
            x="280" y="170" width="240" height="90" rx="12" 
            fill="#DCFDBC" opacity="0.2" filter="url(#glass-blur)"
            animate={{ 
              scale: [1, 1.02, 1],
              opacity: [0.15, 0.3, 0.15]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {/* Glass card - main company */}
          <rect x="280" y="170" width="240" height="90" rx="12" fill="url(#cardGradient)" filter="url(#glass-blur)" />
          <rect x="280" y="170" width="240" height="90" rx="12" fill="rgba(255, 255, 255, 0.12)" stroke="url(#mainCompanyGradient)" strokeWidth="2.5" />
          {/* Building icon */}
          <rect x="296" y="192" width="20" height="20" rx="2" fill="rgba(220, 253, 188, 0.3)" />
          <rect x="299" y="195" width="5" height="5" fill="#DCFDBC" />
          <rect x="309" y="195" width="5" height="5" fill="#DCFDBC" />
          <rect x="299" y="202" width="5" height="5" fill="#DCFDBC" />
          <rect x="309" y="202" width="5" height="5" fill="#DCFDBC" />
          {/* Company name */}
          <text x="325" y="200" className="text-sm font-bold" fill="#FFFFFF" style={{ filter: 'drop-shadow(0 0 4px rgba(220, 253, 188, 0.4))' }}>TechCorp SAS</text>
          <text x="325" y="215" className="text-[9px]" fill="rgba(165, 197, 198, 0.9)">🇫🇷 France • Paris</text>
          {/* Main badge */}
          <rect x="325" y="225" width="40" height="18" rx="9" fill="rgba(59, 130, 246, 0.2)" stroke="rgba(59, 130, 246, 0.8)" strokeWidth="1.5" />
          <text x="345" y="236" textAnchor="middle" className="text-[8px] font-bold" fill="rgba(59, 130, 246, 1)">Main</text>
          {/* Status badge */}
          <rect x="372" y="225" width="130" height="18" rx="9" fill="rgba(220, 253, 188, 0.2)" stroke="#DCFDBC" strokeWidth="1" />
          <text x="437" y="236" textAnchor="middle" className="text-[8px] font-semibold" fill="#DCFDBC">Registre INPI confirmé</text>
        </motion.g>
        
        {/* === LEVEL 2.5: REPRESENTATIVE === */}
        <motion.g
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          {/* Card */}
          <rect x="40" y="185" width="160" height="60" rx="10" fill="url(#cardGradient)" filter="url(#glass-blur)" />
          <rect x="40" y="185" width="160" height="60" rx="10" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(165, 197, 198, 0.4)" strokeWidth="1.5" />
          {/* Person icon */}
          <circle cx="58" cy="205" r="10" fill="rgba(165, 197, 198, 0.3)" />
          <circle cx="58" cy="203" r="3" fill="#A5C5C6" />
          <path d="M 53 209 Q 58 207 63 209" stroke="#A5C5C6" strokeWidth="1.5" fill="none" />
          {/* Name */}
          <text x="75" y="208" className="text-[10px] font-semibold" fill="#FFFFFF">Marie Laurent</text>
          <text x="75" y="220" className="text-[8px]" fill="rgba(165, 197, 198, 0.8)">Représentant légal</text>
          <rect x="75" y="228" width="115" height="12" rx="6" fill="rgba(165, 197, 198, 0.15)" />
          <text x="132" y="236" textAnchor="middle" className="text-[7px]" fill="rgba(165, 197, 198, 0.9)">Vérifié • Pappers</text>
        </motion.g>
        
        {/* Connection Representative -> Main */}
        <motion.line
          x1="200" y1="215" x2="280" y2="215"
          stroke="rgba(165, 197, 198, 0.5)" strokeWidth="1.5" strokeDasharray="4 3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        />
        
        {/* === LEVEL 3: HOLDING (Top right) === */}
        <motion.g
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.6 }}
        >
          <rect x="580" y="40" width="180" height="75" rx="10" fill="url(#cardGradient)" filter="url(#glass-blur)" />
          <rect x="580" y="40" width="180" height="75" rx="10" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(165, 197, 198, 0.4)" strokeWidth="1.5" />
          {/* Building icon */}
          <rect x="594" y="56" width="16" height="16" rx="2" fill="rgba(165, 197, 198, 0.2)" />
          <rect x="597" y="59" width="4" height="4" fill="#A5C5C6" />
          <rect x="603" y="59" width="4" height="4" fill="#A5C5C6" />
          <rect x="597" y="65" width="4" height="4" fill="#A5C5C6" />
          <rect x="603" y="65" width="4" height="4" fill="#A5C5C6" />
          {/* Name */}
          <text x="618" y="68" className="text-[11px] font-bold" fill="#FFFFFF">Holding Invest Ltd</text>
          <text x="618" y="82" className="text-[8px]" fill="rgba(165, 197, 198, 0.8)">🇬🇧 UK • Londres</text>
          {/* Badge */}
          <rect x="618" y="91" width="60" height="14" rx="7" fill="rgba(165, 197, 198, 0.15)" stroke="#A5C5C6" strokeWidth="1" />
          <text x="648" y="100" textAnchor="middle" className="text-[7px] font-semibold" fill="#A5C5C6">Affiliated</text>
        </motion.g>
        
        {/* Connection Holding -> Main */}
        <motion.path
          d="M 580 77 Q 520 120 520 170"
          stroke="rgba(165, 197, 198, 0.5)" strokeWidth="2" strokeDasharray="6 4" fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        />
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.6, type: "spring" }}
        >
          <rect x="510" y="110" width="60" height="18" rx="9" fill="rgba(59, 130, 246, 0.9)" />
          <text x="540" y="122" textAnchor="middle" className="text-[8px] font-bold" fill="white">owns 60%</text>
        </motion.g>
        
        {/* === LEVEL 3: SUBSIDIARIES (Bottom) === */}
        {/* Subsidiary 1 */}
        <motion.g
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          <rect x="80" y="340" width="180" height="70" rx="10" fill="url(#cardGradient)" filter="url(#glass-blur)" />
          <rect x="80" y="340" width="180" height="70" rx="10" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(141, 162, 169, 0.4)" strokeWidth="1.5" />
          <rect x="94" y="356" width="14" height="14" rx="1.5" fill="rgba(141, 162, 169, 0.2)" />
          <rect x="96" y="358" width="3" height="3" fill="#8DA2A9" />
          <rect x="101" y="358" width="3" height="3" fill="#8DA2A9" />
          <rect x="96" y="363" width="3" height="3" fill="#8DA2A9" />
          <rect x="101" y="363" width="3" height="3" fill="#8DA2A9" />
          <text x="115" y="366" className="text-[10px] font-semibold" fill="#FFFFFF">TechCorp Digital</text>
          <text x="115" y="379" className="text-[8px]" fill="rgba(165, 197, 198, 0.8)">🇫🇷 France • Lyon</text>
          <rect x="115" y="388" width="50" height="13" rx="6.5" fill="rgba(141, 162, 169, 0.15)" stroke="#8DA2A9" strokeWidth="1" />
          <text x="140" y="397" textAnchor="middle" className="text-[7px] font-semibold" fill="#8DA2A9">Filiale 100%</text>
        </motion.g>
        
        {/* Connection Main -> Sub1 */}
        <motion.path
          d="M 340 260 Q 200 300 170 340"
          stroke="rgba(141, 162, 169, 0.5)" strokeWidth="2" strokeDasharray="6 4" fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.6, duration: 0.6 }}
        />
        
        {/* Subsidiary 2 */}
        <motion.g
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7, duration: 0.6 }}
        >
          <rect x="310" y="340" width="180" height="70" rx="10" fill="url(#cardGradient)" filter="url(#glass-blur)" />
          <rect x="310" y="340" width="180" height="70" rx="10" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(141, 162, 169, 0.4)" strokeWidth="1.5" />
          <rect x="324" y="356" width="14" height="14" rx="1.5" fill="rgba(141, 162, 169, 0.2)" />
          <rect x="326" y="358" width="3" height="3" fill="#8DA2A9" />
          <rect x="331" y="358" width="3" height="3" fill="#8DA2A9" />
          <rect x="326" y="363" width="3" height="3" fill="#8DA2A9" />
          <rect x="331" y="363" width="3" height="3" fill="#8DA2A9" />
          <text x="345" y="366" className="text-[10px] font-semibold" fill="#FFFFFF">TechCorp Services</text>
          <text x="345" y="379" className="text-[8px]" fill="rgba(165, 197, 198, 0.8)">🇫🇷 France • Marseille</text>
          <rect x="345" y="388" width="50" height="13" rx="6.5" fill="rgba(141, 162, 169, 0.15)" stroke="#8DA2A9" strokeWidth="1" />
          <text x="370" y="397" textAnchor="middle" className="text-[7px] font-semibold" fill="#8DA2A9">Filiale 85%</text>
        </motion.g>
        
        {/* Connection Main -> Sub2 */}
        <motion.line
          x1="400" y1="260" x2="400" y2="340"
          stroke="rgba(141, 162, 169, 0.5)" strokeWidth="2" strokeDasharray="6 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
        />
        
        {/* Subsidiary 3 with alert */}
        <motion.g
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9, duration: 0.6 }}
        >
          <rect x="540" y="340" width="180" height="70" rx="10" fill="url(#cardGradient)" filter="url(#glass-blur)" />
          <rect x="540" y="340" width="180" height="70" rx="10" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="1.5" />
          <rect x="554" y="356" width="14" height="14" rx="1.5" fill="rgba(239, 68, 68, 0.15)" />
          <rect x="556" y="358" width="3" height="3" fill="#EF4444" />
          <rect x="561" y="358" width="3" height="3" fill="#EF4444" />
          <rect x="556" y="363" width="3" height="3" fill="#EF4444" />
          <rect x="561" y="363" width="3" height="3" fill="#EF4444" />
          <text x="575" y="366" className="text-[10px] font-semibold" fill="#FFFFFF">Offshore Holding SA</text>
          <text x="575" y="379" className="text-[8px]" fill="rgba(165, 197, 198, 0.8)">��🇦 Panama</text>
          <rect x="575" y="388" width="120" height="13" rx="6.5" fill="rgba(239, 68, 68, 0.2)" stroke="#EF4444" strokeWidth="1" />
          <text x="635" y="397" textAnchor="middle" className="text-[7px] font-semibold" fill="#EF4444">Certificat manquant</text>
        </motion.g>
        
        {/* Connection Main -> Sub3 */}
        <motion.path
          d="M 460 260 Q 580 300 630 340"
          stroke="rgba(239, 68, 68, 0.5)" strokeWidth="2" strokeDasharray="6 4" fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 2.0, duration: 0.6 }}
        />
        
        {/* === LEVEL 4: Sub-subsidiary === */}
        <motion.g
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.6 }}
        >
          <rect x="80" y="480" width="160" height="60" rx="10" fill="url(#cardGradient)" filter="url(#glass-blur)" />
          <rect x="80" y="480" width="160" height="60" rx="10" fill="rgba(255, 255, 255, 0.06)" stroke="rgba(105, 121, 140, 0.3)" strokeWidth="1.5" />
          <rect x="92" y="494" width="12" height="12" rx="1.5" fill="rgba(105, 121, 140, 0.15)" />
          <rect x="94" y="496" width="2.5" height="2.5" fill="#69798C" />
          <rect x="98" y="496" width="2.5" height="2.5" fill="#69798C" />
          <rect x="94" y="500" width="2.5" height="2.5" fill="#69798C" />
          <rect x="98" y="500" width="2.5" height="2.5" fill="#69798C" />
          <text x="110" y="504" className="text-[9px] font-semibold" fill="#FFFFFF">TechCorp Labs</text>
          <text x="110" y="516" className="text-[7px]" fill="rgba(165, 197, 198, 0.7)">🇫🇷 France • Lille</text>
          <rect x="110" y="524" width="48" height="11" rx="5.5" fill="rgba(105, 121, 140, 0.15)" />
          <text x="134" y="531" textAnchor="middle" className="text-[6px]" fill="rgba(105, 121, 140, 0.9)">Filiale 100%</text>
        </motion.g>
        
        {/* Connection Sub1 -> SubSub */}
        <motion.line
          x1="160" y1="410" x2="160" y2="480"
          stroke="rgba(105, 121, 140, 0.4)" strokeWidth="1.5" strokeDasharray="4 3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 2.3, duration: 0.5 }}
        />
        
        {/* === DATA SOURCES BADGE (Bottom left) === */}
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.5, type: "spring" }}
        >
          <rect x="20" y="540" width="220" height="45" rx="12" fill="rgba(255, 255, 255, 0.08)" filter="url(#glass-blur)" />
          <rect x="20" y="540" width="220" height="45" rx="12" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(220, 253, 188, 0.4)" strokeWidth="2" />
          <circle cx="38" cy="562" r="10" fill="rgba(220, 253, 188, 0.2)" />
          <path d="M 38 556 L 38 568 M 32 562 L 44 562" stroke="#DCFDBC" strokeWidth="2" strokeLinecap="round" />
          <text x="55" y="560" className="text-[9px] font-semibold" fill="#DCFDBC">Données automatiques</text>
          <text x="55" y="573" className="text-[7px]" fill="rgba(165, 197, 198, 0.9)">Sources: INPI • Pappers • Trusted APIs</text>
        </motion.g>
        
        {/* Animated data flow particles */}
        {[
          { from: { x: 400, y: 100 }, to: { x: 400, y: 170 }, delay: 1.0 },
          { from: { x: 520, y: 170 }, to: { x: 580, y: 77 }, delay: 1.5 },
          { from: { x: 400, y: 260 }, to: { x: 170, y: 340 }, delay: 2.0 },
          { from: { x: 400, y: 260 }, to: { x: 630, y: 340 }, delay: 2.2 }
        ].map((particle, i) => (
          <motion.circle
            key={i}
            r="4"
            fill="#DCFDBC"
            style={{ filter: 'drop-shadow(0 0 4px rgba(220, 253, 188, 0.8))' }}
            initial={{ 
              cx: particle.from.x,
              cy: particle.from.y,
              opacity: 0
            }}
            animate={{ 
              cx: particle.to.x,
              cy: particle.to.y,
              opacity: [0, 1, 0]
            }}
            transition={{
              delay: particle.delay,
              duration: 1.2,
              repeat: Infinity,
              repeatDelay: 4,
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
