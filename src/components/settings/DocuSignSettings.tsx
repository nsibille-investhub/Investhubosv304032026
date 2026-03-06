import React, { useState, useRef } from 'react';
import { Plus, Trash2, GripVertical, Edit2, X, Mail, AlertTriangle, FileText, CheckCircle2, XCircle, HelpCircle, Lightbulb } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CountBadge } from '../ui/count-badge';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface DocuSignSignature {
  id: string;
  texte: string;
  decalageHorizontal: number;
  decalageVertical: number;
  interne: boolean;
  restrictionEmail?: string;
  restrictionIteration?: number;
  champs: boolean;
  obligatoire?: boolean;
  contractCount: number;
  rank: number;
}

const mockSignatures: DocuSignSignature[] = [
  { id: '1', texte: 'Brakro1', decalageHorizontal: 0, decalageVertical: -20, interne: false, champs: false, contractCount: 12, rank: 0 },
  { id: '2', texte: 'Christophe Aubut', decalageHorizontal: 0, decalageVertical: -20, interne: false, champs: true, obligatoire: true, contractCount: 8, rank: 1 },
  { id: '3', texte: 'commercialisation des fonds d\'investissement ?', decalageHorizontal: -195, decalageVertical: 0, interne: true, restrictionEmail: 'claudia@eurazeo.com', champs: false, contractCount: 24, rank: 2 },
  { id: '4', texte: 'commercialisation des fonds d\'investissement ?', decalageHorizontal: 25055, decalageVertical: 0, interne: false, champs: true, obligatoire: false, contractCount: 5, rank: 3 },
  { id: '5', texte: 'Convention de distribution Eurazeo Global Investor', decalageHorizontal: 38-15, decalageVertical: 0, interne: true, champs: false, contractCount: 18, rank: 4 },
  { id: '6', texte: 'Convention de distribution Eurazeo Global Investor', decalageHorizontal: 320-15, decalageVertical: 0, interne: false, restrictionEmail: 'claudia@eurazeo.com', champs: false, contractCount: 3, rank: 5 },
  { id: '7', texte: 'duly appointed distributor on', decalageHorizontal: 19090, decalageVertical: 1, interne: false, champs: true, obligatoire: true, contractCount: 15, rank: 6 },
  { id: '8', texte: 'duly appointed distributor on', decalageHorizontal: 19090, decalageVertical: 1, interne: true, champs: false, contractCount: 9, rank: 7 },
  { id: '9', texte: 'Marc Beaudouin', decalageHorizontal: 0, decalageVertical: -20, interne: false, champs: false, contractCount: 21, rank: 8 },
  { id: '10', texte: 'Pacte récemment d\'actionnaire', decalageHorizontal: 0, decalageVertical: -20, interne: false, champs: true, obligatoire: true, contractCount: 7, rank: 9 },
  { id: '11', texte: 'Person taking', decalageHorizontal: 25180, decalageVertical: 1, interne: true, champs: false, contractCount: 14, rank: 10 },
  { id: '12', texte: 'Person taking', decalageHorizontal: 25180, decalageVertical: 1, interne: false, restrictionIteration: 1, champs: true, obligatoire: true, contractCount: 31, rank: 11 },
  { id: '13', texte: 'Sign here', decalageHorizontal: 28013, decalageVertical: 0, interne: true, restrictionIteration: 1, champs: false, contractCount: 6, rank: 12 },
  { id: '14', texte: 'Sign-here', decalageHorizontal: 28013, decalageVertical: 0, interne: false, restrictionIteration: 1, champs: true, obligatoire: false, contractCount: 11, rank: 13 },
  { id: '15', texte: 'Signature1', decalageHorizontal: 19013, decalageVertical: 0, interne: true, restrictionIteration: 1, champs: false, contractCount: 19, rank: 14 },
  { id: '16', texte: 'Signature1', decalageHorizontal: 19013, decalageVertical: 0, interne: false, restrictionIteration: 1, champs: true, obligatoire: true, contractCount: 4, rank: 15 },
  { id: '17', texte: 'Signature du signataire potentiel', decalageHorizontal: 3638, decalageVertical: 0, interne: true, restrictionIteration: 2, champs: false, contractCount: 27, rank: 16 },
];

// Composant HelpCard pour les aides contextuelles sur chaque champ
interface HelpCardProps {
  title: string;
  description: string;
  isVisible: boolean;
}

function HelpCard({ title, description, isVisible }: HelpCardProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg"
    >
      <div className="flex gap-2">
        <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-blue-900 mb-1">{title}</p>
          <p className="text-xs text-blue-700 leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

// Composant InfoBanner pour la définition fonctionnelle de l'objet
interface InfoBannerProps {
  title: string;
  description: string;
  helpUrl: string;
  isVisible: boolean;
}

function InfoBanner({ title, description, helpUrl, isVisible }: InfoBannerProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg"
    >
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-white border border-blue-300 flex items-center justify-center flex-shrink-0">
          <HelpCircle className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-900 mb-1">
            <strong>{title}</strong>
          </p>
          <p className="text-sm text-slate-700 leading-relaxed mb-2">{description}</p>
          <a
            href={helpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-700 hover:text-blue-800 hover:underline transition-colors"
          >
            En savoir plus sur le centre d'aide
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </motion.div>
  );
}

interface DraggableRowProps {
  signature: DocuSignSignature;
  index: number;
  moveSignature: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (signature: DocuSignSignature) => void;
  onDelete: (id: string) => void;
  isPanelOpen: boolean;
}

const DraggableRow: React.FC<DraggableRowProps> = ({
  signature,
  index,
  moveSignature,
  onEdit,
  onDelete,
  isPanelOpen,
}) => {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: 'signature',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: { id: string; index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveSignature(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'signature',
    item: () => {
      return { id: signature.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <tr
      ref={ref}
      data-handler-id={handlerId}
      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {!isPanelOpen && (
        <td className="p-3">
          <div className="flex items-center gap-2 cursor-move">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
        </td>
      )}
      <td className="p-3">
        <span className="text-sm">{signature.texte}</span>
      </td>
      {!isPanelOpen && (
        <>
          <td className="p-3 text-sm text-gray-600">
            {signature.decalageHorizontal}/{signature.decalageVertical}
          </td>
          <td className="p-3">
            <Badge 
              variant="outline" 
              className={signature.interne 
                ? "bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1.5 w-fit" 
                : "bg-gray-100 text-gray-700 border-gray-200 flex items-center gap-1.5 w-fit"
              }
            >
              <Mail className="w-3.5 h-3.5" />
              {signature.interne ? 'Interne' : 'Externe'}
            </Badge>
          </td>
          <td className="p-3">
            <div className="flex flex-col gap-1">
              <Badge 
                variant="outline" 
                className={signature.champs 
                  ? "bg-green-50 text-green-700 border-green-200 flex items-center gap-1.5 w-fit" 
                  : "bg-gray-100 text-gray-600 border-gray-200 flex items-center gap-1.5 w-fit"
                }
              >
                {signature.champs ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Actifs
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    Inactifs
                  </>
                )}
              </Badge>
              {signature.champs && signature.obligatoire && (
                <Badge 
                  variant="outline" 
                  className="bg-orange-50 text-orange-700 border-orange-200 flex items-center gap-1.5 w-fit text-xs"
                >
                  Obligatoire
                </Badge>
              )}
            </div>
          </td>
          <td className="p-3">
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1.5 w-fit">
              <FileText className="w-3.5 h-3.5" />
              {signature.contractCount}
            </Badge>
          </td>
        </>
      )}
      <td className="p-3">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => onEdit(signature)}
            className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(signature.id)}
            className="text-gray-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

interface SignaturePanelProps {
  signature?: DocuSignSignature;
  isOpen: boolean;
  onClose: () => void;
  onSave: (signature: Omit<DocuSignSignature, 'id' | 'rank'>) => void;
  helpMode: boolean;
}

const SignaturePanel: React.FC<SignaturePanelProps> = ({ signature, isOpen, onClose, onSave, helpMode }) => {
  const [texte, setTexte] = useState(signature?.texte || '');
  const [decalageH, setDecalageH] = useState(signature?.decalageHorizontal.toString() || '0');
  const [decalageV, setDecalageV] = useState(signature?.decalageVertical.toString() || '0');
  const [interne, setInterne] = useState(signature?.interne || false);
  const [restrictionEmail, setRestrictionEmail] = useState(signature?.restrictionEmail || '');
  const [restrictionIteration, setRestrictionIteration] = useState(signature?.restrictionIteration?.toString() || '');
  const [champs, setChamps] = useState(signature?.champs || false);
  const [obligatoire, setObligatoire] = useState(signature?.obligatoire || false);

  React.useEffect(() => {
    if (signature) {
      setTexte(signature.texte);
      setDecalageH(signature.decalageHorizontal.toString());
      setDecalageV(signature.decalageVertical.toString());
      setInterne(signature.interne);
      setRestrictionEmail(signature.restrictionEmail || '');
      setRestrictionIteration(signature.restrictionIteration?.toString() || '');
      setChamps(signature.champs);
      setObligatoire(signature.obligatoire || false);
    } else {
      setTexte('');
      setDecalageH('0');
      setDecalageV('0');
      setInterne(false);
      setRestrictionEmail('');
      setRestrictionIteration('');
      setChamps(false);
      setObligatoire(false);
    }
  }, [signature, isOpen]);

  const handleSave = () => {
    if (!texte.trim()) return;
    
    onSave({
      texte,
      decalageHorizontal: parseInt(decalageH) || 0,
      decalageVertical: parseInt(decalageV) || 0,
      interne,
      restrictionEmail: restrictionEmail || undefined,
      restrictionIteration: restrictionIteration ? parseInt(restrictionIteration) : undefined,
      champs,
      obligatoire: champs ? obligatoire : undefined,
      contractCount: signature?.contractCount || 0,
    });
    onClose();
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 420, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="h-full bg-white border-l border-gray-200 flex flex-col overflow-hidden shadow-xl"
        >
          {/* Header */}
          <div className="flex-shrink-0 px-4 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm text-gray-900">
                  {signature ? 'Éditer la signature' : 'Nouvelle signature'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configuration de la signature DocuSign
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Basic Information */}
              <div className="space-y-2.5">
                <div>
                  <Label className="text-xs text-gray-700 mb-1.5 block">
                    Texte de la signature <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={texte}
                    onChange={(e) => setTexte(e.target.value)}
                    placeholder="Brakro1"
                    className="h-9 text-sm"
                    required
                  />
                  <HelpCard
                    isVisible={helpMode}
                    title="Texte de la signature"
                    description="Le mot-clé qui sera recherché dans le document pour placer la signature. DocuSign cherchera ce texte dans le PDF et placera automatiquement le champ de signature à côté."
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <Label className="text-xs text-gray-700 mb-1.5 block">
                      Décalage horizontal
                    </Label>
                    <Input
                      type="number"
                      value={decalageH}
                      onChange={(e) => setDecalageH(e.target.value)}
                      placeholder="0"
                      className="h-9 text-sm"
                    />
                    <HelpCard
                      isVisible={helpMode}
                      title="Décalage horizontal"
                      description="Ajustement horizontal en pixels par rapport au mot-clé trouvé. Valeur positive = vers la droite, négative = vers la gauche. Permet d'ajuster finement la position de la signature."
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-gray-700 mb-1.5 block">
                      Décalage vertical
                    </Label>
                    <Input
                      type="number"
                      value={decalageV}
                      onChange={(e) => setDecalageV(e.target.value)}
                      placeholder="0"
                      className="h-9 text-sm"
                    />
                    <HelpCard
                      isVisible={helpMode}
                      title="Décalage vertical"
                      description="Ajustement vertical en pixels par rapport au mot-clé trouvé. Valeur positive = vers le bas, négative = vers le haut. Utilisez -20 pour positionner au-dessus du texte."
                    />
                  </div>
                </div>
              </div>

              {/* Configuration Section */}
              <div className="pt-3 border-t border-gray-200 space-y-3">
                <Label className="text-xs text-gray-600 block">Configuration de la signature</Label>

                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="interne"
                      checked={interne}
                      onCheckedChange={(checked) => setInterne(checked as boolean)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="interne"
                        className="text-sm text-gray-700 cursor-pointer block"
                      >
                        Signature interne (mail interne)
                      </label>
                      <HelpCard
                        isVisible={helpMode}
                        title="Signature interne"
                        description="Cochez cette case si la signature doit être effectuée par un membre interne de votre organisation (contre-signature). La signature sera attribuée à l'email interne configuré plutôt qu'à l'investisseur."
                      />
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="champs"
                      checked={champs}
                      onCheckedChange={(checked) => {
                        setChamps(checked as boolean);
                        if (!checked) {
                          setObligatoire(false);
                        }
                      }}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="champs"
                        className="text-sm text-gray-700 cursor-pointer block"
                      >
                        Activer les champs
                      </label>
                      <HelpCard
                        isVisible={helpMode}
                        title="Champs actifs"
                        description="Active les champs de formulaire supplémentaires dans DocuSign. Permet au signataire de remplir des informations complémentaires en plus de la signature."
                      />
                    </div>
                  </div>

                  {champs && (
                    <div className="ml-6 pl-3 border-l-2 border-green-200">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="obligatoire"
                          checked={obligatoire}
                          onCheckedChange={(checked) => setObligatoire(checked as boolean)}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor="obligatoire"
                            className="text-sm text-gray-700 cursor-pointer block"
                          >
                            Champs obligatoires
                          </label>
                          <HelpCard
                            isVisible={helpMode}
                            title="Champs obligatoires"
                            description="Rend les champs de formulaire obligatoires. Le signataire ne pourra pas valider sans remplir ces champs."
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-xs text-gray-700 mb-1.5 block">
                      Restriction e-mail
                    </Label>
                    <Input
                      value={restrictionEmail}
                      onChange={(e) => setRestrictionEmail(e.target.value)}
                      placeholder="email@exemple.com"
                      className="h-9 text-sm"
                    />
                    <HelpCard
                      isVisible={helpMode}
                      title="Restriction e-mail"
                      description="Réserve cette signature à un signataire spécifique identifié par son email. Utile pour les contre-signatures ou pour cibler un signataire précis dans les documents multi-signataires."
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-gray-700 mb-1.5 block">
                      Restriction itération
                    </Label>
                    <Input
                      type="number"
                      value={restrictionIteration}
                      onChange={(e) => setRestrictionIteration(e.target.value)}
                      placeholder="1 ou 2"
                      className="h-9 text-sm"
                    />
                    <HelpCard
                      isVisible={helpMode}
                      title="Restriction itération"
                      description="En cas de 2 signataires, indiquez 1 pour le premier signataire et 2 pour le second. Permet de distinguer les champs de signature pour chaque signataire dans un ordre précis."
                    />
                  </div>
                </div>
              </div>

              {/* Information Section - Read Only */}
              {signature && (
                <div className="pt-3 border-t border-gray-200">
                  <Label className="text-xs text-gray-600 mb-2.5 block">Informations</Label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Contrats utilisant cette signature</span>
                      <CountBadge count={signature.contractCount} icon={FileText} variant="purple" />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-9 text-sm"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSave}
                  style={{
                    background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
                    color: 'white'
                  }}
                  className="flex-1 h-9 text-sm"
                  disabled={!texte.trim()}
                >
                  {signature ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function DocuSignSettingsContent() {
  const [signatures, setSignatures] = useState(mockSignatures);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingSignature, setEditingSignature] = useState<DocuSignSignature | undefined>();
  const [deletingSignature, setDeletingSignature] = useState<DocuSignSignature | undefined>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [helpMode, setHelpMode] = useState(false);

  const moveSignature = (dragIndex: number, hoverIndex: number) => {
    const dragSignature = signatures[dragIndex];
    const newSignatures = [...signatures];
    newSignatures.splice(dragIndex, 1);
    newSignatures.splice(hoverIndex, 0, dragSignature);
    
    setSignatures(newSignatures.map((s, index) => ({
      ...s,
      rank: index
    })));
  };

  const handleAdd = () => {
    setEditingSignature(undefined);
    setIsPanelOpen(true);
  };

  const handleEdit = (signature: DocuSignSignature) => {
    setEditingSignature(signature);
    setIsPanelOpen(true);
  };

  const handleSave = (signatureData: Omit<DocuSignSignature, 'id' | 'rank'>) => {
    if (editingSignature) {
      setSignatures(signatures.map(s => 
        s.id === editingSignature.id 
          ? { ...s, ...signatureData }
          : s
      ));
      toast.success('Signature modifiée', {
        description: 'La signature a été modifiée avec succès'
      });
    } else {
      const newSignature: DocuSignSignature = {
        id: Date.now().toString(),
        ...signatureData,
        rank: signatures.length
      };
      setSignatures([...signatures, newSignature]);
      toast.success('Signature créée', {
        description: 'La signature a été créée avec succès'
      });
    }
    setIsPanelOpen(false);
    setEditingSignature(undefined);
  };

  const handleDelete = (id: string) => {
    const signature = signatures.find(s => s.id === id);
    if (signature) {
      setDeletingSignature(signature);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (deletingSignature) {
      setSignatures(signatures.filter(s => s.id !== deletingSignature.id).map((s, index) => ({
        ...s,
        rank: index
      })));
      toast.success('Signature supprimée', {
        description: 'La signature a été supprimée avec succès'
      });
      setIsDeleteDialogOpen(false);
      setDeletingSignature(undefined);
    }
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) {
          setDeletingSignature(undefined);
        }
      }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle className="text-left mb-1">
                  Supprimer la signature ?
                </AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className="text-left space-y-4">
              {deletingSignature && (
                <>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">{deletingSignature.texte}</span>
                      <Badge 
                        variant="outline" 
                        className={deletingSignature.interne 
                          ? "bg-blue-50 text-blue-700 border-blue-200" 
                          : "bg-gray-100 text-gray-700 border-gray-200"
                        }
                      >
                        {deletingSignature.interne ? 'Interne' : 'Externe'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1.5 text-xs">
                        <FileText className="w-3 h-3" />
                        {deletingSignature.contractCount} contrats
                      </Badge>
                      {deletingSignature.champs && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                          Champs actifs
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      Cette action est <strong>irréversible</strong>. La suppression de cette signature entraînera :
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1.5 ml-4">
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>Impact sur <strong>{deletingSignature.contractCount} contrat{deletingSignature.contractCount > 1 ? 's' : ''}</strong> utilisant cette signature</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>Suppression de la signature de tous les documents DocuSign</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>Impact sur les workflows de signature en cours</span>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingSignature(undefined);
              }}
              className="h-9"
            >
              Annuler
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white h-9"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Content */}
      <motion.div 
        animate={{ 
          width: isPanelOpen ? 'calc(100% - 420px)' : '100%' 
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="flex-shrink-0 overflow-auto"
      >
        <div className="p-6">
          {/* Info Banner */}
          <InfoBanner
            isVisible={helpMode}
            title="Qu'est-ce qu'une signature DocuSign ?"
            description="Les signatures DocuSign permettent de définir où et comment les champs de signature doivent être placés dans vos documents. Après la validation d'une souscription, l'investisseur reçoit un email l'invitant à signer électroniquement. Chaque signature est positionnée automatiquement à côté d'un mot-clé dans le document, avec des décalages ajustables pour un positionnement précis."
            helpUrl="https://help.investhub.com/parametrage-signature-electronique-docusign"
          />

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl mb-2">Signatures DocuSign</h1>
              <p className="text-sm text-gray-600">
                {signatures.length} signature{signatures.length > 1 ? 's' : ''} configurée{signatures.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setHelpMode(!helpMode)}
                variant={helpMode ? "default" : "outline"}
                className="h-9"
                style={helpMode ? {
                  background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                  color: 'white'
                } : {}}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                {helpMode ? 'Guidage activé' : 'Aide'}
              </Button>
              <Button
                onClick={handleAdd}
                style={{
                  background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
                  color: 'white'
                }}
                className="h-9"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une signature
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    {!isPanelOpen && <th className="w-12 p-3"></th>}
                    <th className="text-left p-3 text-xs text-gray-500">Texte</th>
                    {!isPanelOpen && (
                      <>
                        <th className="text-left p-3 text-xs text-gray-500">Décalage (H/V)</th>
                        <th className="text-left p-3 text-xs text-gray-500">Type</th>
                        <th className="text-left p-3 text-xs text-gray-500">Champs</th>
                        <th className="text-left p-3 text-xs text-gray-500">Contrats</th>
                      </>
                    )}
                    <th className="w-24 p-3 text-right text-xs text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {signatures.map((signature, index) => (
                    <DraggableRow
                      key={signature.id}
                      signature={signature}
                      index={index}
                      moveSignature={moveSignature}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isPanelOpen={isPanelOpen}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Edit Panel */}
      <SignaturePanel
        signature={editingSignature}
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setEditingSignature(undefined);
        }}
        onSave={handleSave}
        helpMode={helpMode}
      />
    </div>
  );
}

export function DocuSignSettings() {
  return (
    <DndProvider backend={HTML5Backend}>
      <DocuSignSettingsContent />
    </DndProvider>
  );
}
