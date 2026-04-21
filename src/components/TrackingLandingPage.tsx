import { motion } from 'motion/react';
import { Button } from './ui/button';
import {
  Activity,
  Users,
  Bell,
  Mail,
  BarChart3,
  FileText,
  Shield,
  Zap,
  Target,
  TrendingUp,
  Eye,
  Download
} from 'lucide-react';
import { EngagementScoreIllustration } from './illustrations/EngagementScoreIllustration';
import { RealTimeAnalyticsIllustration } from './illustrations/RealTimeAnalyticsIllustration';
import { SmartNudgesIllustration } from './illustrations/SmartNudgesIllustration';
import { AutomatedCampaignsIllustration } from './illustrations/AutomatedCampaignsIllustration';
import { DocumentHeatmapIllustration } from './illustrations/DocumentHeatmapIllustration';
import { AuditComplianceIllustration } from './illustrations/AuditComplianceIllustration';
import { useTranslation } from '../utils/languageContext';

interface TrackingLandingPageProps {
  onEnableModule: () => void;
}

export function TrackingLandingPage({ onEnableModule }: TrackingLandingPageProps) {
  const { t } = useTranslation();
  const features = [
    {
      icon: Activity,
      title: t('ged.tracking.features.realtimeTitle'),
      description: t('ged.tracking.features.realtimeDesc'),
      illustration: RealTimeAnalyticsIllustration,
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      icon: Target,
      title: t('ged.tracking.features.engagementTitle'),
      description: t('ged.tracking.features.engagementDesc'),
      illustration: EngagementScoreIllustration,
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      icon: BarChart3,
      title: t('ged.tracking.features.heatmapsTitle'),
      description: t('ged.tracking.features.heatmapsDesc'),
      illustration: DocumentHeatmapIllustration,
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      icon: Bell,
      title: t('ged.tracking.features.nudgesTitle'),
      description: t('ged.tracking.features.nudgesDesc'),
      illustration: SmartNudgesIllustration,
      gradient: 'from-orange-500 to-red-600'
    },
    {
      icon: Mail,
      title: t('ged.tracking.features.campaignsTitle'),
      description: t('ged.tracking.features.campaignsDesc'),
      illustration: AutomatedCampaignsIllustration,
      gradient: 'from-indigo-500 to-purple-600'
    },
    {
      icon: Shield,
      title: t('ged.tracking.features.exportsTitle'),
      description: t('ged.tracking.features.exportsDesc'),
      illustration: AuditComplianceIllustration,
      gradient: 'from-emerald-500 to-green-600'
    },
  ];

  const useCases = [
    {
      title: t('ged.tracking.useCases.perGuestTitle'),
      description: t('ged.tracking.useCases.perGuestDesc'),
      icon: Users,
    },
    {
      title: t('ged.tracking.useCases.perFileTitle'),
      description: t('ged.tracking.useCases.perFileDesc'),
      icon: FileText,
    },
    {
      title: t('ged.tracking.useCases.campaignsTitle'),
      description: t('ged.tracking.useCases.campaignsDesc'),
      icon: Mail,
    },
    {
      title: t('ged.tracking.useCases.complianceTitle'),
      description: t('ged.tracking.useCases.complianceDesc'),
      icon: Shield,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
        }}
      >
        {/* Animated background patterns */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
            >
              <Activity className="w-4 h-4 text-[#DCFDBC]" />
              <span className="text-sm font-semibold text-white">{t('ged.tracking.badge')}</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-bold text-white mb-6"
            >
              {t('ged.tracking.heroTitle')}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/80 mb-8 leading-relaxed"
            >
              {t('ged.tracking.heroSubtitle')}
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-base text-white/70 mb-10 leading-relaxed max-w-3xl mx-auto"
            >
              {t('ged.tracking.heroDesc')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-4 justify-center"
            >
              <Button
                onClick={onEnableModule}
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 px-8"
              >
                <Zap className="w-5 h-5 mr-2" />
                {t('ged.tracking.activateModule')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm"
              >
                <Mail className="w-5 h-5 mr-2" />
                {t('ged.tracking.requestDemo')}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('ged.tracking.featuresTitle')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('ged.tracking.featuresSubtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const Illustration = feature.illustration;
            
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
              >
                {/* Illustration */}
                <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                  <Illustration />
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('ged.tracking.useCasesTitle')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('ged.tracking.useCasesSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon;
              return (
                <motion.div
                  key={useCase.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {useCase.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {useCase.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="relative overflow-hidden rounded-3xl p-12 text-center"
          style={{
            background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
          }}
        >
          {/* Animated background */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-[#DCFDBC] rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t('ged.tracking.ctaTitle')}
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              {t('ged.tracking.ctaSubtitle')}
            </p>
            <div className="flex items-center gap-4 justify-center">
              <Button
                onClick={onEnableModule}
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 px-8"
              >
                <Zap className="w-5 h-5 mr-2" />
                {t('ged.tracking.activateModule')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm"
              >
                {t('ged.tracking.contactAdvisor')}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
