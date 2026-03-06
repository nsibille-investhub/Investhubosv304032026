import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Sparkles, 
  Shield, 
  Bell,
  Eye,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  Mail,
  Phone,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { MonitoringIllustration } from './illustrations/MonitoringIllustration';
import { DeepScreeningIllustration } from './illustrations/DeepScreeningIllustration';
import { CustomParametersIllustration } from './illustrations/CustomParametersIllustration';
import { ContinuousMonitoringIllustration } from './illustrations/ContinuousMonitoringIllustration';
import { ComprehensiveReportsIllustration } from './illustrations/ComprehensiveReportsIllustration';

interface AlertsLandingPageProps {
  onEnableModule: () => void;
}

export function AlertsLandingPage({ onEnableModule }: AlertsLandingPageProps) {
  const features = [
    {
      icon: Eye,
      title: 'Filtrage approfondi',
      description: 'Filtrez simultanément les sanctions, PEP et médias défavorables avec des vérifications complètes pour les entreprises et les individus.',
      gradient: 'from-blue-500 to-cyan-500',
      delay: 0.1,
      illustration: DeepScreeningIllustration
    },
    {
      icon: Zap,
      title: 'Paramètres personnalisés',
      description: 'Utilisez des paramètres avancés pour personnaliser le filtrage et réduire les faux positifs et négatifs avec un filtrage intelligent.',
      gradient: 'from-purple-500 to-pink-500',
      delay: 0.2,
      illustration: CustomParametersIllustration
    },
    {
      icon: Bell,
      title: 'Surveillance continue',
      description: 'Soyez alerté des nouvelles correspondances potentielles et maintenez la conformité avec un re-filtrage périodique automatisé.',
      gradient: 'from-orange-500 to-red-500',
      delay: 0.3,
      illustration: ContinuousMonitoringIllustration
    },
    {
      icon: TrendingUp,
      title: 'Rapports complets',
      description: 'Générez des rapports détaillés pour les soumissions réglementaires. Suivez l\'historique et exportez les pistes d\'audit.',
      gradient: 'from-green-500 to-emerald-500',
      delay: 0.4,
      illustration: ComprehensiveReportsIllustration
    }
  ];

  const benefits = [
    'Prévention du risque réputationnel',
    'Conformité réglementaire garantie',
    'Détection automatique des fraudes',
    'Surveillance 24/7 en temps réel',
    'Réduction massive des faux positifs',
    'Intégration transparente aux workflows'
  ];

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden px-6 py-16" style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 bg-white/10 text-white border-white/20 backdrop-blur-sm px-4 py-1.5">
              <Sparkles className="w-3 h-3 mr-1.5" />
              Compliance+
            </Badge>
            
            <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">
              Alertes
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Filtrez les individus et les entreprises pour détecter les sanctions, les PPE, les médias défavorables, etc., en continu
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Premium Message Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-12"
        >
          <div className="flex items-start gap-6">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="flex-shrink-0"
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(235.35deg, #F1F1E3 6.22%, #9AC4C1 109.73%)' }}>
                <Shield className="w-8 h-8 text-[#0F323D]" />
              </div>
            </motion.div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Compliance in a Box
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Cette fonctionnalité fait partie du module <span className="font-semibold text-[#0066FF]">Compliance+</span>, 
                notre solution avancée qui transforme votre gestion de la conformité en un processus automatisé, 
                intelligent et ultra-rapide. Détectez les fraudes, mettez en place des contrôles périodiques, 
                examinez les alertes et maintenez des rapports à jour.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={onEnableModule}
                  style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
                  className="gap-2 hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 text-white"
                >
                  <Sparkles className="w-4 h-4" />
                  Activer le module
                </Button>
                
                <Button
                  onClick={() => {
                    toast.success('Demande envoyée !', {
                      description: 'Votre account manager vous contactera sous 24h.'
                    });
                  }}
                  variant="outline"
                  className="gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Demander une démo
                  <ArrowRight className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    toast.info('Ouverture du contact commercial...');
                  }}
                  className="gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Contacter un conseiller
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Hero Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <MonitoringIllustration />
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-12 border border-blue-100"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Pourquoi Compliance+ ?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-gray-700 font-medium">{benefit}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Grid with Illustrations */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Fonctionnalités Clés
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: feature.delay }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 group"
              >
                {/* Illustration */}
                <div className="mb-6">
                  <feature.illustration />
                </div>
                
                {/* Title and description */}
                <div className="flex items-start gap-4">
                  <motion.div
                    className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-2 text-lg">
                      {feature.title}
                    </h4>
                    
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Roadmap Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              Fonctionnalités à venir
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#0066FF] rounded-full mt-2 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Analyse prédictive</h4>
                <p className="text-sm text-gray-600">Anticipation des risques avec l'IA avant qu'ils ne se matérialisent</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#7C3AED] rounded-full mt-2 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Scoring de risque automatique</h4>
                <p className="text-sm text-gray-600">Évaluation automatique du niveau de risque de chaque alerte</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#0066FF] rounded-full mt-2 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Intégration multi-sources</h4>
                <p className="text-sm text-gray-600">Connexion à de multiples bases de données internationales</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#7C3AED] rounded-full mt-2 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Workflow d'investigation</h4>
                <p className="text-sm text-gray-600">Processus guidé pour l'analyse et la résolution des alertes</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex flex-col items-center gap-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-2xl">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <p className="text-white text-lg max-w-md">
              Prêt à révolutionner votre gestion des alertes de conformité ?
            </p>
            <Button
              onClick={() => {
                toast.success('Demande envoyée !', {
                  description: 'Notre équipe commerciale vous contactera rapidement.'
                });
              }}
              style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
              className="gap-2 text-white hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Mail className="w-4 h-4" />
              Parler à un expert
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
