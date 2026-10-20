import * as React from 'react';
import { useTranslation } from '../../utils/languageContext';
import { Input } from './input';
import { Label } from './label';
import { cn } from './utils';

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  /** Message d'erreur : remplace l'aide et passe en rouge. */
  error?: string;
  hint?: string;
  /** Libellé lu par les lecteurs d'écran seulement (en-tête de colonne déjà visible). */
  hideLabel?: boolean;
  /** Contenu aligné à droite du libellé (sélecteur de mode...). */
  labelAside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** Champ de formulaire : libellé, astérisque si obligatoire, contrôle, aide ou erreur dessous. */
export function FormField({ id, label, required, error, hint, hideLabel, labelAside, className, children }: FormFieldProps) {
  const { t } = useTranslation();
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className={cn('flex items-center justify-between gap-2', hideLabel && 'sr-only')}>
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && (
            <span className="ml-0.5 text-destructive" aria-label={t('common.formField.required')}>
              *
            </span>
          )}
        </Label>
        {labelAside}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

type SuffixInputProps = React.ComponentProps<typeof Input> & { suffix: string };

/** Saisie numérique alignée à droite, avec son unité (%, €, €/titre) à côté. */
export function SuffixInput({ suffix, className, ...props }: SuffixInputProps) {
  return (
    <div className="flex items-center gap-2">
      <Input inputMode="decimal" className={cn('text-right tabular-nums', className)} {...props} />
      <span className="shrink-0 text-xs text-muted-foreground">{suffix}</span>
    </div>
  );
}
