import { motion } from 'motion/react';
import { ChevronDown, ChevronRight, User } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';

type PhysicalPerson = {
  id: string;
  fullName: string;
  role?: string;
};

interface OneToManyPersonsCellProps {
  persons: PhysicalPerson[];
  label?: string;
}

export function OneToManyPersonsCell({ persons, label = 'Personnes physiques liées' }: OneToManyPersonsCellProps) {
  if (persons.length === 0) {
    return <span className="text-xs text-gray-400 italic">Aucune personne liée</span>;
  }

  const firstPerson = persons[0];
  const remainingCount = persons.length - 1;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex flex-col items-start gap-1 text-xs group w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-primary transition-colors w-full">
            <span className="text-gray-400 group-hover:text-primary transition-colors flex-shrink-0">
              <User className="w-3 h-3" />
            </span>
            <span className="truncate max-w-[140px] group-hover:underline" title={firstPerson.fullName}>
              {firstPerson.fullName}
            </span>
            <ChevronRight className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-all flex-shrink-0" />
          </div>
          {remainingCount > 0 && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1 text-primary transition-colors ml-[18px]"
            >
              <span className="font-medium">+{remainingCount} more</span>
              <ChevronDown className="w-3 h-3" />
            </motion.div>
          )}
        </motion.button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[360px] p-0"
        align="start"
        side="right"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{label}</h3>
              <p className="text-xs text-gray-500">
                {persons.length} personne{persons.length > 1 ? 's' : ''} disponible{persons.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
            {persons.map((person, index) => (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`rounded-lg border p-3 ${
                  index === 0 ? 'bg-blue-50/50 border-blue-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <p className="text-sm font-medium text-gray-900">{person.fullName}</p>
                {person.role && <p className="text-xs text-gray-600 mt-1">{person.role}</p>}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}
