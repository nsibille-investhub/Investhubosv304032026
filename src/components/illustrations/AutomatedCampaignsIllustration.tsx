import { motion } from 'motion/react';
import { Mail, Send, CheckCircle2, Clock } from 'lucide-react';

export function AutomatedCampaignsIllustration() {
  const steps = [
    { label: 'Trigger', icon: Clock, status: 'complete', delay: 0.2 },
    { label: 'Envoi', icon: Send, status: 'active', delay: 0.4 },
    { label: 'Delivery', icon: Mail, status: 'pending', delay: 0.6 },
    { label: 'Confirmé', icon: CheckCircle2, status: 'pending', delay: 0.8 },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center p-6">
      {/* Background gradient pulse */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-cyan-500/5 rounded-3xl"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md mb-3">
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: '#10B981' }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [1, 0.7, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <span className="text-xs font-semibold text-gray-700">Campagne active</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Relance automatique</h3>
          <p className="text-sm text-gray-600">Inactifs depuis 7 jours</p>
        </motion.div>

        {/* Workflow Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-8 top-6 bottom-6 w-0.5 bg-gray-200" />
          <motion.div
            className="absolute left-8 top-6 w-0.5"
            style={{ background: 'linear-gradient(to bottom, #10B981, #0066FF)' }}
            initial={{ height: 0 }}
            animate={{ height: '50%' }}
            transition={{ duration: 2, ease: "easeOut" }}
          />

          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isComplete = step.status === 'complete';
              const isActive = step.status === 'active';

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: step.delay, type: 'spring' }}
                  className="relative flex items-center gap-4"
                >
                  {/* Step icon */}
                  <motion.div
                    className="relative z-10 w-16 h-16 rounded-xl flex items-center justify-center shadow-lg"
                    style={{
                      backgroundColor: isComplete
                        ? '#10B981'
                        : isActive
                        ? '#0066FF'
                        : '#E5E7EB'
                    }}
                    animate={
                      isActive
                        ? {
                            boxShadow: [
                              '0 4px 20px rgba(0, 102, 255, 0.3)',
                              '0 8px 30px rgba(0, 102, 255, 0.5)',
                              '0 4px 20px rgba(0, 102, 255, 0.3)',
                            ],
                          }
                        : {}
                    }
                    transition={{
                      duration: 2,
                      repeat: isActive ? Infinity : 0,
                      ease: "easeInOut"
                    }}
                  >
                    <Icon
                      className={`w-7 h-7 ${
                        isComplete || isActive ? 'text-white' : 'text-gray-400'
                      }`}
                    />
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-xl"
                        style={{ backgroundColor: '#0066FF' }}
                        animate={{
                          opacity: [0, 0.3, 0],
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeOut"
                        }}
                      />
                    )}
                  </motion.div>

                  {/* Step content */}
                  <motion.div
                    className="flex-1 bg-white rounded-xl p-4 shadow-sm"
                    style={isActive ? {
                      boxShadow: '0 0 0 2px #0066FF, 0 0 0 4px white'
                    } : {}}
                    animate={
                      isActive
                        ? {
                            scale: [1, 1.02, 1],
                          }
                        : {}
                    }
                    transition={{
                      duration: 2,
                      repeat: isActive ? Infinity : 0,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {step.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {isComplete
                            ? 'Terminé'
                            : isActive
                            ? 'En cours...'
                            : 'En attente'}
                        </div>
                      </div>
                      {isComplete && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', delay: step.delay + 0.2 }}
                        >
                          <CheckCircle2 className="w-5 h-5" style={{ color: '#10B981' }} />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-6 bg-white rounded-xl p-4 shadow-sm"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-gray-500 mb-1">Envoyés</div>
              <motion.div
                className="text-2xl font-bold"
                style={{ color: '#0066FF' }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
              >
                24
              </motion.div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Ouverts</div>
              <motion.div
                className="text-2xl font-bold"
                style={{ color: '#10B981' }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1.7 }}
              >
                18
              </motion.div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Taux</div>
              <motion.div
                className="text-2xl font-bold"
                style={{ color: '#7C3AED' }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1.9 }}
              >
                75%
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
