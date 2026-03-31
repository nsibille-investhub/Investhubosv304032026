type SpecificAudienceProps = {
  investor: string;
  structure?: string;
  subscription?: string;
  className?: string;
};

export function SpecificAudience({
  investor,
  structure,
  subscription,
  className = 'text-xs leading-snug text-gray-500',
}: SpecificAudienceProps) {
  const details = [`Investisseur: ${investor}`];

  if (structure) {
    details.push(`Structure: ${structure}`);
  }

  if (subscription) {
    details.push(`Souscription: ${subscription}`);
  }

  return <p className={className}>{details.join(' · ')}</p>;
}
