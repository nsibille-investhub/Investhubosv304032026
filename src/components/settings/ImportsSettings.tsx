import React from 'react';
import { ImportsLandingPage } from '../ImportsLandingPage';
import { toast } from 'sonner';

export function ImportsSettings() {
  // Afficher systématiquement la landing page pour l'instant
  return (
    <ImportsLandingPage 
      onEnableModule={() => {
        toast.info('Fonctionnalité à venir', {
          description: 'La configuration des imports sera bientôt disponible'
        });
      }}
    />
  );
}
