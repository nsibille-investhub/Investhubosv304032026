import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { FolderPlus, ChevronDown, Check, Folder } from 'lucide-react';
import { toast } from 'sonner';

interface FolderOption {
  id: string;
  label: string;
}

interface AddFolderPopupProps {
  isOpen: boolean;
  onClose: () => void;
  folderOptions: FolderOption[];
  defaultParentId: string;
}

export function AddFolderPopup({ isOpen, onClose, folderOptions, defaultParentId }: AddFolderPopupProps) {
  const [name, setName] = useState('');
  const [usage, setUsage] = useState('');
  const [parentId, setParentId] = useState(defaultParentId);
  const [parentOpen, setParentOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setParentId(defaultParentId);
  }, [defaultParentId, isOpen]);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('Le nom du dossier est obligatoire.');
      return;
    }
    const parent = folderOptions.find((folder) => folder.id === parentId)?.label || 'Racine / Documents';
    toast.success('Dossier créé', { description: `${name} dans ${parent}` });
    onClose();
    setName('');
    setUsage('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="px-8 py-6 border-b">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2D7FF9] to-[#0F5DEB] flex items-center justify-center text-white">
              <FolderPlus className="w-7 h-7" />
            </div>
            <div>
              <DialogTitle className="text-4xl">Nouveau dossier</DialogTitle>
              <DialogDescription className="text-xl mt-1">Définissez le nom et l'usage de cet espace.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-8 py-6 space-y-6 bg-slate-50/40">
          <div className="space-y-2">
            <Label>Nom du dossier *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Rapports investisseurs Q2" className="h-12 text-lg" />
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-semibold">Usage</h3>
            <p className="text-slate-600 text-lg">Définissez l'usage et les restrictions liées à cet espace.</p>
            <Textarea value={usage} onChange={(e) => setUsage(e.target.value)} rows={4} placeholder="Ex: Dossier réservé aux rapports trimestriels de diffusion institutionnelle." />
          </div>

          <div className="space-y-2">
            <Label>Dossier parent</Label>
            <Popover open={parentOpen} onOpenChange={setParentOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between h-12 text-base font-normal">
                  {folderOptions.find((folder) => folder.id === parentId)?.label || 'Racine / Documents'}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Rechercher un dossier..." />
                  <CommandList>
                    <CommandEmpty>Aucun dossier trouvé.</CommandEmpty>
                    <CommandGroup>
                      {folderOptions.map((folder) => (
                        <CommandItem
                          key={folder.id}
                          value={folder.label}
                          onSelect={() => {
                            setParentId(folder.id);
                            setParentOpen(false);
                          }}
                          className="flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2 truncate"><Folder className="w-4 h-4 text-amber-600" />{folder.label}</span>
                          {folder.id === parentId && <Check className="w-4 h-4 text-blue-600" />}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="border-t px-8 py-4 bg-white flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit}>Créer le dossier</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
