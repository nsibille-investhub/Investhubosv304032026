/**
 * BigModal Component
 * 
 * Un composant de modale optimisé pour les wizards complexes et les formulaires volumineux.
 * 
 * Caractéristiques:
 * - Occupe ~75% de l'écran (w-[90vw] × h-[85vh])
 * - Max-width de 1000px pour une lisibilité optimale
 * - Parfait pour les wizards multi-étapes
 * - Effet glassmorphism sublime avec animations spectaculaires
 * 
 * Quand l'utiliser:
 * ✅ Wizards complexes en plusieurs étapes
 * ✅ Formulaires avec beaucoup de champs
 * ✅ Interfaces nécessitant beaucoup d'espace
 * 
 * Quand utiliser Dialog à la place:
 * ❌ Dialogues de confirmation simples
 * ❌ Formulaires courts (3-5 champs)
 * ❌ Pop-ups d'information
 */
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X, type LucideIcon } from "lucide-react"

import { Button } from "./button"
import { cn } from "./utils"

const BigModal = DialogPrimitive.Root

const BigModalTrigger = DialogPrimitive.Trigger

const BigModalPortal = DialogPrimitive.Portal

const BigModalClose = DialogPrimitive.Close

const BigModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50",
      // Glassmorphism overlay with gradient
      "bg-gradient-to-br from-black/40 via-slate-900/50 to-black/60",
      "backdrop-blur-md backdrop-saturate-150",
      // Animation sophistiquée
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "data-[state=open]:duration-500 data-[state=closed]:duration-300",
      className
    )}
    {...props}
  />
))
BigModalOverlay.displayName = DialogPrimitive.Overlay.displayName

const BigModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <BigModalPortal>
    <BigModalOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // Position
        "fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]",
        
        // Dimensions
        "w-[90vw] max-w-[1000px] h-[85vh]",
        
        // Glassmorphism & Design
        "bg-white/95 backdrop-blur-xl backdrop-saturate-150",
        "rounded-3xl",
        
        // Bordures et ombres sublimes
        "border border-white/20",
        "shadow-[0_0_80px_rgba(0,102,255,0.15),0_0_40px_rgba(0,194,255,0.1),0_20px_60px_rgba(0,0,0,0.3)]",
        
        // Effet de glow subtil
        "before:absolute before:inset-0 before:rounded-3xl",
        "before:bg-gradient-to-br before:from-blue-500/5 before:via-transparent before:to-cyan-500/5",
        "before:pointer-events-none",
        
        // Animation d'entrée spectaculaire
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        
        // Fade + Scale + Rotation légère à l'ouverture
        "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
        "data-[state=open]:zoom-in-90 data-[state=closed]:zoom-out-95",
        "data-[state=open]:duration-500 data-[state=closed]:duration-300",
        
        // Slide élégant
        "data-[state=open]:slide-in-from-bottom-8",
        "data-[state=closed]:slide-out-to-top-8",
        
        // Timing functions premium
        "data-[state=open]:ease-[cubic-bezier(0.16,1,0.3,1)]",
        "data-[state=closed]:ease-[cubic-bezier(0.7,0,0.84,0)]",
        
        "focus:outline-none",
        "overflow-hidden",
        
        className
      )}
      {...props}
    >
      {/* Shimmer effect subtil */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 animate-[shimmer_3s_ease-in-out_infinite]" 
             style={{
               animation: 'shimmer 3s ease-in-out infinite'
             }} 
        />
      </div>
      
      {/* Glow border effect */}
      <div className="absolute inset-0 rounded-3xl pointer-events-none">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-blue-400/20 via-transparent to-cyan-400/20 opacity-0 animate-pulse-slow" />
      </div>
      
      {children}
    </DialogPrimitive.Content>
  </BigModalPortal>
))
BigModalContent.displayName = DialogPrimitive.Content.displayName

const BigModalHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5",
      className
    )}
    {...props}
  />
)
BigModalHeader.displayName = "BigModalHeader"

const BigModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
BigModalFooter.displayName = "BigModalFooter"

const BigModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
BigModalTitle.displayName = DialogPrimitive.Title.displayName

const BigModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
BigModalDescription.displayName = DialogPrimitive.Description.displayName

/** Taille compacte : confirmations et formulaires courts, hauteur ajustée au contenu. */
const BIG_MODAL_COMPACT = "h-auto max-w-lg"

/**
 * En-tête de modale (référence : « Nouvelle souscription ») : icône dans un carré,
 * titre, sous-titre et bouton de fermeture.
 */
function BigModalPanelHeader({
  icon: Icon,
  title,
  subtitle,
  onClose,
  closeLabel,
  tone = "primary",
  children,
}: {
  icon: LucideIcon
  title: React.ReactNode
  subtitle?: React.ReactNode
  onClose: () => void
  closeLabel: string
  /** "danger" pour une action destructive. */
  tone?: "primary" | "danger"
  /** Sous le titre : étapes d'un assistant (WizardSteps). */
  children?: React.ReactNode
}) {
  return (
    <div className="px-8 py-4 bg-card border-b border-border">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "size-10 shrink-0 rounded-xl flex items-center justify-center shadow-sm",
              tone === "danger" ? "bg-red-600 text-white" : "bg-primary text-primary-foreground",
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <BigModalTitle className="text-xl font-bold text-foreground leading-tight">{title}</BigModalTitle>
            {subtitle ? (
              <BigModalDescription className="text-xs text-muted-foreground">{subtitle}</BigModalDescription>
            ) : null}
          </div>
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          aria-label={closeLabel}
          className="hover:bg-muted rounded-full h-8 w-8 shrink-0"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  )
}

/** Corps défilant de la modale. */
const BigModalBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex-1 overflow-y-auto px-8 py-6", className)} {...props} />
  ),
)
BigModalBody.displayName = "BigModalBody"

/** Pied de modale : action secondaire (Annuler, Retour) à gauche, actions principales à droite. */
function BigModalPanelFooter({ start, end }: { start?: React.ReactNode; end?: React.ReactNode }) {
  return (
    <div className="border-t border-border px-8 py-4 bg-muted">
      <div className="flex items-center justify-between gap-3">
        <div>{start}</div>
        <div className="flex items-center gap-2">{end}</div>
      </div>
    </div>
  )
}

export {
  BIG_MODAL_COMPACT,
  BigModalPanelHeader,
  BigModalBody,
  BigModalPanelFooter,
  BigModal,
  BigModalPortal,
  BigModalOverlay,
  BigModalClose,
  BigModalTrigger,
  BigModalContent,
  BigModalHeader,
  BigModalFooter,
  BigModalTitle,
  BigModalDescription,
}
