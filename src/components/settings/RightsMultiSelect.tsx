import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, CheckSquare, Square, MinusSquare } from 'lucide-react';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { motion, AnimatePresence } from 'motion/react';

interface RightsMultiSelectProps {
  selectedRights: string[];
  onSelectionChange: (rights: string[]) => void;
  availableRights: string[];
}

interface RightCategory {
  name: string;
  rights: string[];
}

export function RightsMultiSelect({ selectedRights, onSelectionChange, availableRights }: RightsMultiSelectProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Parse les droits et les organise par catégorie
  const categorizedRights = useMemo(() => {
    const categories = new Map<string, string[]>();
    
    availableRights.forEach(right => {
      if (right.includes(' > ')) {
        const [category, ...rest] = right.split(' > ');
        const rightName = rest.join(' > ');
        if (!categories.has(category)) {
          categories.set(category, []);
        }
        categories.get(category)!.push(right);
      } else {
        if (!categories.has('Général')) {
          categories.set('Général', []);
        }
        categories.get('Général')!.push(right);
      }
    });

    // Convertir en tableau et trier
    const result: RightCategory[] = Array.from(categories.entries())
      .map(([name, rights]) => ({
        name,
        rights: rights.sort()
      }))
      .sort((a, b) => {
        // "Général" en premier
        if (a.name === 'Général') return -1;
        if (b.name === 'Général') return 1;
        return a.name.localeCompare(b.name);
      });

    return result;
  }, [availableRights]);

  // Filtrer les catégories et droits selon la recherche
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categorizedRights;

    const query = searchQuery.toLowerCase();
    return categorizedRights
      .map(category => ({
        ...category,
        rights: category.rights.filter(right => 
          right.toLowerCase().includes(query)
        )
      }))
      .filter(category => category.rights.length > 0);
  }, [categorizedRights, searchQuery]);

  // Auto-expand les catégories avec des résultats de recherche
  React.useEffect(() => {
    if (searchQuery) {
      setExpandedCategories(filteredCategories.map(c => c.name));
    }
  }, [searchQuery, filteredCategories]);

  const toggleRight = (right: string) => {
    if (selectedRights.includes(right)) {
      onSelectionChange(selectedRights.filter(r => r !== right));
    } else {
      onSelectionChange([...selectedRights, right]);
    }
  };

  const selectAllInCategory = (category: RightCategory) => {
    const categoryRights = category.rights;
    const newSelection = [...selectedRights];
    
    categoryRights.forEach(right => {
      if (!newSelection.includes(right)) {
        newSelection.push(right);
      }
    });
    
    onSelectionChange(newSelection);
  };

  const deselectAllInCategory = (category: RightCategory) => {
    const categoryRights = category.rights;
    onSelectionChange(selectedRights.filter(r => !categoryRights.includes(r)));
  };

  const getCategorySelectionState = (category: RightCategory): 'all' | 'some' | 'none' => {
    const selectedCount = category.rights.filter(r => selectedRights.includes(r)).length;
    if (selectedCount === 0) return 'none';
    if (selectedCount === category.rights.length) return 'all';
    return 'some';
  };

  const getDisplayName = (right: string, categoryName: string) => {
    if (categoryName === 'Général') return right;
    return right.replace(`${categoryName} > `, '');
  };

  return (
    <div className="space-y-3">
      {/* Header avec recherche */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-600">
            <span className="font-medium text-gray-900">{selectedRights.length}</span> droit{selectedRights.length > 1 ? 's' : ''} sélectionné{selectedRights.length > 1 ? 's' : ''}
          </div>
          {selectedRights.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onSelectionChange([])}
              className="h-7 text-xs text-gray-600 hover:text-red-600"
            >
              Tout désélectionner
            </Button>
          )}
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher un droit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Liste des catégories */}
      <div className="border border-gray-200 rounded-lg bg-white max-h-[450px] overflow-y-auto">
        {filteredCategories.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Aucun droit trouvé pour "{searchQuery}"
          </div>
        ) : (
          <Accordion 
            type="multiple" 
            value={expandedCategories}
            onValueChange={setExpandedCategories}
            className="w-full"
          >
            {filteredCategories.map((category, index) => {
              const selectionState = getCategorySelectionState(category);
              const selectedInCategory = category.rights.filter(r => selectedRights.includes(r)).length;

              return (
                <AccordionItem 
                  key={category.name} 
                  value={category.name}
                  className={index === filteredCategories.length - 1 ? 'border-b-0' : ''}
                >
                  <div className="flex items-center gap-2 pr-3">
                    {/* Checkbox de la catégorie */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectionState === 'all') {
                          deselectAllInCategory(category);
                        } else {
                          selectAllInCategory(category);
                        }
                      }}
                      className="pl-4 pr-2 py-3 hover:bg-gray-50 transition-colors"
                    >
                      {selectionState === 'all' && (
                        <CheckSquare className="w-4 h-4 text-green-600" />
                      )}
                      {selectionState === 'some' && (
                        <MinusSquare className="w-4 h-4 text-green-600" />
                      )}
                      {selectionState === 'none' && (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>

                    {/* Trigger de l'accordéon */}
                    <AccordionTrigger className="flex-1 hover:no-underline py-3 pr-0">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm text-gray-900">
                          {category.name}
                        </span>
                        <div className="flex items-center gap-2 mr-2">
                          <span className="text-xs text-gray-500">
                            {selectedInCategory > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#DCFDBC] text-gray-900 mr-1.5">
                                {selectedInCategory}
                              </span>
                            )}
                            {category.rights.length}
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                  </div>

                  <AccordionContent className="pb-2">
                    <div className="space-y-0.5 pl-12 pr-4">
                      {category.rights.map((right) => {
                        const isSelected = selectedRights.includes(right);
                        const displayName = getDisplayName(right, category.name);
                        
                        return (
                          <motion.button
                            key={right}
                            type="button"
                            onClick={() => toggleRight(right)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                              isSelected
                                ? 'bg-green-50 hover:bg-green-100'
                                : 'hover:bg-gray-50'
                            }`}
                            initial={false}
                            animate={{
                              backgroundColor: isSelected ? 'rgb(240 253 244)' : 'transparent'
                            }}
                          >
                            <Checkbox 
                              checked={isSelected}
                              className="pointer-events-none"
                            />
                            <span className={`text-sm flex-1 ${
                              isSelected ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {displayName}
                            </span>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex-shrink-0"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              </motion.div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>

      {/* Résumé des sélections par catégorie (optionnel, pour voir rapidement) */}
      {selectedRights.length > 0 && !searchQuery && (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="text-xs text-gray-600 mb-2">Sélection actuelle :</div>
          <div className="flex flex-wrap gap-1.5">
            {categorizedRights
              .filter(category => category.rights.some(r => selectedRights.includes(r)))
              .map(category => {
                const count = category.rights.filter(r => selectedRights.includes(r)).length;
                return (
                  <div
                    key={category.name}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-white border border-gray-200 text-xs"
                  >
                    <span className="text-gray-700">{category.name}</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#DCFDBC] text-gray-900">
                      {count}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
