# Guide d'Implémentation : Investisseur Éditable

## Vue d'ensemble

J'ai créé un système d'édition complet pour tous les champs de l'investisseur avec :

### ✅ Composants créés

1. **EditableField.tsx** - Champ éditable individuel avec :
   - Mode affichage/édition
   - Validation en temps réel
   - Feedback visuel des erreurs
   - Boutons Sauvegarder/Annuler

2. **EditableSection.tsx** - Section éditable avec bouton Modifier en header

3. **validations.ts** - Utilitaires de validation pour :
   - Email
   - Téléphone français (0X XX XX XX XX ou +33)
   - SIREN (9 chiffres + validation Luhn)
   - IBAN français (27 caractères + validation mod-97)
   - BIC/SWIFT (8 ou 11 caractères)
   - TIN/NIF (13 chiffres)
   - Code postal (5 chiffres)
   - Date de naissance (pas dans le futur, âge minimum 18 ans)
   - Montants (positifs uniquement)

### 🎨 UX

- **Mode édition par section** : Cliquer sur "Modifier" active l'édition pour toute la section
- **Validation en temps réel** : Les erreurs s'affichent immédiatement sous le champ
- **Feedback visuel** : 
  - Champs en édition : bordure bleue
  - Erreurs : texte rouge + icône
  - Succès : toast vert
- **Sauvegarde explicite** : Boutons "Sauvegarder" et "Annuler" clairs
- **Hover sur champs** : Icône d'édition apparaît au survol

### 📋 Check-list Implementation

Pour finaliser l'implémentation, il faut :

1. ✅ Créer les composants EditableField et EditableSection
2. ✅ Créer les utilitaires de validation
3. ⏳ Mettre à jour InvestorDetailPage.tsx pour :
   - Importer les composants et validations
   - Ajouter les états d'édition
   - Remplacer les sections statiques par des versions éditables
   - Gérer la sauvegarde des modifications

### 🔧 Modifications à apporter à InvestorDetailPage

Pour chaque section éditable, remplacer la structure actuelle :

```tsx
// AVANT (statique)
<motion.div className="bg-white rounded-xl border border-gray-200 p-6">
  <h2>Informations générales</h2>
  <div className="grid grid-cols-2 gap-6">
    <div>
      <label>Email</label>
      <span>{investor.email}</span>
    </div>
  </div>
</motion.div>

// APRÈS (éditable)
<motion.div className="bg-white rounded-xl border border-gray-200 p-6">
  <div className="flex items-center justify-between mb-4">
    <h2 className="flex items-center gap-2">
      <User className="w-5 h-5 text-blue-600" />
      Informations générales
    </h2>
    {!editingGeneral ? (
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          startEdit('general');
          setEditingGeneral(true);
        }}
      >
        <Edit2 className="w-4 h-4 mr-1.5" />
        Modifier
      </Button>
    ) : (
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => {
            saveEdit('general');
            setEditingGeneral(false);
          }}
        >
          <Save className="w-4 h-4 mr-1.5" />
          Sauvegarder
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            cancelEdit('general');
            setEditingGeneral(false);
          }}
        >
          <X className="w-4 h-4 mr-1.5" />
          Annuler
        </Button>
      </div>
    )}
  </div>
  
  <div className="grid grid-cols-2 gap-6">
    <EditableField
      label="Email"
      field="email"
      value={investor.email}
      type="email"
      icon={<Mail className="w-4 h-4 text-gray-400" />}
    />
  </div>
</motion.div>
```

### 🎯 Sections à rendre éditables

1. **Informations générales** (`editingGeneral`)
   - Prénom/Nom (ou Nom complet)
   - SIREN (Corporate uniquement)
   - Email (avec validation)
   - Téléphone (avec validation)
   - Adresse complète
   - Segment CRM (select)
   - Gestionnaire (select)
   - Partenaire (select)

2. **Informations relationnelles** (`editingRelationship`)
   - Statut (select)
   - Date d'entrée en relation
   - Source de référence (select)
   - Optin Marketing (toggle)

3. **Informations personnelles** (`editingPersonal`) - Individual uniquement
   - Date de naissance (avec validation)
   - Lieu de naissance
   - Pays de naissance (select)
   - Nationalité (select)
   - Langue (select)
   - Situation de famille (select)
   - Régime matrimonial (select si marié)

4. **Espace investisseur** (`editingPortal`)
   - Statut actif/inactif (toggle)
   - Portail V2 activé (toggle)
   - Bouton réinitialisation mot de passe

5. **Informations fiscales** (`editingFiscal`)
   - Résidence fiscale (select)
   - Adresse fiscale complète
   - TIN/NIF (avec validation)

6. **Informations bancaires** (`editingBank`)
   - IBAN (avec validation stricte)
   - BIC (avec validation)

### 💡 Exemples de validation

```typescript
// SIREN
validateSIREN("123456782") 
// ✅ { valid: true }

validateSIREN("123456789")
// ❌ { valid: false, error: "Numéro SIREN invalide (échec de la vérification)" }

// IBAN
validateIBAN("FR76 3000 6000 0112 3456 7890 189")
// ✅ { valid: true }

validateIBAN("FR76 3000 6000 0112 3456 7890 188")
// ❌ { valid: false, error: "IBAN invalide (échec de la vérification mod-97)" }

// Email
validateEmail("test@example.com")
// ✅ { valid: true }

validateEmail("invalid-email")
// ❌ { valid: false, error: "Format d'email invalide" }
```

### 🚀 Prochaines étapes

Pour terminer l'implémentation, il faut :

1. Modifier toutes les sections de `InvestorDetailPage.tsx` pour utiliser le pattern éditable
2. Ajouter la persistance des données (actuellement en mémoire seulement)
3. Tester toutes les validations
4. Ajouter des messages de confirmation pour les modifications critiques

Cette architecture permet une édition simple, fluide et sécurisée de toutes les informations investisseur avec des validations robustes.
