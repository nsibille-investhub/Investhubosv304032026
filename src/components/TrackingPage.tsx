import { motion } from 'motion/react';
import { Activity } from 'lucide-react';
import { TrackingLandingPage } from './TrackingLandingPage';

interface TrackingPageProps {
  trackingEnabled: boolean;
  onEnableModule: () => void;
}

export function TrackingPage({ trackingEnabled, onEnableModule }: TrackingPageProps) {
  // Si le module n'est pas activé, afficher la landing page
  if (!trackingEnabled) {
    return <TrackingLandingPage onEnableModule={onEnableModule} />;
  }

  // Module activé - afficher la page de tracking (à implémenter plus tard)
  return (
    <div className="flex-1 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Activity className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Module Tracking activé
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Le tableau de bord de tracking sera bientôt disponible avec toutes les métriques d'engagement de votre Data Room.
        </p>
      </motion.div>
    </div>
  );
}
