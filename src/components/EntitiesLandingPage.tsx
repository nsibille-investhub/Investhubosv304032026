import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Sparkles, 
  Users,
  Building2,
  Shield,
  Network,
  Search,
  CheckCircle2,
  ArrowRight,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataEnrichmentIllustration } from './illustrations/DataEnrichmentIllustration';
import { DeepScreeningIllustration } from './illustrations/DeepScreeningIllustration';
import { RiskScoringIllustration } from './illustrations/RiskScoringIllustration';

export function EntitiesLandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: 'Gestion unifiée',
      description: 'Gérez vos entités Individual et Corporate dans une interface unique avec une vue consolidée de toutes les informations.',
      gradient: 'from-blue-500 to-cyan-500',
      delay: 0.1,
      illustration: DataEnrichmentIllustration
    },
    {
      icon: Shield,
      title: 'Screening automatisé',
      description: 'Vérification automatique contre les listes de sanctions, PEP et adverse media avec alertes en temps réel.',
      gradient: 'from-purple-500 to-pink-500',
      delay: 0.2,
      illustration: DeepScreeningIllustration
    },
    {
      icon: Network,
      title: 'Enrichissement de données',
      description: 'Enrichissement automatique via registres officiels, UBO et sources multiples pour des données complètes et à jour.',
      gradient: 'from-green-500 to-emerald-500',
      delay: 0.3,
      illustration: RiskScoringIllustration
    }
  ];

  const benefits = [
    'Base de données centralisée',
    'Historique complet des modifications',
    'Liens entre entités (UBO, partenaires)',
    'Scoring de risque dynamique',
    'Export pour audits réglementaires',
    'API pour intégrations externes'
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
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Badge className="mb-4 bg-white/10 text-white border-white/20 backdrop-blur-sm">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Compliance Plus Module
                </Badge>
                <h1 className="text-5xl text-white mb-4">
                  Gestion des entités <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">intelligente</span>
                </h1>
                <p className="text-xl text-white/80 mb-8 max-w-2xl">
                  Centralisez la gestion de vos entités Individual et Corporate avec screening automatisé, enrichissement de données et scoring de risque.
                </p>
                <div className="flex gap-4">
                  <Button 
                    size="lg"
                    onClick={() => navigate('/settings/app-store')}
                    className="bg-white text-gray-900 hover:bg-gray-100 h-11"
                  >
                    Activer le module
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="w-96 h-96">
                <Building2 className="w-full h-full text-white/20" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl mb-4">Fonctionnalités principales</h2>
          <p className="text-lg text-gray-600">
            Une solution complète pour gérer vos entités en conformité
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: feature.delay }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
        >
          <h3 className="text-2xl mb-6">Avantages clés</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="text-center mt-16 bg-gradient-to-br from-gray-900 to-[#0F323D] rounded-2xl p-12 text-white"
        >
          <Lock className="w-16 h-16 mx-auto mb-4 text-white/80" />
          <h3 className="text-3xl mb-4">Prêt à gérer vos entités efficacement ?</h3>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Activez le module Compliance Plus pour accéder à la gestion des entités et toutes les fonctionnalités avancées.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/settings/app-store')}
            className="bg-white text-gray-900 hover:bg-gray-100 h-11"
          >
            Activer Compliance Plus
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
