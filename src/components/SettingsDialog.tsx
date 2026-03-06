import { motion } from 'motion/react';
import { Settings, Building2, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entitiesManagementEnabled: boolean;
  onEntitiesManagementChange: (enabled: boolean) => void;
}

export function SettingsDialog({ 
  open, 
  onOpenChange, 
  entitiesManagementEnabled,
  onEntitiesManagementChange 
}: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-2xl">Paramètres</DialogTitle>
          </div>
          <DialogDescription>
            Configurez les modules et fonctionnalités de l'application
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Entities Management Setting */}
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <Label htmlFor="entities-management" className="text-base font-semibold cursor-pointer">
                      Gestion des Entités
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {entitiesManagementEnabled 
                      ? "Accédez au module complet de gestion des entités avec tableau, filtres et workflows."
                      : "Découvrez les fonctionnalités du module de gestion des entités avant activation."
                    }
                  </p>
                  
                  {entitiesManagementEnabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 flex items-center gap-2 text-sm text-green-600"
                    >
                      <Check className="w-4 h-4" />
                      <span className="font-medium">Module activé et opérationnel</span>
                    </motion.div>
                  )}
                </div>
                <Switch
                  id="entities-management"
                  checked={entitiesManagementEnabled}
                  onCheckedChange={onEntitiesManagementChange}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-cyan-600"
                />
              </div>
            </CardContent>
          </Card>

          {/* Future Settings Placeholder */}
          <Card className="border-2 border-dashed border-gray-200 bg-gray-50/50">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-gray-500">
                D'autres paramètres seront disponibles prochainement...
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
