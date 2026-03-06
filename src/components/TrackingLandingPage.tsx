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

interface TrackingLandingPageProps {
  onEnableModule: () => void;
}

export function TrackingLandingPage({ onEnableModule }: TrackingLandingPageProps) {
  const features = [
    {
      icon: Activity,
      title: 'Vue d\'ensemble en temps réel',
      description: 'Activité globale, pics de trafic, documents chauds/froids',
      illustration: RealTimeAnalyticsIllustration,
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      icon: Target,
      title: 'LP Engagement Score',
      description: 'Score par organisation basé sur vues, temps de lecture, profondeur de scroll, Q&A',
      illustration: EngagementScoreIllustration,
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      icon: BarChart3,
      title: 'Heatmaps d\'intérêt',
      description: 'Thèmes consultés (ESG, governance, fees…), par LP et par rôle/segment',
      illustration: DocumentHeatmapIllustration,
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      icon: Bell,
      title: 'Nudges intelligents',
      description: 'Alertes prêtes à l\'emploi (ex. "3 LP n\'ont pas ouvert la section Fees")',
      illustration: SmartNudgesIllustration,
      gradient: 'from-orange-500 to-red-600'
    },
    {
      icon: Mail,
      title: 'Relances scénarisées',
      description: 'Cibles : Pas visité / Inactif X jours / Q&A en attente / Story non complétée',
      illustration: AutomatedCampaignsIllustration,
      gradient: 'from-indigo-500 to-purple-600'
    },
    {
      icon: Shield,
      title: 'Exports & preuves',
      description: 'Journaux signés (hash) et export Excel/CSV pour audit/BI',
      illustration: AuditComplianceIllustration,
      gradient: 'from-emerald-500 to-green-600'
    },
  ];

  const useCases = [
    {
      title: 'Analytics par invité',
      description: 'Fiche 360° LP avec timeline d\'activité, silences & risques',
      icon: Users,
    },
    {
      title: 'Analytics par fichier',
      description: 'Top vues, temps médian de lecture, heatmap intra-document',
      icon: FileText,
    },
    {
      title: 'Relances & Campagnes',
      description: 'Segments automatiques avec rappels 1-to-1 ou en masse',
      icon: Mail,
    },
    {
      title: 'Sécurité & conformité',
      description: 'Analytics privés, watermarking dynamique, détection d\'anomalies',
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
              <span className="text-sm font-semibold text-white">Data Room</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-bold text-white mb-6"
            >
              Tracking
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/80 mb-8 leading-relaxed"
            >
              Suivi d'engagement & Relances intelligentes pour votre Data Room
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-base text-white/70 mb-10 leading-relaxed max-w-3xl mx-auto"
            >
              Fournir, en un coup d'œil, tout ce qu'un GP doit savoir pour mesurer l'engagement LP, 
              identifier les silences et relancer efficacement — en toute conformité.
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
                Activer le module
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm"
              >
                <Mail className="w-5 h-5 mr-2" />
                Demander une démo
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
            Fonctionnalités principales
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Des outils puissants pour suivre, analyser et optimiser l'engagement de vos investisseurs
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
              Cas d'usage
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Optimisez chaque aspect de votre processus de levée de fonds
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
              Prêt à optimiser votre Data Room ?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Activez le module Tracking et commencez à mesurer l'engagement de vos investisseurs dès aujourd'hui
            </p>
            <div className="flex items-center gap-4 justify-center">
              <Button
                onClick={onEnableModule}
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 px-8"
              >
                <Zap className="w-5 h-5 mr-2" />
                Activer le module
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm"
              >
                Contacter un conseiller
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
