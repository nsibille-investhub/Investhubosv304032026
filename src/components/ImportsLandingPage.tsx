import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Sparkles,
  FileUp,
  Scan,
  Network,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight,
  Lock,
  FileSearch,
  Link2
} from 'lucide-react';
import { toast } from 'sonner';
import { DataExtractionIllustration } from './illustrations/DataExtractionIllustration';
import { SmartClassificationIllustration } from './illustrations/SmartClassificationIllustration';
import { ComplianceControlsIllustration } from './illustrations/ComplianceControlsIllustration';

interface ImportsLandingPageProps {
  onEnableModule?: () => void;
}

export function ImportsLandingPage({ onEnableModule }: ImportsLandingPageProps) {
  const handleEnableModule = () => {
    if (onEnableModule) {
      onEnableModule();
    } else {
      toast.info('Navigation to App Store to be implemented');
    }
  };

  const features = [
    {
      icon: Scan,
      title: 'Automatic extraction & pre-fill',
      description: 'OCR + NLP to read your documents (PDF, scans, emails), automatically extract key fields: investor, fund, amounts, dates, clauses and pre-fill your forms.',
      gradient: 'from-blue-500 to-cyan-500',
      delay: 0.1,
      illustration: DataExtractionIllustration
    },
    {
      icon: Network,
      title: 'Smart classification & matching',
      description: 'Auto-classification by fund, closing and document type. Deduplication and automatic matching of entities (investors ↔ subscriptions ↔ documents) according to your business rules.',
      gradient: 'from-purple-500 to-pink-500',
      delay: 0.2,
      illustration: SmartClassificationIllustration
    },
    {
      icon: Shield,
      title: 'Controls & compliance by design',
      description: 'Configurable validation rules, exception handling, complete audit trail, GDPR compliance, and human batch validation in a dedicated review view.',
      gradient: 'from-green-500 to-emerald-500',
      delay: 0.3,
      illustration: ComplianceControlsIllustration
    }
  ];

  const benefits = [
    'Time savings: 90% reduction in manual work',
    'Increased accuracy thanks to AI and double-checking',
    'Complete traceability of every import',
    'Direct integration with your workflows',
    'Multi-format support (PDF, images, emails, CSV)',
    'Continuous learning of AI models'
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
                  From documents <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">to actionable data</span>
                </h1>
                <p className="text-xl text-white/80 mb-8 max-w-2xl">
                  Transform your unstructured documents (PDF, scans, emails…) into reliable, linked and actionable data in InvestHub. Automatic extraction, smart classification and built-in compliance.
                </p>
                <div className="flex gap-4">
                  <Button
                    size="lg"
                    onClick={handleEnableModule}
                    className="bg-white text-gray-900 hover:bg-gray-100 h-11"
                  >
                    Enable module
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
              <div className="w-96 h-96 relative">
                {/* Animated upload icon */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <FileUp className="w-48 h-48 text-white/20" />
                </motion.div>
                {/* Orbiting particles */}
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                    style={{
                      top: '50%',
                      left: '50%',
                      transformOrigin: '0 -100px',
                    }}
                    animate={{
                      rotate: 360,
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      rotate: {
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear",
                        delay: i * 2,
                      },
                      scale: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }
                    }}
                  />
                ))}
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
          <h2 className="text-3xl mb-4">How does it work?</h2>
          <p className="text-lg text-gray-600">
            A smart pipeline to transform your documents into structured data
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: feature.delay }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              {/* Illustration */}
              <div className="h-64">
                <feature.illustration />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Process Flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-16"
        >
          <h3 className="text-2xl mb-6 text-center">Automated import pipeline</h3>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { icon: FileSearch, label: 'Upload', color: 'blue' },
              { icon: Scan, label: 'Extraction', color: 'purple' },
              { icon: Network, label: 'Classification', color: 'pink' },
              { icon: Shield, label: 'Controls', color: 'green' },
              { icon: Zap, label: 'Integration', color: 'yellow' }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                className="relative flex flex-col items-center"
              >
                {/* Connector arrow */}
                {index < 4 && (
                  <motion.div
                    className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gray-300 to-gray-200"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 1 + index * 0.1, duration: 0.3 }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-l-gray-300 border-t-4 border-t-transparent border-b-4 border-b-transparent" />
                  </motion.div>
                )}

                <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-${step.color}-100 to-${step.color}-50 border-2 border-${step.color}-300 flex items-center justify-center mb-3 relative z-10`}>
                  <step.icon className={`w-8 h-8 text-${step.color}-600`} />
                </div>
                <span className="text-sm font-medium text-gray-700">{step.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
        >
          <h3 className="text-2xl mb-6">Key benefits</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 1.1 + index * 0.1 }}
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
          transition={{ duration: 0.6, delay: 1.3 }}
          className="text-center mt-16 bg-gradient-to-br from-gray-900 to-[#0F323D] rounded-2xl p-12 text-white"
        >
          <Lock className="w-16 h-16 mx-auto mb-4 text-white/80" />
          <h3 className="text-3xl mb-4">Ready to automate your imports?</h3>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Enable the Compliance Plus module to access smart imports and free your team from repetitive tasks.
          </p>
          <Button
            size="lg"
            onClick={handleEnableModule}
            className="bg-white text-gray-900 hover:bg-gray-100 h-11"
          >
            Enable Compliance Plus
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
