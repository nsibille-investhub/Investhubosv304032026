import { motion } from 'motion/react';
import { Activity } from 'lucide-react';
import { TrackingLandingPage } from './TrackingLandingPage';
import { useTranslation } from '../utils/languageContext';

interface TrackingPageProps {
  trackingEnabled: boolean;
  onEnableModule: () => void;
}

export function TrackingPage({ trackingEnabled, onEnableModule }: TrackingPageProps) {
  const { t } = useTranslation();
  if (!trackingEnabled) {
    return <TrackingLandingPage onEnableModule={onEnableModule} />;
  }

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
          {t('ged.tracking.moduleActivatedTitle')}
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          {t('ged.tracking.moduleActivatedDesc')}
        </p>
      </motion.div>
    </div>
  );
}
