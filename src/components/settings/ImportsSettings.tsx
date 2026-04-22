import React from 'react';
import { ImportsLandingPage } from '../ImportsLandingPage';
import { toast } from 'sonner';

export function ImportsSettings() {
  // Always display the landing page for now
  return (
    <ImportsLandingPage
      onEnableModule={() => {
        toast.info('Coming soon', {
          description: 'Imports configuration will be available soon'
        });
      }}
    />
  );
}
