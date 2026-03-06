import { motion } from 'motion/react';
import { Shield, Lock, FileCheck, Download, CheckCircle2 } from 'lucide-react';

export function AuditComplianceIllustration() {
  const auditLogs = [
    { user: 'John Anderson', action: 'Viewed Pitch Deck', time: '2m ago', status: 'verified' },
    { user: 'Sarah Miller', action: 'Downloaded Term Sheet', time: '15m ago', status: 'verified' },
    { user: 'Mike Johnson', action: 'Signed NDA', time: '1h ago', status: 'verified' },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center p-6">
      {/* Background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-blue-500/5 to-purple-500/5 rounded-3xl"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Header with Shield */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="flex flex-col items-center mb-6"
        >
          <motion.div
            className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl mb-3 relative"
            style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
            animate={{
              boxShadow: [
                '0 10px 40px rgba(0, 102, 255, 0.3)',
                '0 10px 60px rgba(0, 102, 255, 0.5)',
                '0 10px 40px rgba(0, 102, 255, 0.3)',
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Shield className="w-10 h-10 text-white" />
            
            {/* Checkmark badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: '#DCFDBC' }}
            >
              <CheckCircle2 className="w-5 h-5" style={{ color: '#10B981' }} />
            </motion.div>
          </motion.div>
          
          <h3 className="text-sm font-bold text-gray-900">Conformité & Audit</h3>
          <p className="text-xs text-gray-600">Traçabilité complète garantie</p>
        </motion.div>

        {/* Audit Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-4 space-y-3 mb-4"
        >
          {auditLogs.map((log, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <motion.div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#F0FDF4' }}
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.3,
                  ease: "easeInOut"
                }}
              >
                <CheckCircle2 className="w-4 h-4" style={{ color: '#10B981' }} />
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-900">{log.user}</div>
                <div className="text-xs text-gray-600">{log.action}</div>
                <div className="text-[10px] text-gray-400 mt-1">{log.time}</div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center gap-1 px-2 py-1 rounded-md"
                style={{ backgroundColor: '#DCFDBC' }}
              >
                <Lock className="w-3 h-3" style={{ color: '#10B981' }} />
                <span className="text-[10px] font-semibold" style={{ color: '#10B981' }}>Signé</span>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Security Features Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: FileCheck, label: 'Hash certifié', color: '#0066FF', bg: '#EFF6FF' },
            { icon: Download, label: 'Export CSV', color: '#7C3AED', bg: '#FAF5FF' },
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + index * 0.1, type: 'spring' }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <motion.div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-2"
                  style={{ backgroundColor: feature.bg }}
                  animate={{
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.5,
                    ease: "easeInOut"
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: feature.color }} />
                </motion.div>
                <div className="text-xs font-semibold text-gray-900">{feature.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* RGPD Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-full border"
          style={{ 
            background: 'linear-gradient(to right, #EFF6FF, #FAF5FF)',
            borderColor: '#0066FF'
          }}
        >
          <Lock className="w-4 h-4" style={{ color: '#0066FF' }} />
          <span className="text-xs font-semibold" style={{ color: '#0066FF' }}>Conforme RGPD</span>
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: '#10B981' }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
