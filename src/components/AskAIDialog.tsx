import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, TrendingUp, AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Subscription } from '../utils/subscriptionGenerator';
import { analyzeSubscriptions, AIAnalysis } from '../utils/aiAnalyzer';

interface AskAIDialogProps {
  open: boolean;
  onClose: () => void;
  subscriptions: Subscription[];
  onApplyInsight?: (items: Subscription[]) => void;
  onAnalysisComplete?: (analysis: AIAnalysis) => void;
}

export function AskAIDialog({ 
  open, 
  onClose, 
  subscriptions,
  onApplyInsight,
  onAnalysisComplete
}: AskAIDialogProps) {
  const [question, setQuestion] = useState('');
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const suggestedQuestions = [
    "Quelles sont les actions les plus urgentes à faire ?",
    "Quels sont les risques de compliance actuels ?",
    "Résume-moi l'activité de cette semaine",
    "Quelles souscriptions ont un onboarding trop long ?",
    "Quels sont les montants les plus importants en attente ?",
  ];

  const handleAsk = async () => {
    if (!question.trim()) return;

    setIsAnalyzing(true);
    
    // Simuler un délai pour l'effet "thinking"
    setTimeout(() => {
      const result = analyzeSubscriptions(question, subscriptions);
      setAnalysis(result);
      setIsAnalyzing(false);
      
      // Notifier le parent avec l'analyse
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    }, 800);
  };

  const handleQuestionClick = (q: string) => {
    setQuestion(q);
    setAnalysis(null);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <TrendingUp className="w-5 h-5 text-orange-600" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getInsightBgColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'warning':
        return 'bg-orange-50 border-orange-200 hover:bg-orange-100';
      case 'success':
        return 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100';
      default:
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
    }
  };

  const handleApplyInsight = (items?: Subscription[]) => {
    if (items && onApplyInsight) {
      onApplyInsight(items);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            Ask AI Assistant
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Posez une question pour obtenir des insights sur vos souscriptions.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4 px-6 pb-6">
          {/* Question Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Posez votre question
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
                placeholder="Ex: Quelles sont les actions urgentes à faire ?"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <Button
                onClick={handleAsk}
                disabled={!question.trim() || isAnalyzing}
                className="px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isAnalyzing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Suggested Questions */}
          {!analysis && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Questions suggérées :</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuestionClick(q)}
                    className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-full hover:bg-purple-50 hover:border-purple-300 transition-colors"
                  >
                    {q}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Analysis Results */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center justify-center py-12"
              >
                <div className="text-center space-y-4">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 360]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    className="inline-block p-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </motion.div>
                  <p className="text-gray-600">Analyse en cours...</p>
                </div>
              </motion.div>
            )}

            {analysis && !isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Summary */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-purple-900">{analysis.summary}</p>
                      <p className="text-sm text-purple-700 mt-1">
                        Basé sur l'analyse de {subscriptions.length} souscriptions
                      </p>
                    </div>
                  </div>
                </div>

                {/* Insights */}
                {analysis.insights.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Insights détectés :</h3>
                    {analysis.insights.map((insight, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => handleApplyInsight(insight.items)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${getInsightBgColor(insight.type)}`}
                      >
                        <div className="flex items-start gap-3">
                          {getInsightIcon(insight.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900">{insight.title}</h4>
                              <span className="px-2 py-0.5 text-xs font-medium bg-white rounded-full border border-gray-300">
                                {insight.count}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mt-1">{insight.description}</p>
                            {insight.items && (
                              <p className="text-xs text-gray-500 mt-2">
                                Cliquer pour voir les {insight.count} souscription{insight.count > 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                    <p>Tout est en ordre ! Aucune action urgente détectée.</p>
                  </div>
                )}

                {/* Ask Another Question */}
                <div className="pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => {
                      setAnalysis(null);
                      setQuestion('');
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Poser une autre question
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}