import { FileText } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { formatDateTime } from '../utils/formatters';

export interface SubscriptionNote {
  content: string;
  author: string;
  date: Date | string;
}

interface NotesCellProps {
  notes: SubscriptionNote[];
}

export function NotesCell({ notes }: NotesCellProps) {
  if (!notes.length) {
    return <span className="text-sm text-gray-400 dark:text-gray-600">-</span>;
  }

  const lastNote = notes[0];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto max-w-[220px] justify-start gap-2 px-0 text-left hover:bg-transparent"
        >
          <FileText className="h-3.5 w-3.5 flex-shrink-0 text-[#0A3D4A]" />
          <span className="truncate text-sm text-[#0A3D4A]">{lastNote.content}</span>
          <Badge className="border-[#D9D8CB] bg-[#F8F7F1] text-[#0A3D4A]">
            {notes.length}
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Notes ({notes.length})</DialogTitle>
        </DialogHeader>
        <div className="max-h-[380px] space-y-3 overflow-y-auto pr-1">
          {notes.map((note, index) => (
            <div key={`${note.author}-${index}`} className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-sm text-foreground">{note.content}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {note.author} · {formatDateTime(note.date)}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
