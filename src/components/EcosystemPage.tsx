import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  FileCheck, 
  TrendingUp, 
  Shield, 
  Network, 
  Globe, 
  Plug, 
  Send, 
  BarChart3,
  Cpu,
  Database,
  Building2,
  FileSignature,
  Eye,
  Mail,
  Workflow,
  Activity,
  Zap,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface Module {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  features: string[];
  size: number;
}

const modules = [
  {
    id: 'onboard',
    name: 'Onboard',
    icon: <FileCheck className="w-7 h-7" />,
    color: '#00D4AA',
    description: 'Souscriptions digitales & KYC',
    features: ['Formulaires intelligents', 'Signatures digitales', 'Validation auto'],
    size: 1.2,
  },
  {
    id: 'fundlife',
    name: 'Fund Life',
    icon: <TrendingUp className="w-7 h-7" />,
    color: '#00C4FF',
    description: 'Gestion du cycle d\'un fonds',
    features: ['Engagements', 'NAV dynamique', 'Distributions'],
    size: 1.4,
  },
  {
    id: 'compliance',
    name: 'Compliance',
    icon: <Shield className="w-7 h-7" />,
    color: '#7C3AED',
    description: 'KYC/AML intégrés',
    features: ['Matrices de risques', 'Scoring temps réel', 'PEP/Sanction screening'],
    size: 1.3,
  },
  {
    id: 'network',
    name: 'Network',
    icon: <Network className="w-7 h-7" />,
    color: '#F59E0B',
    description: 'Distribution & commissions',
    features: ['Réseau intermédiaires', 'Habilitations', 'Flux commissions'],
    size: 1.1,
  },
  {
    id: 'portals',
    name: 'Portals',
    icon: <Globe className="w-7 h-7" />,
    color: '#06B6D4',
    description: 'Portails LPs & CGP',
    features: ['Dashboards', 'Performances', 'Documents'],
    size: 1.2,
  },
  {
    id: 'connect',
    name: 'Connect',
    icon: <Plug className="w-7 h-7" />,
    color: '#EC4899',
    description: 'API & intégrations',
    features: ['API REST', 'SSO', 'Connecteurs'],
    size: 1.0,
  },
  {
    id: 'reach',
    name: 'Reach',
    icon: <Send className="w-7 h-7" />,
    color: '#10B981',
    description: 'Communication & relances',
    features: ['Emails auto', 'Segmentation', 'Analytics engagement'],
    size: 1.1,
  },
  {
    id: 'insight',
    name: 'Insight',
    icon: <BarChart3 className="w-7 h-7" />,
    color: '#8B5CF6',
    description: 'Données & Reporting',
    features: ['Datalake', 'Tableaux de bord', 'Consolidation'],
    size: 1.3,
  }
];

const externalConnections = [
  { id: 'crm', name: 'CRM', icon: <Building2 className="w-4 h-4" />, color: '#3B82F6' },
  { id: 'datalake', name: 'Datalake', icon: <Database className="w-4 h-4" />, color: '#8B5CF6' },
  { id: 'distribution', name: 'Distribution', icon: <Network className="w-4 h-4" />, color: '#F59E0B' },
  { id: 'signature', name: 'Signature', icon: <FileSignature className="w-4 h-4" />, color: '#10B981' },
  { id: 'kyc', name: 'KYC Provider', icon: <Eye className="w-4 h-4" />, color: '#06B6D4' },
  { id: 'bi', name: 'BI Tools', icon: <BarChart3 className="w-4 h-4" />, color: '#8B5CF6' },
  { id: 'erp', name: 'ERP', icon: <Workflow className="w-4 h-4" />, color: '#EC4899' },
  { id: 'messaging', name: 'Messaging', icon: <Mail className="w-4 h-4" />, color: '#00D4AA' },
];

// Starfield component
function Starfield() {
  const [stars] = useState(() => 
    Array.from({ length: 200 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.3,
      duration: Math.random() * 3 + 2,
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute bg-white rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
          animate={{
            opacity: [star.opacity, star.opacity * 0.3, star.opacity],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// Orbital rings
function OrbitalRings() {
  return (
    <>
      {[1, 2, 3].map((ring) => (
        <motion.div
          key={ring}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{
            width: `${ring * 240}px`,
            height: `${ring * 240}px`,
            border: '1px dashed rgba(6, 182, 212, 0.15)',
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 40 + ring * 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {/* Small orbital markers */}
          {[0, 90, 180, 270].map((angle) => (
            <div
              key={angle}
              className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
              style={{
                left: '50%',
                top: '0',
                transform: `rotate(${angle}deg) translateY(-50%)`,
              }}
            />
          ))}
        </motion.div>
      ))}
    </>
  );
}

// Nebula effect
function NebulaBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-40">
      <motion.div
        className="absolute -left-1/4 -top-1/4 w-1/2 h-1/2 rounded-full blur-[120px]"
        style={{
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.4) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
      />
      <motion.div
        className="absolute -right-1/4 -bottom-1/4 w-1/2 h-1/2 rounded-full blur-[120px]"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 rounded-full blur-[100px]"
        style={{
          background: 'radial-gradient(circle, rgba(15, 50, 61, 0.5) 0%, transparent 60%)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
        }}
      />
    </div>
  );
}

// Constellation lines with animated particles
function ConstellationLine({ fromX, fromY, toX, toY, color, delay }: any) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  return (
    <div
      className="absolute origin-left pointer-events-none"
      style={{
        left: '50%',
        top: '50%',
        marginLeft: `${fromX}px`,
        marginTop: `${fromY}px`,
        transform: `rotate(${angle}rad)`,
        width: length,
        height: '2px',
        zIndex: 1,
      }}
    >
      {/* Base line */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
        }}
      />
      
      {/* Animated energy particle */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
        style={{
          background: color,
          boxShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
        }}
        animate={{
          left: ['0%', '100%'],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 3,
          delay,
          repeat: Infinity,
          repeatDelay: 2,
        }}
      />
    </div>
  );
}

// Planet-style module
interface PlanetModuleProps {
  module: Module;
  index: number;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  radius: number;
}

function PlanetModule({ module, index, isHovered, onHover, radius }: PlanetModuleProps) {
  const angle = (index * 360) / 8 - 90;
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * radius;
  const y = Math.sin(rad) * radius;

  return (
    <motion.div
      className="absolute"
      style={{
        left: '50%',
        top: '50%',
        marginLeft: `${x}px`,
        marginTop: `${y}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: isHovered ? 50 : 10,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.3 + index * 0.1, type: 'spring' }}
      onMouseEnter={() => onHover(module.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Planetary orbit ring */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border pointer-events-none"
        style={{
          width: `${140 * module.size}px`,
          height: `${140 * module.size}px`,
          borderColor: `${module.color}30`,
          opacity: isHovered ? 1 : 0,
        }}
        animate={{
          rotate: [0, 360],
          scale: isHovered ? [1, 1.1, 1] : 1,
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
          scale: { duration: 2, repeat: Infinity },
        }}
      />

      {/* Atmospheric glow */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl pointer-events-none"
        style={{
          width: `${120 * module.size}px`,
          height: `${120 * module.size}px`,
          background: `radial-gradient(circle, ${module.color}60 0%, ${module.color}20 40%, transparent 70%)`,
        }}
        animate={{
          scale: isHovered ? [1, 1.3, 1] : [1, 1.1, 1],
          opacity: isHovered ? [0.6, 0.8, 0.6] : [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      />

      {/* Planet body */}
      <motion.div
        className="relative rounded-full cursor-pointer overflow-hidden"
        style={{
          width: `${100 * module.size}px`,
          height: `${100 * module.size}px`,
          background: `radial-gradient(circle at 30% 30%, ${module.color}60, ${module.color}40 40%, ${module.color}20 70%, #000000)`,
          boxShadow: `
            inset -10px -10px 30px rgba(0,0,0,0.5),
            inset 5px 5px 20px ${module.color}40,
            0 0 40px ${module.color}40,
            0 0 60px ${module.color}20
          `,
          border: `2px solid ${module.color}60`,
        }}
        animate={{
          scale: isHovered ? 1.15 : 1,
          boxShadow: isHovered
            ? `
              inset -10px -10px 30px rgba(0,0,0,0.5),
              inset 5px 5px 20px ${module.color}60,
              0 0 50px ${module.color}60,
              0 0 80px ${module.color}40
            `
            : `
              inset -10px -10px 30px rgba(0,0,0,0.5),
              inset 5px 5px 20px ${module.color}40,
              0 0 40px ${module.color}40,
              0 0 60px ${module.color}20
            `,
        }}
        transition={{ duration: 0.4 }}
      >
        {/* Planet surface texture */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              ${module.color}20 10px,
              ${module.color}20 20px
            )`,
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Icon at center */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ color: module.color }}>
          {module.icon}
        </div>

        {/* Orbital satellite indicator */}
        <motion.div
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: module.color,
            boxShadow: `0 0 8px ${module.color}`,
            left: '50%',
            top: '10%',
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </motion.div>

      {/* Info panel on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute left-1/2 top-full mt-4 -translate-x-1/2 min-w-[220px]"
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="relative bg-black/90 backdrop-blur-xl border-2 rounded-xl p-4"
              style={{
                borderColor: module.color,
                boxShadow: `0 0 30px ${module.color}40, inset 0 0 20px ${module.color}10`,
              }}
            >
              {/* Glow effect */}
              <div
                className="absolute inset-0 rounded-xl blur-xl opacity-30 pointer-events-none"
                style={{ background: module.color }}
              />

              <div className="relative">
                <h3 className="text-white mb-1" style={{ fontSize: '16px' }}>{module.name}</h3>
                <p className="text-gray-300 text-xs mb-3">{module.description}</p>
                
                <div className="space-y-1">
                  {module.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <Sparkles className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: module.color }} />
                      <span className="text-gray-400">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Module name label */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
        style={{
          top: `${-20 * module.size}px`,
        }}
        animate={{
          opacity: isHovered ? 0 : 1,
        }}
      >
        <div
          className="px-3 py-1 rounded-full text-xs backdrop-blur-sm border"
          style={{
            background: `${module.color}15`,
            borderColor: `${module.color}40`,
            color: module.color,
            boxShadow: `0 0 15px ${module.color}20`,
          }}
        >
          {module.name}
        </div>
      </motion.div>
    </motion.div>
  );
}

// External satellite nodes
interface SatelliteNodeProps {
  connection: any;
  index: number;
  radius: number;
}

function SatelliteNode({ connection, index, radius }: SatelliteNodeProps) {
  const angle = (index * 360) / 8 - 90 + 22.5;
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * radius;
  const y = Math.sin(rad) * radius;

  return (
    <motion.div
      className="absolute"
      style={{
        left: '50%',
        top: '50%',
        marginLeft: `${x}px`,
        marginTop: `${y}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: 5,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.7 + index * 0.08, type: 'spring' }}
    >
      <div className="relative group">
        {/* Glow pulse */}
        <motion.div
          className="absolute inset-0 rounded-lg blur-md pointer-events-none"
          style={{ background: connection.color }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />

        {/* Satellite body */}
        <motion.div
          className="relative backdrop-blur-sm border rounded-lg p-3"
          style={{
            background: `linear-gradient(135deg, ${connection.color}20, rgba(0,0,0,0.8))`,
            borderColor: `${connection.color}50`,
            boxShadow: `0 0 20px ${connection.color}30`,
          }}
          whileHover={{
            scale: 1.1,
            boxShadow: `0 0 30px ${connection.color}50`,
          }}
        >
          <div className="mb-1" style={{ color: connection.color }}>
            {connection.icon}
          </div>
          <p className="text-xs text-gray-300 whitespace-nowrap">{connection.name}</p>
        </motion.div>

        {/* Orbiting indicator */}
        <motion.div
          className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
          style={{
            background: connection.color,
            boxShadow: `0 0 6px ${connection.color}`,
            left: '50%',
            top: '-10px',
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>
    </motion.div>
  );
}

export default function EcosystemPage({ onClose }: { onClose: () => void }) {
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 0.01);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const moduleRadius = 370;
  const externalRadius = 560;

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden">
      {/* Deep space background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black" />

      {/* Nebula effects */}
      <NebulaBackground />

      {/* Starfield */}
      <Starfield />

      {/* Close button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute top-6 right-6 z-[100] text-white hover:bg-white/10 backdrop-blur-sm border border-white/20"
      >
        <X className="w-5 h-5" />
      </Button>

      {/* Title constellation */}
      <motion.div
        className="absolute top-10 left-1/2 -translate-x-1/2 text-center z-10"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, type: 'spring' }}
      >
        <motion.h1
          className="text-4xl text-white mb-2"
          style={{
            textShadow: '0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(6, 182, 212, 0.3)',
          }}
          animate={{
            textShadow: [
              '0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(6, 182, 212, 0.3)',
              '0 0 30px rgba(6, 182, 212, 0.7), 0 0 60px rgba(6, 182, 212, 0.4)',
              '0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(6, 182, 212, 0.3)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          InvestHub <span className="text-cyan-400">Constellation</span>
        </motion.h1>
        <p className="text-sm text-gray-400">
          Un écosystème stellaire vivant et interconnecté
        </p>
      </motion.div>

      {/* Main stellar system */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full">
          {/* Orbital reference rings */}
          <OrbitalRings />

          {/* Constellation lines from core to modules */}
          {modules.map((module, idx) => {
            const angle = (idx * 360) / 8 - 90;
            const rad = (angle * Math.PI) / 180;
            const x = Math.cos(rad) * moduleRadius;
            const y = Math.sin(rad) * moduleRadius;

            return (
              <ConstellationLine
                key={`core-${module.id}`}
                fromX={0}
                fromY={0}
                toX={x}
                toY={y}
                color={module.color}
                delay={idx * 0.2}
              />
            );
          })}

          {/* Constellation lines from modules to satellites */}
          {externalConnections.map((ext, idx) => {
            const moduleIdx = idx;
            const moduleAngle = (moduleIdx * 360) / 8 - 90;
            const moduleRad = (moduleAngle * Math.PI) / 180;
            const mx = Math.cos(moduleRad) * moduleRadius;
            const my = Math.sin(moduleRad) * moduleRadius;

            const extAngle = (idx * 360) / 8 - 90 + 22.5;
            const extRad = (extAngle * Math.PI) / 180;
            const ex = Math.cos(extRad) * externalRadius;
            const ey = Math.sin(extRad) * externalRadius;

            return (
              <ConstellationLine
                key={`ext-${ext.id}`}
                fromX={mx}
                fromY={my}
                toX={ex}
                toY={ey}
                color={ext.color}
                delay={1 + idx * 0.15}
              />
            );
          })}

          {/* Central star - InvestHub OS */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 30 }}>
            {/* Outer corona */}
            {[1, 2, 3, 4].map((ring) => (
              <motion.div
                key={ring}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                style={{
                  width: `${140 + ring * 30}px`,
                  height: `${140 + ring * 30}px`,
                  border: `1px solid rgba(6, 182, 212, ${0.3 / ring})`,
                  boxShadow: `0 0 ${20 * ring}px rgba(6, 182, 212, ${0.2 / ring})`,
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3],
                  rotate: [0, 180],
                }}
                transition={{
                  duration: 3 + ring,
                  repeat: Infinity,
                  delay: ring * 0.2,
                }}
              />
            ))}

            {/* Solar flare effect */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl pointer-events-none"
              style={{
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, rgba(15, 50, 61, 0.2) 40%, transparent 70%)',
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
            />

            {/* Star core */}
            <motion.div
              className="relative rounded-full overflow-hidden"
              style={{
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle at 35% 35%, #00E5FF 0%, #00C4FF 20%, #0F323D 60%, #000000 100%)',
                boxShadow: `
                  inset -15px -15px 40px rgba(0,0,0,0.6),
                  inset 10px 10px 30px rgba(0, 229, 255, 0.4),
                  0 0 60px rgba(6, 182, 212, 0.6),
                  0 0 100px rgba(6, 182, 212, 0.4),
                  0 0 140px rgba(6, 182, 212, 0.2)
                `,
                border: '3px solid rgba(6, 182, 212, 0.5)',
              }}
              animate={{
                boxShadow: [
                  `inset -15px -15px 40px rgba(0,0,0,0.6), inset 10px 10px 30px rgba(0, 229, 255, 0.4), 0 0 60px rgba(6, 182, 212, 0.6), 0 0 100px rgba(6, 182, 212, 0.4), 0 0 140px rgba(6, 182, 212, 0.2)`,
                  `inset -15px -15px 40px rgba(0,0,0,0.6), inset 10px 10px 30px rgba(0, 229, 255, 0.6), 0 0 80px rgba(6, 182, 212, 0.8), 0 0 120px rgba(6, 182, 212, 0.5), 0 0 160px rgba(6, 182, 212, 0.3)`,
                  `inset -15px -15px 40px rgba(0,0,0,0.6), inset 10px 10px 30px rgba(0, 229, 255, 0.4), 0 0 60px rgba(6, 182, 212, 0.6), 0 0 100px rgba(6, 182, 212, 0.4), 0 0 140px rgba(6, 182, 212, 0.2)`,
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            >
              {/* Plasma surface */}
              <motion.div
                className="absolute inset-0 opacity-30"
                style={{
                  background: `repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 8px,
                    rgba(6, 182, 212, 0.2) 8px,
                    rgba(6, 182, 212, 0.2) 16px
                  )`,
                }}
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />

              {/* Core content */}
              <div className="relative flex flex-col items-center justify-center h-full">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  <Cpu className="w-14 h-14 text-cyan-300 mb-4" style={{ filter: 'drop-shadow(0 0 10px rgba(6, 182, 212, 0.8))' }} />
                </motion.div>
                <h2 className="text-white text-center text-xl" style={{ textShadow: '0 0 10px rgba(6, 182, 212, 0.8)' }}>
                  InvestHub
                  <br />
                  <span className="text-cyan-300 text-lg">OS</span>
                </h2>
                <div className="flex gap-1.5 mt-4">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-cyan-300 rounded-full"
                      style={{ boxShadow: '0 0 8px rgba(6, 182, 212, 0.8)' }}
                      animate={{
                        opacity: [0.3, 1, 0.3],
                        scale: [1, 1.3, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        delay: i * 0.2,
                        repeat: Infinity,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Solar prominence simulation */}
              {[0, 120, 240].map((angle) => (
                <motion.div
                  key={angle}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, #00E5FF, transparent)',
                    left: '50%',
                    top: '50%',
                    filter: 'blur(2px)',
                  }}
                  animate={{
                    x: [0, Math.cos((angle * Math.PI) / 180) * 50],
                    y: [0, Math.sin((angle * Math.PI) / 180) * 50],
                    opacity: [0, 0.8, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: angle / 120,
                    repeat: Infinity,
                  }}
                />
              ))}
            </motion.div>
          </div>

          {/* Planet modules */}
          {modules.map((module, idx) => (
            <PlanetModule
              key={module.id}
              module={module}
              index={idx}
              isHovered={hoveredModule === module.id}
              onHover={setHoveredModule}
              radius={moduleRadius}
            />
          ))}

          {/* External satellites */}
          {externalConnections.map((connection, idx) => (
            <SatelliteNode
              key={connection.id}
              connection={connection}
              index={idx}
              radius={externalRadius}
            />
          ))}
        </div>
      </div>

      {/* Stellar legend */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      >
        <div className="bg-black/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl px-8 py-4">
          <div className="flex items-center gap-8 text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <motion.div
                className="w-3 h-3 bg-cyan-400 rounded-full"
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(6, 182, 212, 0.8)',
                    '0 0 20px rgba(6, 182, 212, 1)',
                    '0 0 10px rgba(6, 182, 212, 0.8)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span>Flux énergétiques</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-blue-400" style={{ boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)' }} />
              <span>Satellites externes</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3 text-cyan-400" />
              <span>Système vivant</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Interactions temps réel</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Data flow panel */}
      <motion.div
        className="absolute top-24 right-8 bg-black/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-5 max-w-xs"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-cyan-400" style={{ filter: 'drop-shadow(0 0 4px rgba(6, 182, 212, 0.8))' }} />
          <h3 className="text-white">Flux Principaux</h3>
        </div>
        <div className="space-y-3 text-xs text-gray-300">
          {[
            { from: 'Onboard', to: 'Compliance', icon: Shield },
            { from: 'Fund Life', to: 'Portals', icon: Globe },
            { from: 'Insight', to: 'Network', icon: Network },
            { from: 'Reach', to: 'Connect', icon: Plug },
          ].map((flow, idx) => (
            <motion.div
              key={idx}
              className="flex items-center gap-2 p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/10"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.4 + idx * 0.1 }}
            >
              <flow.icon className="w-3 h-3 text-cyan-400 flex-shrink-0" />
              <span>{flow.from}</span>
              <ArrowRight className="w-3 h-3 text-cyan-400 flex-shrink-0" />
              <span>{flow.to}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
