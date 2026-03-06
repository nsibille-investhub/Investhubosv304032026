import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Download, 
  Printer, 
  Droplet, 
  Plus,
  X,
  User,
  Building2,
  Mail,
  TrendingUp,
  Check
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from 'sonner';

interface AccessUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  investor: string;
  accessLevel: 'view' | 'download' | 'edit';
}

interface DocumentAccessTabProps {
  documentId: string;
  defaultAccessLevel: 'view' | 'download' | 'edit';
  defaultPermissions: {
    downloadable: boolean;
    printable: boolean;
    watermark: boolean;
  };
}

export function DocumentAccessTab({ documentId, defaultAccessLevel, defaultPermissions }: DocumentAccessTabProps) {
  const [accessLevel, setAccessLevel] = useState(defaultAccessLevel);
  const [permissions, setPermissions] = useState(defaultPermissions);
  const [users, setUsers] = useState<AccessUser[]>([
    {
      id: '1',
      firstName: 'Sarah',
      lastName: 'Connor',
      email: 'sarah.connor@investhub.cloud',
      investor: 'Connor Family Trust',
      accessLevel: 'download'
    },
    {
      id: '2',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@investhub.cloud',
      investor: 'John Smith Capital',
      accessLevel: 'view'
    },
    {
      id: '3',
      firstName: 'Marie',
      lastName: 'Dubois',
      email: 'marie.dubois@investhub.cloud',
      investor: 'GlobalTrade Investment Fund',
      accessLevel: 'download'
    }
  ]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState<Partial<AccessUser>>({
    firstName: '',
    lastName: '',
    email: '',
    investor: '',
    accessLevel: 'view'
  });

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'view':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'download':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'edit':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getAccessLevelLabel = (level: string) => {
    switch (level) {
      case 'view':
        return 'Consultation';
      case 'download':
        return 'Téléchargement';
      case 'edit':
        return 'Édition';
      default:
        return level;
    }
  };

  const handleAddUser = () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.investor) {
      toast.error('Erreur', { description: 'Veuillez remplir tous les champs' });
      return;
    }

    const user: AccessUser = {
      id: Date.now().toString(),
      firstName: newUser.firstName!,
      lastName: newUser.lastName!,
      email: newUser.email!,
      investor: newUser.investor!,
      accessLevel: newUser.accessLevel as 'view' | 'download' | 'edit'
    };

    setUsers([...users, user]);
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      investor: '',
      accessLevel: 'view'
    });
    setIsAddingUser(false);
    toast.success('Utilisateur ajouté', { 
      description: `${user.firstName} ${user.lastName} a été ajouté` 
    });
  };

  const handleRemoveUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    setUsers(users.filter(u => u.id !== userId));
    if (user) {
      toast.info('Utilisateur retiré', { 
        description: `${user.firstName} ${user.lastName} n'a plus accès` 
      });
    }
  };

  const handleUpdateUserAccess = (userId: string, newAccessLevel: string) => {
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, accessLevel: newAccessLevel as 'view' | 'download' | 'edit' }
        : u
    ));
    toast.success('Accès mis à jour', { description: 'Le niveau d\'accès a été modifié' });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Niveau d'accès global */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              Niveau d'accès
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Définissez qui peut accéder à ce document
            </p>
          </div>
          <Select value={accessLevel} onValueChange={(value: any) => setAccessLevel(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="view">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Consultation
                </div>
              </SelectItem>
              <SelectItem value="download">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-600" />
                  Téléchargement
                </div>
              </SelectItem>
              <SelectItem value="edit">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-600" />
                  Édition
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Current access level display */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-4 bg-blue-50 border border-blue-200 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              {accessLevel === 'view' && <Shield className="w-5 h-5 text-blue-600" />}
              {accessLevel === 'download' && <Download className="w-5 h-5 text-blue-600" />}
              {accessLevel === 'edit' && <Shield className="w-5 h-5 text-blue-600" />}
            </div>
            <div className="flex-1">
              <p className="font-medium text-blue-900">{getAccessLevelLabel(accessLevel)}</p>
              <p className="text-sm text-blue-700">Niveau d'accès par défaut pour ce document</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">Utilisateurs autorisés</h4>
            <p className="text-sm text-gray-600 mt-0.5">{users.length} personne{users.length > 1 ? 's' : ''} ont accès</p>
          </div>
          <Button
            onClick={() => setIsAddingUser(true)}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </Button>
        </div>

        {/* Add user form */}
        <AnimatePresence>
          {isAddingUser && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-xl border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-gray-900">Nouvel utilisateur</h5>
                  <button
                    onClick={() => setIsAddingUser(false)}
                    className="p-1 hover:bg-blue-200 rounded-md transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="firstName" className="text-xs">Prénom</Label>
                    <Input
                      id="firstName"
                      value={newUser.firstName}
                      onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                      placeholder="Prénom"
                      className="mt-1 bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-xs">Nom</Label>
                    <Input
                      id="lastName"
                      value={newUser.lastName}
                      onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                      placeholder="Nom"
                      className="mt-1 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="email@example.com"
                    className="mt-1 bg-white"
                  />
                </div>

                <div>
                  <Label htmlFor="investor" className="text-xs">Investisseur de rattachement</Label>
                  <Select 
                    value={newUser.investor} 
                    onValueChange={(value) => setNewUser({ ...newUser, investor: value })}
                  >
                    <SelectTrigger id="investor" className="mt-1 bg-white">
                      <SelectValue placeholder="Sélectionner un investisseur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Connor Family Trust">Connor Family Trust</SelectItem>
                      <SelectItem value="John Smith Capital">John Smith Capital</SelectItem>
                      <SelectItem value="GlobalTrade Investment Fund">GlobalTrade Investment Fund</SelectItem>
                      <SelectItem value="FutureInvest Partners LP">FutureInvest Partners LP</SelectItem>
                      <SelectItem value="TechNova Ventures">TechNova Ventures</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="newUserAccess" className="text-xs">Niveau d'accès</Label>
                  <Select 
                    value={newUser.accessLevel} 
                    onValueChange={(value) => setNewUser({ ...newUser, accessLevel: value as any })}
                  >
                    <SelectTrigger id="newUserAccess" className="mt-1 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">Consultation</SelectItem>
                      <SelectItem value="download">Téléchargement</SelectItem>
                      <SelectItem value="edit">Édition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleAddUser}
                  className="w-full bg-gradient-to-r from-[#0066FF] to-[#0052CC]"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Ajouter l'utilisateur
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Users list */}
        <div className="space-y-2">
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-gray-600" />
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-gray-900 truncate">
                        {user.firstName} {user.lastName}
                      </h5>
                      <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      className="p-1.5 hover:bg-red-100 rounded-md opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate">{user.investor}</span>
                  </div>

                  {/* Access level selector */}
                  <Select 
                    value={user.accessLevel} 
                    onValueChange={(value) => handleUpdateUserAccess(user.id, value)}
                  >
                    <SelectTrigger className="w-full h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">
                        <div className="flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5 text-blue-600" />
                          Consultation
                        </div>
                      </SelectItem>
                      <SelectItem value="download">
                        <div className="flex items-center gap-2">
                          <Download className="w-3.5 h-3.5 text-emerald-600" />
                          Téléchargement
                        </div>
                      </SelectItem>
                      <SelectItem value="edit">
                        <div className="flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5 text-purple-600" />
                          Édition
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          ))}

          {users.length === 0 && !isAddingUser && (
            <div className="text-center py-12 text-gray-400">
              <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Aucun utilisateur spécifique. Utilisez le bouton "Ajouter" pour commencer.</p>
            </div>
          )}
        </div>
      </div>

      {/* Permissions par défaut */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h4 className="font-semibold text-gray-900">Permissions</h4>
        <p className="text-sm text-gray-600 -mt-2">Permissions accordées par défaut</p>

        <div className="space-y-3">
          {/* Téléchargeable */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Téléchargeable</p>
                <p className="text-sm text-gray-600">Permet de télécharger le document</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${permissions.downloadable ? 'text-emerald-600' : 'text-gray-400'}`}>
                {permissions.downloadable ? 'Oui' : 'Non'}
              </span>
              <Switch
                checked={permissions.downloadable}
                onCheckedChange={(checked) => {
                  setPermissions({ ...permissions, downloadable: checked });
                  toast.success('Permission mise à jour');
                }}
              />
            </div>
          </div>

          {/* Imprimable */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <Printer className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Imprimable</p>
                <p className="text-sm text-gray-600">Permet d'imprimer le document</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${permissions.printable ? 'text-emerald-600' : 'text-gray-400'}`}>
                {permissions.printable ? 'Oui' : 'Non'}
              </span>
              <Switch
                checked={permissions.printable}
                onCheckedChange={(checked) => {
                  setPermissions({ ...permissions, printable: checked });
                  toast.success('Permission mise à jour');
                }}
              />
            </div>
          </div>

          {/* Watermark */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <Droplet className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Watermark</p>
                <p className="text-sm text-gray-600">Ajoute un filigrane sur le document</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${permissions.watermark ? 'text-purple-600' : 'text-gray-400'}`}>
                {permissions.watermark ? 'Activé' : 'Désactivé'}
              </span>
              <Switch
                checked={permissions.watermark}
                onCheckedChange={(checked) => {
                  setPermissions({ ...permissions, watermark: checked });
                  toast.success('Permission mise à jour');
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
