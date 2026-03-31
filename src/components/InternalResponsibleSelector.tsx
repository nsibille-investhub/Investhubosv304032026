import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, User } from 'lucide-react';
import { cn } from './ui/utils';

interface ResponsibleUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

const INTERNAL_RESPONSIBLES: ResponsibleUser[] = [
  { id: '1', name: 'Jean Dault', email: 'jean.dault@investhub.io', avatar: 'JD' },
  { id: '2', name: 'Sophie Martin', email: 'sophie.martin@investhub.io', avatar: 'SM' },
  { id: '3', name: 'Marc Dubois', email: 'marc.dubois@investhub.io', avatar: 'MD' },
  { id: '4', name: 'Claire Rousseau', email: 'claire.rousseau@investhub.io', avatar: 'CR' },
  { id: '5', name: 'Thomas Bernard', email: 'thomas.bernard@investhub.io', avatar: 'TB' },
  { id: '6', name: 'Emma Leroy', email: 'emma.leroy@investhub.io', avatar: 'EL' },
];

interface InternalResponsibleSelectorProps {
  value?: string | null;
  onChange: (nextValue: string) => void;
  className?: string;
}

export function InternalResponsibleSelector({ value, onChange, className }: InternalResponsibleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedResponsible = useMemo(
    () => INTERNAL_RESPONSIBLES.find((person) => person.name === value),
    [value]
  );

  const filteredResponsibles = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return INTERNAL_RESPONSIBLES;
    return INTERNAL_RESPONSIBLES.filter(
      (person) =>
        person.name.toLowerCase().includes(query) || person.email.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (person: ResponsibleUser) => {
    onChange(person.name);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={cn(
          'group w-full min-w-[180px] rounded-xl border px-2.5 py-2 transition-all duration-200',
          isOpen
            ? 'border-blue-300 bg-blue-50 shadow-sm'
            : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/40'
        )}
      >
        <div className="flex items-center gap-2">
          {selectedResponsible ? (
            <>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-[11px] font-semibold text-white">
                {selectedResponsible.avatar}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-xs font-semibold text-gray-900">{selectedResponsible.name}</p>
                <p className="truncate text-[10px] text-gray-500">{selectedResponsible.email}</p>
              </div>
            </>
          ) : (
            <>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <User className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs text-gray-500">Assigner</span>
            </>
          )}
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 flex-shrink-0 text-gray-400 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </div>
      </button>

      {isOpen && (
        <div
          className="absolute left-0 top-full z-50 mt-1.5 w-[280px] rounded-xl border border-gray-200 bg-white shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="border-b border-gray-100 p-2">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2">
              <Search className="h-3.5 w-3.5 text-gray-400" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Rechercher un responsable..."
                className="w-full bg-transparent text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-1.5">
            {filteredResponsibles.length > 0 ? (
              filteredResponsibles.map((person) => {
                const isSelected = person.name === selectedResponsible?.name;
                return (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => handleSelect(person)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors',
                      isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                    )}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-semibold text-white">
                      {person.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-gray-900">{person.name}</p>
                      <p className="truncate text-[11px] text-gray-500">{person.email}</p>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-5 text-center text-xs text-gray-500">Aucun responsable trouvé</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
