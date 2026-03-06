// Utilitaires de validation pour les champs investisseur

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Validation email
export function validateEmail(email: string): ValidationResult {
  if (!email) return { valid: true }; // Optionnel
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Format d\'email invalide' };
  }
  
  return { valid: true };
}

// Validation téléphone français
export function validatePhone(phone: string): ValidationResult {
  if (!phone) return { valid: true }; // Optionnel
  
  // Supprimer tous les espaces, tirets et points
  const cleanPhone = phone.replace(/[\s\-\.]/g, '');
  
  // Vérifier le format français : 10 chiffres commençant par 0, ou format international +33
  const frenchPhoneRegex = /^(?:0[1-9]|(?:\+33|0033)[1-9])\d{8}$/;
  
  if (!frenchPhoneRegex.test(cleanPhone)) {
    return { valid: false, error: 'Numéro de téléphone invalide (format: 0X XX XX XX XX)' };
  }
  
  return { valid: true };
}

// Validation SIREN (9 chiffres)
export function validateSIREN(siren: string): ValidationResult {
  if (!siren) return { valid: true }; // Optionnel
  
  const cleanSiren = siren.replace(/\s/g, '');
  
  if (!/^\d{9}$/.test(cleanSiren)) {
    return { valid: false, error: 'Le SIREN doit contenir exactement 9 chiffres' };
  }
  
  // Validation de la clé de Luhn
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let digit = parseInt(cleanSiren[i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  
  if (sum % 10 !== 0) {
    return { valid: false, error: 'Numéro SIREN invalide (échec de la vérification)' };
  }
  
  return { valid: true };
}

// Validation IBAN français
export function validateIBAN(iban: string): ValidationResult {
  if (!iban) return { valid: true }; // Optionnel
  
  const cleanIban = iban.replace(/\s/g, '').toUpperCase();
  
  // Vérifier la longueur (27 caractères pour la France)
  if (!cleanIban.startsWith('FR') || cleanIban.length !== 27) {
    return { valid: false, error: 'Format IBAN français invalide (27 caractères commençant par FR)' };
  }
  
  // Vérifier que ce sont bien des caractères alphanumériques
  if (!/^[A-Z0-9]+$/.test(cleanIban)) {
    return { valid: false, error: 'L\'IBAN ne peut contenir que des lettres et des chiffres' };
  }
  
  // Validation mod-97 simplifiée
  const rearranged = cleanIban.slice(4) + cleanIban.slice(0, 4);
  const numericIban = rearranged.replace(/[A-Z]/g, (char) => (char.charCodeAt(0) - 55).toString());
  
  // Calcul mod 97 par morceaux pour éviter les dépassements
  let remainder = numericIban;
  while (remainder.length > 2) {
    const block = remainder.slice(0, 9);
    remainder = (parseInt(block) % 97) + remainder.slice(9);
  }
  
  if (parseInt(remainder) % 97 !== 1) {
    return { valid: false, error: 'IBAN invalide (échec de la vérification mod-97)' };
  }
  
  return { valid: true };
}

// Validation BIC/SWIFT
export function validateBIC(bic: string): ValidationResult {
  if (!bic) return { valid: true }; // Optionnel
  
  const cleanBic = bic.replace(/\s/g, '').toUpperCase();
  
  // BIC: 8 ou 11 caractères
  if (!/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(cleanBic)) {
    return { valid: false, error: 'Format BIC invalide (8 ou 11 caractères alphanumériques)' };
  }
  
  return { valid: true };
}

// Validation TIN/NIF (numéro d'identification fiscale)
export function validateTIN(tin: string): ValidationResult {
  if (!tin) return { valid: true }; // Optionnel
  
  const cleanTin = tin.replace(/\s/g, '');
  
  // TIN français: généralement 13 chiffres
  if (!/^\d{13}$/.test(cleanTin)) {
    return { valid: false, error: 'Le TIN/NIF français doit contenir 13 chiffres' };
  }
  
  return { valid: true };
}

// Validation code postal français
export function validatePostalCode(postalCode: string): ValidationResult {
  if (!postalCode) return { valid: true }; // Optionnel
  
  if (!/^\d{5}$/.test(postalCode)) {
    return { valid: false, error: 'Le code postal doit contenir 5 chiffres' };
  }
  
  return { valid: true };
}

// Validation date (pas dans le futur pour date de naissance)
export function validateBirthDate(dateString: string): ValidationResult {
  if (!dateString) return { valid: true }; // Optionnel
  
  const date = new Date(dateString);
  const now = new Date();
  
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Date invalide' };
  }
  
  if (date > now) {
    return { valid: false, error: 'La date de naissance ne peut pas être dans le futur' };
  }
  
  // Vérifier que la personne a au moins 18 ans
  const age = now.getFullYear() - date.getFullYear();
  if (age < 18) {
    return { valid: false, error: 'L\'investisseur doit avoir au moins 18 ans' };
  }
  
  if (age > 120) {
    return { valid: false, error: 'Date de naissance invalide (âge > 120 ans)' };
  }
  
  return { valid: true };
}

// Validation date générique (dans le passé)
export function validatePastDate(dateString: string): ValidationResult {
  if (!dateString) return { valid: true }; // Optionnel
  
  const date = new Date(dateString);
  const now = new Date();
  
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Date invalide' };
  }
  
  if (date > now) {
    return { valid: false, error: 'La date ne peut pas être dans le futur' };
  }
  
  return { valid: true };
}

// Validation texte non vide
export function validateRequired(value: string, fieldName: string = 'Ce champ'): ValidationResult {
  if (!value || value.trim() === '') {
    return { valid: false, error: `${fieldName} est obligatoire` };
  }
  
  return { valid: true };
}

// Validation longueur minimum
export function validateMinLength(value: string, minLength: number, fieldName: string = 'Ce champ'): ValidationResult {
  if (!value) return { valid: true }; // Optionnel
  
  if (value.length < minLength) {
    return { valid: false, error: `${fieldName} doit contenir au moins ${minLength} caractères` };
  }
  
  return { valid: true };
}

// Validation montant (nombre positif)
export function validateAmount(amount: string): ValidationResult {
  if (!amount) return { valid: true }; // Optionnel
  
  const num = parseFloat(amount);
  
  if (isNaN(num)) {
    return { valid: false, error: 'Montant invalide' };
  }
  
  if (num < 0) {
    return { valid: false, error: 'Le montant ne peut pas être négatif' };
  }
  
  return { valid: true };
}
