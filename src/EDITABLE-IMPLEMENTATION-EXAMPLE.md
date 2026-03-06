# Exemple d'Implémentation : Section "Informations générales" Éditable

## Voici le code AVANT et APRÈS pour transformer une section statique en section éditable

### ❌ AVANT (Section statique - code actuel)

```tsx
{/* Informations générales */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="col-span-2 bg-white rounded-xl border border-gray-200 p-6"
>
  <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
    <User className="w-5 h-5 text-blue-600" />
    Informations générales
  </h2>
  
  <div className="grid grid-cols-2 gap-6">
    <div>
      <label className="text-xs text-gray-500 mb-1 block">Email</label>
      <div className="flex items-center gap-2">
        <Mail className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-900 flex-1">{investor.email}</span>
        <CopyButton text={investor.email} field="email" />
      </div>
    </div>
    
    <div>
      <label className="text-xs text-gray-500 mb-1 block">Téléphone</label>
      <div className="flex items-center gap-2">
        <Phone className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-900 flex-1">{investor.phone}</span>
        <CopyButton text={investor.phone} field="phone" />
      </div>
    </div>
    
    {investor.siren && (
      <div>
        <label className="text-xs text-gray-500 mb-1 block">SIREN</label>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-900 font-mono">{investor.siren}</span>
          <CopyButton text={investor.siren} field="siren" />
        </div>
      </div>
    )}
  </div>
</motion.div>
```

### ✅ APRÈS (Section éditable - code à implémenter)

```tsx
{/* Informations générales */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="col-span-2 bg-white rounded-xl border border-gray-200 p-6"
>
  {/* Header avec bouton Modifier */}
  <div className="flex items-center justify-between mb-4">
    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
      <User className="w-5 h-5 text-blue-600" />
      Informations générales
    </h2>
    
    {!editingGeneral ? (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          startEdit('general');
          setEditingGeneral(true);
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
      >
        <Edit2 className="w-4 h-4" />
        Modifier
      </motion.button>
    ) : (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => {
            saveEdit('general');
            setEditingGeneral(false);
          }}
          style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
          className="gap-1.5 text-white"
        >
          <Save className="w-4 h-4" />
          Sauvegarder
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            cancelEdit('general');
            setEditingGeneral(false);
          }}
          className="gap-1.5"
        >
          <X className="w-4 h-4" />
          Annuler
        </Button>
      </div>
    )}
  </div>
  
  {/* Champs avec composant EditableField */}
  <div className="grid grid-cols-2 gap-6">
    <EditableField
      label="Email"
      field="email"
      value={investor.email}
      type="email"
      icon={<Mail className="w-4 h-4 text-gray-400" />}
    />
    
    <EditableField
      label="Téléphone"
      field="phone"
      value={investor.phone}
      type="tel"
      icon={<Phone className="w-4 h-4 text-gray-400" />}
    />
    
    {investor.type === 'Corporate' && (
      <EditableField
        label="SIREN"
        field="siren"
        value={investor.siren}
        type="text"
        icon={<Building2 className="w-4 h-4 text-gray-400" />}
      />
    )}
    
    <EditableField
      label="Adresse"
      field="address"
      value={investor.address}
      type="text"
      icon={<MapPin className="w-4 h-4 text-gray-400" />}
    />
    
    <EditableField
      label="Code postal"
      field="postalCode"
      value={investor.postalCode}
      type="text"
    />
    
    <EditableField
      label="Ville"
      field="city"
      value={investor.city}
      type="text"
    />
    
    <EditableField
      label="Segment CRM"
      field="crmSegment"
      value={investor.crmSegment}
      type="select"
      options={[
        { value: 'Platinum', label: 'Platinum' },
        { value: 'Gold', label: 'Gold' },
        { value: 'Silver', label: 'Silver' },
        { value: 'Bronze', label: 'Bronze' }
      ]}
    />
    
    <EditableField
      label="Gestionnaire"
      field="analyst"
      value={investor.analyst}
      type="select"
      options={[
        { value: 'Sophie Martin', label: 'Sophie Martin' },
        { value: 'Thomas Bernard', label: 'Thomas Bernard' },
        { value: 'Marie Dubois', label: 'Marie Dubois' },
        { value: 'Pierre Laurent', label: 'Pierre Laurent' }
      ]}
      icon={<User className="w-4 h-4 text-gray-400" />}
    />
  </div>
</motion.div>
```

## 🎬 Démo interactive

### 1. Mode Affichage (par défaut)
- Les champs sont affichés en lecture seule
- Un bouton "Modifier" est visible en haut à droite
- Les boutons de copie fonctionnent normalement

### 2. Clic sur "Modifier"
- Le bouton "Modifier" disparaît
- Les boutons "Sauvegarder" et "Annuler" apparaissent
- Tous les champs deviennent des inputs éditables
- L'icône d'édition n'est plus visible

### 3. Modification des champs
- L'utilisateur peut taper dans les champs
- La validation se fait en temps réel
- Les erreurs s'affichent immédiatement en rouge sous le champ

### 4. Validation en temps réel

**Email invalide** :
```
test@      [INPUT FIELD]
❌ Format d'email invalide
```

**SIREN invalide** :
```
123456789   [INPUT FIELD]
❌ Numéro SIREN invalide (échec de la vérification)
```

**Téléphone invalide** :
```
123   [INPUT FIELD]
❌ Numéro de téléphone invalide (format: 0X XX XX XX XX)
```

### 5. Sauvegarde
- Clic sur "Sauvegarder"
- Si erreurs → Toast rouge "Veuillez corriger les erreurs"
- Si OK → Les données sont sauvegardées
- Toast vert "Modifications enregistrées"
- Retour au mode affichage

### 6. Annulation
- Clic sur "Annuler"
- Toutes les modifications sont annulées
- Toast bleu "Modifications annulées"
- Retour au mode affichage

## 📝 Résumé des changements

### Dans le state du composant (déjà fait) :
```tsx
const [editingGeneral, setEditingGeneral] = useState(false);
const [editedFields, setEditedFields] = useState<Partial<Investor>>({});
const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
```

### Les 3 fonctions principales (déjà implémentées) :
```tsx
startEdit(section) // Initialise l'édition
handleFieldChange(field, value) // Met à jour un champ + validation
saveEdit(section) // Valide et sauvegarde
cancelEdit(section) // Annule les modifications
```

### Le composant EditableField (déjà créé) :
- Affiche le champ en lecture ou écriture selon le mode
- Gère la validation automatiquement
- Affiche les erreurs

## 🚀 Pour finir l'implémentation

Il faut répéter ce pattern pour chaque section éditable :

1. **Informations générales** ✅ (exemple ci-dessus)
2. **Informations relationnelles**
3. **Informations personnelles**
4. **Espace investisseur**
5. **Informations fiscales**
6. **Informations bancaires**

Chaque section suit exactement le même pattern !
