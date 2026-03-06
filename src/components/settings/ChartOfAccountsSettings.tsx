import React, { useState, useRef } from 'react';
import { Plus, Trash2, GripVertical, Edit2, X, AlertTriangle, FileText } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'motion/react';

interface Account {
  id: string;
  nom: string;
  compte: string;
  rank: number;
}

const mockAccounts: Account[] = [
  { id: '1', nom: 'Frais de gestion', compte: '6226', rank: 0 },
  { id: '2', nom: 'Honoraires', compte: '6227', rank: 1 },
  { id: '3', nom: 'Commissions', compte: '6228', rank: 2 },
];

interface DraggableRowProps {
  account: Account;
  index: number;
  moveAccount: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
  isPanelOpen: boolean;
}

const DraggableRow: React.FC<DraggableRowProps> = ({
  account,
  index,
  moveAccount,
  onEdit,
  onDelete,
  isPanelOpen,
}) => {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: 'account',
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

      moveAccount(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'account',
    item: () => {
      return { id: account.id, index };
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
        <span className="text-sm">{account.nom}</span>
      </td>
      <td className="p-3">
        <span className="text-sm font-mono">{account.compte}</span>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => onEdit(account)}
            className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(account.id)}
            className="text-gray-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

interface AccountPanelProps {
  account?: Account;
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Omit<Account, 'id' | 'rank'>) => void;
}

const AccountPanel: React.FC<AccountPanelProps> = ({ account, isOpen, onClose, onSave }) => {
  const [nom, setNom] = useState(account?.nom || '');
  const [compte, setCompte] = useState(account?.compte || '');

  React.useEffect(() => {
    if (account) {
      setNom(account.nom);
      setCompte(account.compte);
    } else {
      setNom('');
      setCompte('');
    }
  }, [account, isOpen]);

  const handleSave = () => {
    if (!nom.trim() || !compte.trim()) return;
    
    onSave({
      nom,
      compte,
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
                  {account ? 'Éditer le compte' : 'Ajouter un compte'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configuration du compte comptable
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
          <div className="overflow-y-auto flex-1">
            <div className="p-4 space-y-4">
              {/* Basic Information */}
              <div className="space-y-2.5">
                <div>
                  <Label className="text-xs text-gray-700 mb-1.5 block">
                    Nom<span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Frais de gestion"
                    className="h-9 text-sm"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-700 mb-1.5 block">
                    Compte<span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    value={compte}
                    onChange={(e) => setCompte(e.target.value)}
                    placeholder="6226"
                    className="h-9 text-sm font-mono"
                    required
                  />
                </div>
              </div>

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
                  disabled={!nom.trim() || !compte.trim()}
                >
                  {account ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function ChartOfAccountsSettingsContent() {
  const [accounts, setAccounts] = useState(mockAccounts);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>();
  const [deletingAccount, setDeletingAccount] = useState<Account | undefined>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const moveAccount = (dragIndex: number, hoverIndex: number) => {
    const dragAccount = accounts[dragIndex];
    const newAccounts = [...accounts];
    newAccounts.splice(dragIndex, 1);
    newAccounts.splice(hoverIndex, 0, dragAccount);
    
    setAccounts(newAccounts.map((account, index) => ({
      ...account,
      rank: index
    })));
  };

  const handleAdd = () => {
    setEditingAccount(undefined);
    setIsPanelOpen(true);
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setIsPanelOpen(true);
  };

  const handleSave = (accountData: Omit<Account, 'id' | 'rank'>) => {
    if (editingAccount) {
      setAccounts(accounts.map(account => 
        account.id === editingAccount.id 
          ? { ...account, ...accountData }
          : account
      ));
    } else {
      const newAccount: Account = {
        id: Date.now().toString(),
        ...accountData,
        rank: accounts.length
      };
      setAccounts([...accounts, newAccount]);
    }
    setIsPanelOpen(false);
    setEditingAccount(undefined);
  };

  const handleDelete = (id: string) => {
    const account = accounts.find(a => a.id === id);
    if (account) {
      setDeletingAccount(account);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (deletingAccount) {
      setAccounts(accounts.filter(a => a.id !== deletingAccount.id).map((account, index) => ({
        ...account,
        rank: index
      })));
      setIsDeleteDialogOpen(false);
      setDeletingAccount(undefined);
    }
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) {
          setDeletingAccount(undefined);
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
                  Supprimer le compte ?
                </AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className="text-left space-y-4">
              {deletingAccount && (
                <>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium">{deletingAccount.nom}</span>
                      <span className="text-sm text-gray-500 font-mono ml-auto">{deletingAccount.compte}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      Cette action est <strong>irréversible</strong>. Êtes-vous sûr de vouloir supprimer ce compte ?
                    </p>
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
                setDeletingAccount(undefined);
              }}
              className="h-9"
            >
              Annuler
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white h-9"
            >
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
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl mb-2">Plan comptable</h1>
              <p className="text-sm text-gray-600">Gérez votre plan comptable</p>
            </div>
            <Button
              onClick={handleAdd}
              style={{
                background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
                color: 'white'
              }}
              className="h-9"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un compte
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm text-gray-700">Plan comptable</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    {!isPanelOpen && <th className="w-12"></th>}
                    <th className="text-left p-3 text-sm text-gray-600">Nom</th>
                    <th className="text-left p-3 text-sm text-gray-600">Compte</th>
                    <th className="w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account, index) => (
                    <DraggableRow
                      key={account.id}
                      account={account}
                      index={index}
                      moveAccount={moveAccount}
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
      <AccountPanel
        account={editingAccount}
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setEditingAccount(undefined);
        }}
        onSave={handleSave}
      />
    </div>
  );
}

export function ChartOfAccountsSettings() {
  return (
    <DndProvider backend={HTML5Backend}>
      <ChartOfAccountsSettingsContent />
    </DndProvider>
  );
}
