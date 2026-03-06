import { motion } from 'motion/react';
import { Eye, Lock, Folder, FileText, Info } from 'lucide-react';
import { Viewer } from '../utils/viewersMockData';

interface ViewAsInfoBannerProps {
  viewer: Viewer;
  visibleFoldersCount: number;
  hiddenFoldersCount: number;
  visibleDocsCount: number;
}

export function ViewAsInfoBanner({ 
  viewer, 
  visibleFoldersCount, 
  hiddenFoldersCount,
  visibleDocsCount 
}: ViewAsInfoBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      className="mx-6 mt-4 mb-2"
    >
      <div className="bg-gradient-to-r from-purple-50 via-purple-50/80 to-blue-50 border-l-4 border-purple-500 rounded-lg shadow-sm">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
              <Eye className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-purple-900">
                  Mode Vue Investisseur
                </h3>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-purple-100 border border-purple-300 rounded-full">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-purple-700">Actif</span>
                </div>
              </div>
              <p className="text-sm text-purple-800">
                Vous visualisez la Data Room comme{' '}
                <span className="font-semibold">{viewer.name}</span>
                {viewer.type === 'contact' && (
                  <span className="text-purple-700">
                    {' '}(Contact de{' '}
                    {viewer.company})
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            {/* Visible folders */}
            <div className="flex items-center gap-2.5 p-2.5 bg-white/60 rounded-lg border border-purple-200/50">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center flex-shrink-0">
                <Folder className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Dossiers visibles</p>
                <p className="text-lg font-bold text-emerald-700">{visibleFoldersCount}</p>
              </div>
            </div>

            {/* Hidden folders */}
            <div className="flex items-center gap-2.5 p-2.5 bg-white/60 rounded-lg border border-purple-200/50">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center flex-shrink-0">
                <Lock className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Dossiers masqués</p>
                <p className="text-lg font-bold text-gray-600">{hiddenFoldersCount}</p>
              </div>
            </div>

            {/* Visible docs */}
            <div className="flex items-center gap-2.5 p-2.5 bg-white/60 rounded-lg border border-purple-200/50">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Documents visibles</p>
                <p className="text-lg font-bold text-blue-700">{visibleDocsCount}</p>
              </div>
            </div>
          </div>

          {/* Info notice */}
          <div className="flex items-start gap-2 p-3 bg-white/80 rounded-lg border border-purple-200/50">
            <Info className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-purple-800 leading-relaxed">
              <p>
                <span className="font-semibold">Filtrage actif :</span> Seuls les dossiers et documents 
                accessibles par cet utilisateur sont affichés. Les dossiers vides ont été automatiquement masqués.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
