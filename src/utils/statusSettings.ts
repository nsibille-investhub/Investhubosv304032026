import { User, Users, Building, TrendingUp, Star, CheckCircle, Clock, Archive, Target, Zap, UserCheck, UserPlus, AlertCircle, Award, Briefcase, DollarSign, Heart, Shield, Eye, FileText, Handshake, TrendingDown, XCircle, FileCheck, Rocket, Layers, Calendar, Tag } from 'lucide-react';

// Available icons with labels
export const availableIcons = [
  { name: 'User', component: User, label: 'Utilisateur' },
  { name: 'Users', component: Users, label: 'Groupe' },
  { name: 'Building', component: Building, label: 'Entreprise' },
  { name: 'TrendingUp', component: TrendingUp, label: 'Croissance' },
  { name: 'Star', component: Star, label: 'Étoile' },
  { name: 'CheckCircle', component: CheckCircle, label: 'Validé' },
  { name: 'Clock', component: Clock, label: 'En attente' },
  { name: 'Archive', component: Archive, label: 'Archive' },
  { name: 'Target', component: Target, label: 'Cible' },
  { name: 'Zap', component: Zap, label: 'Rapide' },
  { name: 'UserCheck', component: UserCheck, label: 'Vérifié' },
  { name: 'UserPlus', component: UserPlus, label: 'Nouveau' },
  { name: 'AlertCircle', component: AlertCircle, label: 'Alerte' },
  { name: 'Award', component: Award, label: 'Récompense' },
  { name: 'Briefcase', component: Briefcase, label: 'Professionnel' },
  { name: 'DollarSign', component: DollarSign, label: 'Finance' },
  { name: 'Heart', component: Heart, label: 'Favori' },
  { name: 'Shield', component: Shield, label: 'Protection' },
  { name: 'Eye', component: Eye, label: 'Observation' },
  { name: 'FileText', component: FileText, label: 'Document' },
  { name: 'Handshake', component: Handshake, label: 'Accord' },
  { name: 'TrendingDown', component: TrendingDown, label: 'Déclin' },
  { name: 'XCircle', component: XCircle, label: 'Fermé' },
  { name: 'FileCheck', component: FileCheck, label: 'Validé' },
  { name: 'Rocket', component: Rocket, label: 'Lancement' },
  { name: 'Layers', component: Layers, label: 'Étapes' },
  { name: 'Calendar', component: Calendar, label: 'Calendrier' },
  { name: 'Tag', component: Tag, label: 'Étiquette' }
];

// Available colors with semantic naming
export const availableColors = [
  { 
    name: 'Bleu', 
    value: 'bg-blue-100 text-blue-700 border-blue-200',
    preview: 'bg-blue-500',
    description: 'Confiance, stabilité'
  },
  { 
    name: 'Vert', 
    value: 'bg-green-100 text-green-700 border-green-200',
    preview: 'bg-green-500',
    description: 'Succès, actif'
  },
  { 
    name: 'Jaune', 
    value: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    preview: 'bg-yellow-500',
    description: 'Attention, en cours'
  },
  { 
    name: 'Orange', 
    value: 'bg-orange-100 text-orange-700 border-orange-200',
    preview: 'bg-orange-500',
    description: 'Priorité, action'
  },
  { 
    name: 'Rouge', 
    value: 'bg-red-100 text-red-700 border-red-200',
    preview: 'bg-red-500',
    description: 'Urgent, bloqué'
  },
  { 
    name: 'Rose', 
    value: 'bg-pink-100 text-pink-700 border-pink-200',
    preview: 'bg-pink-500',
    description: 'Important'
  },
  { 
    name: 'Violet', 
    value: 'bg-purple-100 text-purple-700 border-purple-200',
    preview: 'bg-purple-500',
    description: 'Premium'
  },
  { 
    name: 'Indigo', 
    value: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    preview: 'bg-indigo-500',
    description: 'Information'
  },
  { 
    name: 'Gris', 
    value: 'bg-gray-100 text-gray-700 border-gray-200',
    preview: 'bg-gray-500',
    description: 'Neutre, inactif'
  },
  { 
    name: 'Slate', 
    value: 'bg-slate-100 text-slate-700 border-slate-200',
    preview: 'bg-slate-500',
    description: 'Secondaire'
  },
  { 
    name: 'Cyan', 
    value: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    preview: 'bg-cyan-500',
    description: 'Innovation'
  },
  { 
    name: 'Teal', 
    value: 'bg-teal-100 text-teal-700 border-teal-200',
    preview: 'bg-teal-500',
    description: 'Équilibre'
  }
];

export interface BaseStatus {
  id: string;
  name: string;
  translations: {
    fr: string;
    en: string;
    es: string;
  };
  color: string;
  icon: string;
  rank: number;
  count?: number;
}
