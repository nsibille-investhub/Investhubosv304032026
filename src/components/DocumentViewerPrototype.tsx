import { motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Maximize2,
  Minimize2,
  PanelLeft,
  Search,
  Share2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Document } from '../utils/documentMockData';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface DocumentViewerPrototypeProps {
  document: Document;
  onClose: () => void;
}

export function DocumentViewerPrototype({ document, onClose }: DocumentViewerPrototypeProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [isFullWidth, setIsFullWidth] = useState(false);

  const totalPages = useMemo(() => {
    const seed = document.name.length + document.version + document.views;
    return Math.max(6, Math.min(18, (seed % 12) + 6));
  }, [document.name, document.version, document.views]);

  const pagePreviews = useMemo(
    () => Array.from({ length: Math.min(totalPages, 8) }, (_, index) => index + 1),
    [totalPages],
  );

  const nextPage = () => setCurrentPage((page) => Math.min(totalPages, page + 1));
  const previousPage = () => setCurrentPage((page) => Math.max(1, page - 1));
  const zoomIn = () => setZoomLevel((zoom) => Math.min(200, zoom + 10));
  const zoomOut = () => setZoomLevel((zoom) => Math.max(50, zoom - 10));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-slate-950/82 backdrop-blur-[2px]"
    >
      <div className="flex h-full flex-col p-4 sm:p-6">
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.98, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex min-h-0 flex-1 overflow-hidden rounded-[28px] border border-slate-700 bg-slate-900 shadow-[0_30px_80px_rgba(2,6,23,0.8)]"
        >
          {showThumbnails && (
            <aside className="hidden w-24 border-r border-slate-800 bg-slate-950 px-3 py-4 lg:block">
              <div className="mb-4 flex items-center gap-2 px-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                <PanelLeft className="h-3.5 w-3.5" />
                Pages
              </div>
              <div className="space-y-3 overflow-y-auto pb-8">
                {pagePreviews.map((page) => {
                  const active = page === currentPage;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`group w-full rounded-2xl border p-2 text-left transition ${
                        active
                          ? 'border-blue-400 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                          : 'border-slate-800 bg-slate-900 hover:border-slate-700 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex aspect-[3/4] items-center justify-center rounded-xl border border-dashed border-slate-700 bg-gradient-to-b from-slate-100 to-slate-300 text-slate-500">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="mt-2 text-center text-[11px] font-medium text-slate-300 group-hover:text-white">
                        Page {page}
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>
          )}

          <section className="flex min-w-0 flex-1 flex-col bg-slate-900">
            <header className="border-b border-slate-800 bg-slate-950 px-4 py-3 sm:px-6">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">
                      <Eye className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{document.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span>{document.format || 'Document'}</span>
                        <span>•</span>
                        <span>{document.size || '—'}</span>
                        <span>•</span>
                        <span>v{document.version}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800" onClick={() => setShowThumbnails((value) => !value)}>
                    <PanelLeft className="mr-2 h-4 w-4" />
                    Miniatures
                  </Button>
                  <Button variant="outline" size="sm" className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800">
                    <Share2 className="mr-2 h-4 w-4" />
                    Partager
                  </Button>
                  <Button variant="outline" size="icon" className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </header>

            <div className="flex min-h-0 flex-1">
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3 sm:px-6">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800" onClick={previousPage}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-200">
                      Page {currentPage} / {totalPages}
                    </div>
                    <Button variant="outline" size="icon" className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800" onClick={nextPage}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800" onClick={zoomOut}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <div className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-200 min-w-[76px] text-center">
                      {zoomLevel}%
                    </div>
                    <Button variant="outline" size="icon" className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800" onClick={zoomIn}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800" onClick={() => setIsFullWidth((value) => !value)}>
                      {isFullWidth ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-auto bg-[#1E293B] p-4 sm:p-8">
                  <div className={`mx-auto flex min-h-full ${isFullWidth ? 'max-w-7xl' : 'max-w-4xl'} items-start justify-center`}>
                    <div
                      className="w-full rounded-[28px] border border-slate-300/60 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.45)]"
                      style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                    >
                      <div className="border-b border-slate-200 px-8 py-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Viewer prototype</p>
                            <h2 className="mt-2 text-2xl font-semibold text-slate-900">{document.name}</h2>
                          </div>
                          <Badge className="border-blue-200 bg-blue-50 text-blue-700">Apryse-style</Badge>
                        </div>
                      </div>

                      <div className="space-y-8 px-8 py-8">
                        <div className="grid gap-6 md:grid-cols-[1.4fr_0.9fr]">
                          <div className="space-y-4">
                            <div className="rounded-3xl bg-slate-100 p-6">
                              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">Résumé du document</p>
                                  <p className="mt-1 text-sm text-slate-500">Simulation d’une page rendue dans la visionneuse.</p>
                                </div>
                                <Search className="h-4 w-4 text-slate-400" />
                              </div>
                              <div className="mt-5 space-y-3 text-sm leading-7 text-slate-700">
                                <p>
                                  Ce prototype reproduit l’expérience d’un viewer intégré avec barre d’outils,
                                  navigation par pages, zone de lecture immersive et panneau d’informations.
                                </p>
                                <p>
                                  Le document <span className="font-medium text-slate-900">{document.name}</span> est affiché ici comme une maquette haute fidélité, prête à être remplacée plus tard par le SDK Apryse réel.
                                </p>
                              </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="rounded-3xl border border-slate-200 p-5">
                                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Annotations</p>
                                <p className="mt-3 text-sm font-medium text-slate-900">3 commentaires simulés</p>
                                <p className="mt-2 text-sm text-slate-500">Zones d’annotation, surlignage et sticky notes pourront être branchés ici.</p>
                              </div>
                              <div className="rounded-3xl border border-slate-200 p-5">
                                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Sécurité</p>
                                <p className="mt-3 text-sm font-medium text-slate-900">Watermark & droits</p>
                                <p className="mt-2 text-sm text-slate-500">Prévisualisation du comportement d’accès selon les règles du document.</p>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5">
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Insights page {currentPage}</p>
                            <div className="mt-4 space-y-4">
                              {[72, 56, 88, 41, 64].map((width, index) => (
                                <div key={index} className="space-y-2">
                                  <div className="h-2 rounded-full bg-slate-200">
                                    <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${width}%` }} />
                                  </div>
                                  <p className="text-xs text-slate-500">Bloc analytique simulé #{index + 1}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 p-6">
                          <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-900">Pied de page de lecture</p>
                            <span className="text-xs text-slate-400">Prototype UI</span>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-3">
                            {[
                              ['Ajouté par', document.uploadedBy],
                              ['Dernière mise à jour', new Date(document.updatedAt).toLocaleDateString('fr-FR')],
                              ['Téléchargements', `${document.downloads}`],
                            ].map(([label, value]) => (
                              <div key={label} className="rounded-2xl bg-slate-50 px-4 py-3">
                                <p className="text-xs text-slate-400">{label}</p>
                                <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="hidden w-[320px] flex-shrink-0 border-l border-slate-800 bg-slate-950 xl:block">
                <div className="border-b border-slate-800 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Document panel</p>
                  <h3 className="mt-2 text-sm font-semibold text-white">Détails rapides</h3>
                </div>
                <div className="space-y-5 px-5 py-5 text-sm text-slate-300">
                  <div>
                    <p className="text-xs text-slate-500">Nom</p>
                    <p className="mt-1 font-medium text-white">{document.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
                      <p className="text-xs text-slate-500">Format</p>
                      <p className="mt-1 text-white">{document.format || 'Document'}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
                      <p className="text-xs text-slate-500">Taille</p>
                      <p className="mt-1 text-white">{document.size || '—'}</p>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-slate-800 bg-slate-900 px-4 py-4">
                    <p className="text-xs text-slate-500">Permissions</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge className="bg-emerald-500/15 text-emerald-300">Lecture</Badge>
                      {document.access.downloadable && <Badge className="bg-blue-500/15 text-blue-300">Téléchargement</Badge>}
                      {document.access.printable && <Badge className="bg-purple-500/15 text-purple-300">Impression</Badge>}
                      {document.access.watermark && <Badge className="bg-amber-500/15 text-amber-300">Watermark</Badge>}
                    </div>
                  </div>
                  <div className="rounded-3xl border border-slate-800 bg-slate-900 px-4 py-4">
                    <p className="text-xs text-slate-500">Activité récente</p>
                    <div className="mt-3 space-y-3">
                      {(document.activities || []).slice(0, 3).map((activity) => (
                        <div key={activity.id} className="rounded-2xl border border-slate-800 bg-slate-950 px-3 py-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{activity.type}</p>
                          <p className="mt-1 text-sm text-white">{activity.user}</p>
                        </div>
                      ))}
                      {(!document.activities || document.activities.length === 0) && (
                        <p className="text-sm text-slate-400">Aucune activité mockée disponible.</p>
                      )}
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        </motion.div>
      </div>
    </motion.div>
  );
}
